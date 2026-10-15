import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configureApp } from "./bootstrap";
import { loadConfig } from "./config/config";

async function main(): Promise<void> {
  const config = loadConfig(); // fail fast before touching the network
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  configureApp(app, config);
  await app.listen(config.API_PORT, "0.0.0.0");
  new Logger("Bootstrap").log(`Genia API listening on :${config.API_PORT} (${config.NODE_ENV})`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
