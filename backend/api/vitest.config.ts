import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Argon2 and database round trips are slow on small CI runners.
    testTimeout: 30_000,
    hookTimeout: 60_000,
    // Integration tests run when DATABASE_URL is set; pure logic is covered by unit tests with thresholds.
    coverage: {
      provider: "v8",
      include: ["src/domain/**/*.ts", "src/modules/sms/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/modules/sms/sms.module.ts"],
      reporter: ["text", "json-summary"],
    },
  },
});
