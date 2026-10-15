import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { parse } from "yaml";
import { DATABASE_URL, createTestApp, type TestApp } from "./helpers";

interface Layer {
  route?: { path: string; methods: Record<string, boolean> };
}

describe.skipIf(!DATABASE_URL)("OpenAPI contract", () => {
  let t: TestApp;
  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(async () => {
    await t.close();
  });

  const spec = parse(
    readFileSync(join(__dirname, "../../../../docs/03-api/openapi.yaml"), "utf8"),
  ) as {
    paths: Record<string, Record<string, unknown>>;
  };
  const documented = new Set(
    Object.entries(spec.paths).flatMap(([path, ops]) =>
      Object.keys(ops).map((m) => `${m.toUpperCase()} ${path}`),
    ),
  );

  function implemented(): Set<string> {
    // Express 5 exposes the router as `router` (Express 4 used `_router`).
    const instance = t.app.getHttpAdapter().getInstance() as {
      router?: { stack: Layer[] };
      _router?: { stack: Layer[] };
    };
    const router = instance.router ?? instance._router!;
    const out = new Set<string>();
    for (const layer of router.stack) {
      if (!layer.route) continue;
      for (const method of Object.keys(layer.route.methods)) {
        out.add(`${method.toUpperCase()} ${layer.route.path.replace(/:(\w+)/g, "{$1}")}`);
      }
    }
    return out;
  }

  it("documents every implemented route", () => {
    const missing = [...implemented()].filter((r) => !documented.has(r));
    expect(missing).toEqual([]);
  });

  it("does not document routes that do not exist", () => {
    const impl = implemented();
    const phantom = [...documented].filter((r) => !impl.has(r));
    expect(phantom).toEqual([]);
  });
});
