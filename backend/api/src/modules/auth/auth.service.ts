import { Inject, Injectable, Logger } from "@nestjs/common";
import type {
  AuthTokensDto,
  OtpRequest,
  OtpRequestedDto,
  OtpVerify,
  SessionDto,
} from "@genia/types";
import { Errors } from "../../common/errors";
import { CLOCK, CONFIG, RATE_LIMITER, SMS_PROVIDER } from "../../common/tokens";
import type { AppConfig } from "../../config/config";
import type { Clock } from "../../domain/auth/clock";
import { generateOtp, hashOtp, otpMessage, verifyOtpHash } from "../../domain/auth/otp";
import { maskPhone, normalizePhone } from "../../domain/auth/phone";
import type { RateLimiter } from "../../domain/auth/rate-limit";
import { generateRefreshToken, hashToken, signAccessToken } from "../../domain/auth/tokens";
import type { SmsProvider } from "../sms/sms.provider";
import { UsersRepository, type UserRow } from "../users/users.repository";
import { toUserDto } from "../users/users.service";
import { OtpRepository } from "./otp.repository";
import { SessionsRepository } from "./sessions.repository";

export interface ClientInfo {
  ip: string | null;
  userAgent: string | null;
}

const MASKED_ACK = (c: AppConfig): OtpRequestedDto => ({
  expiresInSeconds: c.OTP_TTL_SECONDS,
  resendAfterSeconds: c.OTP_RESEND_COOLDOWN_SECONDS,
});

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(RATE_LIMITER) private readonly limiter: RateLimiter,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(OtpRepository) private readonly otps: OtpRepository,
    @Inject(SessionsRepository) private readonly sessions: SessionsRepository,
  ) {}

  private parsePhone(raw: string) {
    const p = normalizePhone(raw, this.config.DEFAULT_COUNTRY);
    if (!p) throw Errors.validation({ fields: { phone: ["not a valid phone number"] } });
    return p;
  }

  private async enforce(key: string, limit: number, windowSeconds: number): Promise<void> {
    const r = await this.limiter.hit(key, limit, windowSeconds);
    if (!r.allowed) throw Errors.rateLimited(r.retryAfterSeconds);
  }

  async requestOtp(input: OtpRequest, client: ClientInfo): Promise<OtpRequestedDto> {
    const c = this.config;
    const phone = this.parsePhone(input.phone);
    const now = this.clock.now();

    if (client.ip) await this.enforce(`otp:req:ip:${client.ip}`, c.OTP_REQUESTS_PER_IP, 3600);
    if (c.OTP_RESEND_COOLDOWN_SECONDS > 0)
      await this.enforce(`otp:cool:${phone.e164}`, 1, c.OTP_RESEND_COOLDOWN_SECONDS);
    await this.enforce(
      `otp:req:phone:${phone.e164}`,
      c.OTP_REQUESTS_PER_PHONE,
      c.OTP_REQUESTS_PER_PHONE_WINDOW_SECONDS,
    );

    const code = generateOtp(c.OTP_LENGTH);
    const challengeId = await this.otps.create(
      phone.e164,
      hashOtp(code, phone.e164, c.OTP_PEPPER),
      new Date(now.getTime() + c.OTP_TTL_SECONDS * 1000),
      client.ip,
      now,
    );

    try {
      await this.sms.send(phone.e164, otpMessage(input.locale ?? "rw", code, c.OTP_TTL_SECONDS));
    } catch (err) {
      await this.otps.invalidate(challengeId, now);
      // ALERT: delivery failures are tracked by the SMS_DELIVERY_FAILED log line (see docs/runbooks/otp-delivery-failure.md).
      this.logger.error(
        `SMS_DELIVERY_FAILED provider=${this.sms.name} phone=${maskPhone(phone.e164)} reason=${(err as Error).message}`,
      );
      throw Errors.smsFailed();
    }
    return MASKED_ACK(c);
  }

  async verifyOtp(input: OtpVerify, client: ClientInfo): Promise<AuthTokensDto> {
    const c = this.config;
    const phone = this.parsePhone(input.phone);
    const now = this.clock.now();

    if (client.ip) await this.enforce(`otp:verify:ip:${client.ip}`, c.OTP_VERIFY_PER_IP, 3600);
    await this.enforce(`otp:verify:phone:${phone.e164}`, c.OTP_VERIFY_PER_PHONE, 600);

    const challenge = await this.otps.latestOpen(phone.e164, now);
    if (!challenge) throw Errors.invalidOtp(0);

    const attempts = await this.otps.incrementAttempts(challenge.id);
    if (attempts > c.OTP_MAX_ATTEMPTS) {
      throw Errors.locked(
        Math.max(1, Math.ceil((challenge.expires_at.getTime() - now.getTime()) / 1000)),
        "Too many wrong codes. Request a new code",
      );
    }
    if (!verifyOtpHash(input.code, phone.e164, c.OTP_PEPPER, challenge.code_hash)) {
      throw Errors.invalidOtp(Math.max(0, c.OTP_MAX_ATTEMPTS - attempts));
    }
    if (!(await this.otps.consume(challenge.id, now))) throw Errors.invalidOtp(0);

    let user = await this.users.findByPhone(phone.e164);
    let isNewUser = false;
    if (!user) {
      if (input.ageConfirmed !== true) throw Errors.ageRestricted();
      const r = await this.users.createIfAbsent({
        phone: phone.e164,
        country: phone.country,
        locale: input.locale ?? "rw",
        birthConfirmedAt: now,
        now,
      });
      user = r.user;
      isNewUser = r.created;
    }
    if (user.status === "SUSPENDED" || user.status === "CLOSED") throw Errors.accountDisabled();

    return this.startSession(user, isNewUser, input.deviceId ?? null, client, now);
  }

  private async startSession(
    user: UserRow,
    isNewUser: boolean,
    deviceId: string | null,
    client: ClientInfo,
    now: Date,
  ): Promise<AuthTokensDto> {
    const refreshToken = generateRefreshToken();
    const sessionId = await this.sessions.create({
      userId: user.id,
      deviceId,
      userAgent: client.userAgent,
      ip: client.ip,
      refreshHash: hashToken(refreshToken),
      refreshExpiresAt: new Date(now.getTime() + this.config.REFRESH_TOKEN_TTL_DAYS * 86_400_000),
      now,
    });
    return this.tokensFor(user, sessionId, refreshToken, isNewUser, now);
  }

  private async tokensFor(
    user: UserRow,
    sessionId: string,
    refreshToken: string,
    isNewUser: boolean,
    now: Date,
  ): Promise<AuthTokensDto> {
    const accessToken = await signAccessToken(
      { userId: user.id, sessionId },
      this.config.JWT_ACCESS_SECRET,
      this.config.ACCESS_TOKEN_TTL_SECONDS,
      now,
    );
    return {
      tokenType: "Bearer",
      accessToken,
      refreshToken,
      expiresIn: this.config.ACCESS_TOKEN_TTL_SECONDS,
      user: toUserDto(user),
      isNewUser,
    };
  }

  /** Rotates the refresh token. Presenting an already-used token closes the whole session (theft signal). */
  async refresh(refreshToken: string): Promise<AuthTokensDto> {
    const now = this.clock.now();
    const row = await this.sessions.findRefreshToken(hashToken(refreshToken));
    if (!row) throw Errors.refreshInvalid();
    if (row.revoked_at) throw Errors.refreshInvalid();
    if (row.used_at) {
      await this.sessions.revoke(row.session_id, "REFRESH_REUSE", now);
      this.logger.warn(
        `refresh token reuse detected session=${row.session_id} user=${row.user_id}`,
      );
      throw Errors.refreshReused();
    }
    if (row.expires_at <= now) throw Errors.refreshInvalid();

    if (!(await this.sessions.markRefreshUsed(row.id, now))) {
      // Lost a race with another use of the same token: treat as reuse.
      await this.sessions.revoke(row.session_id, "REFRESH_REUSE", now);
      throw Errors.refreshReused();
    }
    const user = await this.users.findById(row.user_id);
    if (!user || user.status === "SUSPENDED" || user.status === "CLOSED") {
      await this.sessions.revoke(row.session_id, "ACCOUNT_DISABLED", now);
      throw Errors.accountDisabled();
    }
    const next = generateRefreshToken();
    await this.sessions.addRefreshToken(
      row.session_id,
      hashToken(next),
      now,
      new Date(now.getTime() + this.config.REFRESH_TOKEN_TTL_DAYS * 86_400_000),
    );
    return this.tokensFor(user, row.session_id, next, false, now);
  }

  async logout(sessionId: string): Promise<void> {
    await this.sessions.revoke(sessionId, "LOGOUT", this.clock.now());
  }

  async logoutAll(userId: string): Promise<number> {
    return this.sessions.revokeAllForUser(userId, "LOGOUT_ALL", this.clock.now());
  }

  async listSessions(userId: string, currentSessionId: string): Promise<SessionDto[]> {
    const rows = await this.sessions.listActive(userId);
    return rows.map((s) => ({
      id: s.id,
      deviceId: s.device_id,
      userAgent: s.user_agent,
      createdAt: s.created_at.toISOString(),
      lastSeenAt: s.last_seen_at.toISOString(),
      current: s.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const mine = (await this.sessions.listActive(userId)).some((s) => s.id === sessionId);
    if (!mine) throw Errors.notFound("Session");
    await this.sessions.revoke(sessionId, "USER_REVOKED", this.clock.now());
  }
}
