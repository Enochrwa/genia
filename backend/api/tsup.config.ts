import { defineConfig } from "tsup";

// Bundles the API into dist/main.js. Workspace packages ship TypeScript source, so they are bundled in;
// third-party dependencies stay external and are installed in the runtime image.
export default defineConfig({
  entry: ["src/main.ts"],
  format: ["cjs"],
  target: "node20",
  sourcemap: true,
  clean: true,
  noExternal: [/^@genia\//],
});
