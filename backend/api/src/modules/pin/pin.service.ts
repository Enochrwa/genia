import { createHmac } from "node:crypto";
import { Inject, Injectable } from "@nestjs/common";
import { hash, verify } from "@node-rs/argon2";
import { Errors } from "../../common/errors";
import { CLOCK, CONFIG } from "../../common/tokens";
import type { AppConfig } from "../../config/config";
import type { Clock } from "../../domain/auth/clock";
import { checkPin } from "../../domain/auth/pin-policy";
import { CredentialsRepository } from "./credentials.repository";

@Injectable()
export class PinService {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(CredentialsRepository) private readonly creds: CredentialsRepository,
  ) {}

  /** Pepper is applied with HMAC before argon2id, so a database leak alone cannot be brute forced offline. */
  private peppered(pin: string): string {
    return createHmac("sha256", this.config.PIN_PEPPER).update(pin).digest("hex");
  }

  private hashPin(pin: string): Promise<string> {
    return hash(this.peppered(pin));
  }

  private assertStrong(pin: string): void {
    const problem = checkPin(pin);
    if (problem) throw Errors.pinWeak(problem);
  }

  async set(userId: string, pin: string): Promise<void> {
    this.assertStrong(pin);
    const ok = await this.creds.setInitial(userId, await this.hashPin(pin), this.clock.now());
    if (!ok) throw Errors.pinAlreadySet();
  }

  /** Throws PIN_INVALID (with attempts left), AUTH_LOCKED while locked, or PIN_NOT_SET. */
  async verify(userId: string, pin: string): Promise<void> {
    const now = this.clock.now();
    const cred = await this.creds.get(userId);
    if (!cred?.pin_hash) throw Errors.pinNotSet();

    if (cred.pin_locked_until) {
      if (cred.pin_locked_until > now) {
        throw Errors.locked(
          Math.ceil((cred.pin_locked_until.getTime() - now.getTime()) / 1000),
          "PIN is locked. Try again later",
        );
      }
      await this.creds.resetFailures(userId);
      cred.failed_pin_count = 0;
    }

    const ok = await verify(cred.pin_hash, this.peppered(pin)).catch(() => false);
    if (!ok) {
      const lockUntil = new Date(now.getTime() + this.config.PIN_LOCK_MINUTES * 60_000);
      const r = await this.creds.recordFailure(userId, this.config.PIN_MAX_FAILURES, lockUntil);
      if (r.lockedUntil && r.lockedUntil > now) {
        throw Errors.locked(
          Math.ceil((r.lockedUntil.getTime() - now.getTime()) / 1000),
          "Too many wrong PINs. PIN is locked",
        );
      }
      throw Errors.pinInvalid(Math.max(0, this.config.PIN_MAX_FAILURES - r.failed));
    }
    if (cred.failed_pin_count > 0) await this.creds.resetFailures(userId);
  }

  async change(userId: string, currentPin: string, newPin: string): Promise<void> {
    await this.verify(userId, currentPin);
    this.assertStrong(newPin);
    if (newPin === currentPin) throw Errors.pinWeak("same_as_current");
    await this.creds.replace(userId, await this.hashPin(newPin), this.clock.now());
  }
}
