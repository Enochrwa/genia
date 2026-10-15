import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { CredentialsRepository } from "./credentials.repository";
import { PinController } from "./pin.controller";
import { PinService } from "./pin.service";

@Module({
  imports: [AuthModule],
  controllers: [PinController],
  providers: [CredentialsRepository, PinService],
  exports: [PinService],
})
export class PinModule {}
