import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  outDir: "dist",
  format: "esm",
  target: "node22",
  sourcemap: true,
  clean: true,
  dts: false,
  splitting: false,
});
