import { Module } from "@nestjs/common";
import { AuthGuard } from "../../common/auth.guard";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { OtpRepository } from "./otp.repository";
import { SessionsRepository } from "./sessions.repository";

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, OtpRepository, SessionsRepository, AuthGuard],
  exports: [AuthService, SessionsRepository, AuthGuard],
})
export class AuthModule {}
