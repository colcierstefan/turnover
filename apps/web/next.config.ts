import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  experimental: {
    // Uploads are up to 3 files of 10 MB; multipart framing needs a little more.
    serverActions: { bodySizeLimit: "31mb" },
    proxyClientMaxBodySize: "31mb",
  },
  partialPrefetching: true,
  // Turbopack cannot bundle @mastra/otel-bridge (it reads a missing @opentelemetry/api export).
  serverExternalPackages: [
    "@mastra/ai-sdk",
    "@mastra/core",
    "@mastra/observability",
    "@mastra/otel-bridge",
  ],
  transpilePackages: ["@turnover/core"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
