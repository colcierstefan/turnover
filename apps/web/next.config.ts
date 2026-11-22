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
