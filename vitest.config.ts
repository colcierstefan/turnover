import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  ssr: {
    resolve: { conditions: ["react-server"] },
  },
  test: {
    environment: "node",
  },
});
