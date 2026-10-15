import { CanActivate, ExecutionContext, Inject, Injectable } from "@nestjs/common";
import { Errors } from "./errors";
import type { AppRequest } from "./request";
import { CLOCK, CONFIG } from "./tokens";
import type { AppConfig } from "../config/config";
import type { Clock } from "../domain/auth/clock";
import { verifyAccessToken } from "../domain/auth/tokens";
import { SessionsRepository } from "../modules/auth/sessions.repository";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(CONFIG) private readonly config: AppConfig,
    @Inject(CLOCK) private readonly clock: Clock,
    @Inject(SessionsRepository) private readonly sessions: SessionsRepository,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AppRequest>();
    const header = req.header("authorization") ?? "";
    const [scheme, token] = header.split(" ");
    if (scheme?.toLowerCase() !== "bearer" || !token) throw Errors.unauthenticated();

    const r = await verifyAccessToken(token, this.config.JWT_ACCESS_SECRET, this.clock.now());
    if (!r.ok)
      throw Errors.unauthenticated(
        r.reason === "expired" ? "Access token expired" : "Invalid access token",
      );

    // Immediate revocation: a logged-out or disabled session stops working right away, not at token expiry.
    if (!(await this.sessions.isActive(r.claims.sessionId, r.claims.userId)))
      throw Errors.unauthenticated("Session is no longer active");
    req.auth = r.claims;
    return true;
  }
}
