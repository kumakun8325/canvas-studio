import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const shouldSkipCoverageThresholds =
  process.env.VITEST_SKIP_COVERAGE_THRESHOLDS === "true";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts", "vitest-canvas-mock"],
    // Ignore unhandled errors from fabric.js canvas cleanup in jsdom
    dangerouslyIgnoreUnhandledErrors: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      thresholds: shouldSkipCoverageThresholds
        ? undefined
        : {
            statements: 80,
            branches: 70,
            functions: 90,
            lines: 80,
          },
    },
  },
});
