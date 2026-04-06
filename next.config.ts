import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      tailwindcss: "./node_modules/tailwindcss",
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
    ],
  },
};

export default nextConfig;
