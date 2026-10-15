import { Body, Controller, HttpCode, Inject, Post, Put, UseGuards } from "@nestjs/common";
import {
  ChangePinSchema,
  SetPinSchema,
  VerifyPinSchema,
  type ChangePin,
  type SetPin,
  type VerifyPin,
} from "@genia/types";
import { AuthGuard } from "../../common/auth.guard";
import { CurrentAuth } from "../../common/current-auth.decorator";
import type { AuthContext } from "../../common/request";
import { ZodValidationPipe } from "../../common/zod.pipe";
import { PinService } from "./pin.service";

@Controller("me/pin")
@UseGuards(AuthGuard)
export class PinController {
  constructor(@Inject(PinService) private readonly pins: PinService) {}

  @Post()
  @HttpCode(204)
  async set(
    @CurrentAuth() a: AuthContext,
    @Body(new ZodValidationPipe(SetPinSchema)) body: SetPin,
  ): Promise<void> {
    await this.pins.set(a.userId, body.pin);
  }

  @Put()
  @HttpCode(204)
  async change(
    @CurrentAuth() a: AuthContext,
    @Body(new ZodValidationPipe(ChangePinSchema)) body: ChangePin,
  ): Promise<void> {
    await this.pins.change(a.userId, body.currentPin, body.newPin);
  }

  @Post("verify")
  @HttpCode(204)
  async verify(
    @CurrentAuth() a: AuthContext,
    @Body(new ZodValidationPipe(VerifyPinSchema)) body: VerifyPin,
  ): Promise<void> {
    await this.pins.verify(a.userId, body.pin);
  }
}
