import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        "node:fs": false,
        "node:path": false,
      };
    }
    return config;
  },
};

export default nextConfig;
