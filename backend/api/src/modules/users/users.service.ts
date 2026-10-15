import { Inject, Injectable } from "@nestjs/common";
import type { UpdateProfile, UserDto } from "@genia/types";
import { Errors } from "../../common/errors";
import { CLOCK } from "../../common/tokens";
import type { Clock } from "../../domain/auth/clock";
import { UsersRepository, type UserRow } from "./users.repository";

export function toUserDto(u: UserRow): UserDto {
  return {
    id: u.id,
    phone: u.phone_e164,
    country: u.country,
    locale: u.locale,
    email: u.email,
    status: u.status,
    kycLevel: u.kyc_level,
    hasPin: u.has_pin,
    createdAt: u.created_at.toISOString(),
  };
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(UsersRepository) private readonly users: UsersRepository,
    @Inject(CLOCK) private readonly clock: Clock,
  ) {}

  async me(userId: string): Promise<UserDto> {
    const u = await this.users.findById(userId);
    if (!u) throw Errors.notFound("User");
    return toUserDto(u);
  }

  async updateMe(userId: string, patch: UpdateProfile): Promise<UserDto> {
    const u = await this.users.updateProfile(userId, patch, this.clock.now());
    if (!u) throw Errors.notFound("User");
    return toUserDto(u);
  }
}
