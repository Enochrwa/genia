import { Global, Inject, Module, type OnApplicationShutdown } from "@nestjs/common";
import pg from "pg";
import { CONFIG, PG_POOL } from "../common/tokens";
import type { AppConfig } from "../config/config";

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      inject: [CONFIG],
      useFactory: (config: AppConfig) =>
        new pg.Pool({ connectionString: config.DATABASE_URL, max: 10 }),
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnApplicationShutdown {
  constructor(@Inject(PG_POOL) private readonly pool: pg.Pool) {}
  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}
