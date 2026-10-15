import "reflect-metadata";
import { randomInt } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import pg from "pg";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { configureApp } from "../../src/bootstrap";
import { CLOCK, CONFIG, SMS_PROVIDER } from "../../src/common/tokens";
import { loadConfig, type AppConfig } from "../../src/config/config";
import { ManualClock } from "../../src/domain/auth/clock";
import { normalizePhone } from "../../src/domain/auth/phone";
import { MemorySmsProvider } from "../../src/modules/sms/console.provider";

export const DATABASE_URL = process.env.DATABASE_URL;
export const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export interface TestApp {
  app: INestApplication;
  http: ReturnType<typeof request>;
  sms: MemorySmsProvider;
  clock: ManualClock;
  config: AppConfig;
  pool: pg.Pool;
  close(): Promise<void>;
}

export async function createTestApp(overrides: Record<string, string> = {}): Promise<TestApp> {
  const config = loadConfig({
    NODE_ENV: "test",
    DATABASE_URL: DATABASE_URL!,
    REDIS_URL,
    JWT_ACCESS_SECRET: "t".repeat(40),
    PIN_PEPPER: "p".repeat(20),
    OTP_PEPPER: "o".repeat(20),
    // each app instance counts in its own Redis namespace, so parallel test files never share limits
    RATE_LIMIT_NAMESPACE: `t${randomInt(0, 2 ** 31)}`,
    OTP_RESEND_COOLDOWN_SECONDS: "0",
    OTP_REQUESTS_PER_IP: "100000",
    OTP_VERIFY_PER_IP: "100000",
    OTP_REQUESTS_PER_PHONE: "100",
    OTP_VERIFY_PER_PHONE: "1000",
    ...overrides,
  });
  const sms = new MemorySmsProvider();
  const clock = new ManualClock();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(CONFIG)
    .useValue(config)
    .overrideProvider(CLOCK)
    .useValue(clock)
    .overrideProvider(SMS_PROVIDER)
    .useValue(sms)
    .compile();
  const app = moduleRef.createNestApplication();
  configureApp(app, config);
  await app.init();
  const pool = new pg.Pool({ connectionString: DATABASE_URL });
  return {
    app,
    http: request(app.getHttpServer()),
    sms,
    clock,
    config,
    pool,
    close: async () => {
      await pool.end();
      await app.close();
    },
  };
}

/** A random, valid Rwandan mobile number in local format plus its E.164 form. */
export function randomPhone(): { local: string; e164: string } {
  for (;;) {
    const local = `07${["2", "3", "8", "9"][randomInt(0, 4)]}${String(randomInt(0, 10_000_000)).padStart(7, "0")}`;
    const n = normalizePhone(local);
    if (n) return { local, e164: n.e164 };
  }
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  user: { id: string; phone: string; hasPin: boolean };
  isNewUser: boolean;
}

export async function login(
  t: TestApp,
  phone = randomPhone(),
  deviceId?: string,
): Promise<{ tokens: Tokens; phone: ReturnType<typeof randomPhone> }> {
  await t.http.post("/v1/auth/otp/request").send({ phone: phone.local }).expect(202);
  const code = t.sms.lastCode(phone.e164)!;
  const res = await t.http
    .post("/v1/auth/otp/verify")
    .send({ phone: phone.local, code, ageConfirmed: true, ...(deviceId ? { deviceId } : {}) })
    .expect(200);
  return { tokens: res.body as Tokens, phone };
}

export const bearer = (tokens: { accessToken: string }) => ({
  Authorization: `Bearer ${tokens.accessToken}`,
});
