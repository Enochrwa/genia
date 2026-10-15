import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { AppRequest, AuthContext } from "./request";

export const CurrentAuth = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthContext => {
    const req = ctx.switchToHttp().getRequest<AppRequest>();
    if (!req.auth) throw new Error("CurrentAuth used on a route without AuthGuard");
    return req.auth;
  },
);
