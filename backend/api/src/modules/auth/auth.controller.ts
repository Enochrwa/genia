import { Body, Controller, HttpCode, Inject, Post, Req, UseGuards } from "@nestjs/common";
import {
  OtpRequestSchema,
  OtpVerifySchema,
  RefreshSchema,
  type AuthTokensDto,
  type OtpRequest,
  type OtpRequestedDto,
  type OtpVerify,
  type RefreshRequest,
} from "@genia/types";
import { AuthGuard } from "../../common/auth.guard";
import { CurrentAuth } from "../../common/current-auth.decorator";
import type { AppRequest, AuthContext } from "../../common/request";
import { ZodValidationPipe } from "../../common/zod.pipe";
import { AuthService, type ClientInfo } from "./auth.service";

const client = (req: AppRequest): ClientInfo => ({
  ip: req.ip ?? null,
  userAgent: req.header("user-agent") ?? null,
});

@Controller("auth")
export class AuthController {
  constructor(@Inject(AuthService) private readonly auth: AuthService) {}

  @Post("otp/request")
  @HttpCode(202)
  requestOtp(
    @Body(new ZodValidationPipe(OtpRequestSchema)) body: OtpRequest,
    @Req() req: AppRequest,
  ): Promise<OtpRequestedDto> {
    return this.auth.requestOtp(body, client(req));
  }

  @Post("otp/verify")
  @HttpCode(200)
  verifyOtp(
    @Body(new ZodValidationPipe(OtpVerifySchema)) body: OtpVerify,
    @Req() req: AppRequest,
  ): Promise<AuthTokensDto> {
    return this.auth.verifyOtp(body, client(req));
  }

  @Post("refresh")
  @HttpCode(200)
  refresh(
    @Body(new ZodValidationPipe(RefreshSchema)) body: RefreshRequest,
  ): Promise<AuthTokensDto> {
    return this.auth.refresh(body.refreshToken);
  }

  @Post("logout")
  @HttpCode(204)
  @UseGuards(AuthGuard)
  async logout(@CurrentAuth() auth: AuthContext): Promise<void> {
    await this.auth.logout(auth.sessionId);
  }

  @Post("logout-all")
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async logoutAll(@CurrentAuth() auth: AuthContext): Promise<{ revoked: number }> {
    return { revoked: await this.auth.logoutAll(auth.userId) };
  }
}
