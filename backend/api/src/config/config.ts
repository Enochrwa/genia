import { z } from "zod";

const bool = z.enum(["true", "false", "1", "0"]).transform((v) => v === "true" || v === "1");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://localhost:6379"),
  WEB_PUBLIC_URL: z.string().default("http://localhost:3000"),
  CORS_ORIGINS: z.string().default(""),
  TRUST_PROXY: bool.default(false),
  DEFAULT_COUNTRY: z.string().length(2).default("RW"),
  /** Prefix for Redis rate-limit keys; lets several deployments or test suites share one Redis safely. */
  RATE_LIMIT_NAMESPACE: z.string().max(40).default(""),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  PIN_PEPPER: z.string().min(16, "PIN_PEPPER must be at least 16 characters"),
  OTP_PEPPER: z.string().min(16, "OTP_PEPPER must be at least 16 characters"),
  ACCESS_TOKEN_TTL_SECONDS: z.coerce.number().int().min(60).default(900),
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).default(30),

  OTP_LENGTH: z.coerce.number().int().min(4).max(8).default(6),
  OTP_TTL_SECONDS: z.coerce.number().int().min(60).default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(1).default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().min(0).default(60),
  OTP_REQUESTS_PER_PHONE: z.coerce.number().int().min(1).default(3),
  OTP_REQUESTS_PER_PHONE_WINDOW_SECONDS: z.coerce.number().int().min(60).default(600),
  OTP_REQUESTS_PER_IP: z.coerce.number().int().min(1).default(20),
  OTP_VERIFY_PER_PHONE: z.coerce.number().int().min(1).default(10),
  OTP_VERIFY_PER_IP: z.coerce.number().int().min(1).default(60),

  PIN_MAX_FAILURES: z.coerce.number().int().min(1).default(5),
  PIN_LOCK_MINUTES: z.coerce.number().int().min(1).default(30),

  SMS_PROVIDER: z.enum(["console", "africastalking"]).default("console"),
  AFRICAS_TALKING_API_KEY: z.string().optional(),
  AFRICAS_TALKING_USERNAME: z.string().default("sandbox"),
  AFRICAS_TALKING_SENDER_ID: z.string().optional(),
  AFRICAS_TALKING_BASE_URL: z.string().optional(),
});

export type AppConfig = z.infer<typeof schema>;

const PLACEHOLDER = /^(change-me|dev-only|example)/i;

/** Parses and validates the environment. Fails fast with a readable message. */
export function loadConfig(env: Record<string, string | undefined> = process.env): AppConfig {
  const parsed = schema.safeParse(env);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid configuration:\n${lines.join("\n")}`);
  }
  const c = parsed.data;
  const problems: string[] = [];
  if (c.SMS_PROVIDER === "africastalking" && !c.AFRICAS_TALKING_API_KEY) {
    problems.push("AFRICAS_TALKING_API_KEY is required when SMS_PROVIDER=africastalking");
  }
  if (c.NODE_ENV === "production") {
    if (c.SMS_PROVIDER === "console")
      problems.push("SMS_PROVIDER=console is not allowed in production");
    for (const k of ["JWT_ACCESS_SECRET", "PIN_PEPPER", "OTP_PEPPER"] as const) {
      if (PLACEHOLDER.test(c[k])) problems.push(`${k} looks like a development placeholder`);
    }
    const distinct = new Set([c.JWT_ACCESS_SECRET, c.PIN_PEPPER, c.OTP_PEPPER]);
    if (distinct.size !== 3)
      problems.push("JWT_ACCESS_SECRET, PIN_PEPPER and OTP_PEPPER must all differ");
  }
  if (problems.length)
    throw new Error(`Invalid configuration:\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  return c;
}
