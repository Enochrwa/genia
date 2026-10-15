import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from "@nestjs/common";
import {
  UpdateProfileSchema,
  type SessionDto,
  type UpdateProfile,
  type UserDto,
} from "@genia/types";
import { AuthGuard } from "../../common/auth.guard";
import { CurrentAuth } from "../../common/current-auth.decorator";
import type { AuthContext } from "../../common/request";
import { ZodValidationPipe } from "../../common/zod.pipe";
import { AuthService } from "../auth/auth.service";
import { UsersService } from "./users.service";

@Controller("me")
@UseGuards(AuthGuard)
export class MeController {
  constructor(
    @Inject(UsersService) private readonly users: UsersService,
    @Inject(AuthService) private readonly auth: AuthService,
  ) {}

  @Get()
  me(@CurrentAuth() a: AuthContext): Promise<UserDto> {
    return this.users.me(a.userId);
  }

  @Patch()
  update(
    @CurrentAuth() a: AuthContext,
    @Body(new ZodValidationPipe(UpdateProfileSchema)) body: UpdateProfile,
  ): Promise<UserDto> {
    return this.users.updateMe(a.userId, body);
  }

  @Get("sessions")
  sessions(@CurrentAuth() a: AuthContext): Promise<SessionDto[]> {
    return this.auth.listSessions(a.userId, a.sessionId);
  }

  @Delete("sessions/:id")
  @HttpCode(204)
  async revoke(
    @CurrentAuth() a: AuthContext,
    @Param("id", new ParseUUIDPipe()) id: string,
  ): Promise<void> {
    await this.auth.revokeSession(a.userId, id);
  }
}
