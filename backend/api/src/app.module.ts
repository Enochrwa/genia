import { Global, Module } from "@nestjs/common";
import { CLOCK, CONFIG } from "./common/tokens";
import { loadConfig } from "./config/config";
import { systemClock } from "./domain/auth/clock";
import { HealthController } from "./health/health.controller";
import { DatabaseModule } from "./infra/database.module";
import { RedisModule } from "./infra/redis.module";
import { AuthModule } from "./modules/auth/auth.module";
import { PinModule } from "./modules/pin/pin.module";
import { SmsModule } from "./modules/sms/sms.module";
import { UsersModule } from "./modules/users/users.module";

@Global()
@Module({
  providers: [
    { provide: CONFIG, useFactory: () => loadConfig() },
    { provide: CLOCK, useValue: systemClock },
  ],
  exports: [CONFIG, CLOCK],
})
export class CoreModule {}

@Module({
  imports: [CoreModule, DatabaseModule, RedisModule, SmsModule, UsersModule, AuthModule, PinModule],
  controllers: [HealthController],
})
export class AppModule {}
