import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/e2e/**"],
    coverage: {
      reporter: ["text", "lcov"],
      reportsDirectory: "./coverage",
      exclude: ["**/node_modules/**", "**/.next/**", "**/e2e/**"],
    },
  },
  resolve: {
    alias: {
      // NOTE: import.meta.url の pathname は日本語などが percent-encode されるため、
      // fileURLToPath でOSの実パスに変換してから alias に設定する
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
