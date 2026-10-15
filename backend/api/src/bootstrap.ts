import type { INestApplication } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import helmet from "helmet";
import { AllExceptionsFilter } from "./common/error.filter";
import { requestIdMiddleware } from "./common/request-id.middleware";
import type { AppConfig } from "./config/config";

/** Shared by main.ts and the integration tests so both run the same pipeline. */
export function configureApp(app: INestApplication, config: AppConfig): void {
  const express = app as NestExpressApplication;
  express.set("trust proxy", config.TRUST_PROXY ? 1 : false);
  express.useBodyParser("json", { limit: "10kb" });
  app.use(requestIdMiddleware);
  app.use(helmet());
  app.setGlobalPrefix("v1", { exclude: ["health", "ready"] });
  app.useGlobalFilters(new AllExceptionsFilter());
  const origins = [config.WEB_PUBLIC_URL, ...config.CORS_ORIGINS.split(",")]
    .map((s) => s.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins,
    credentials: true,
    exposedHeaders: ["X-Request-Id", "Retry-After"],
  });
  app.enableShutdownHooks();
}
