// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Aseguramos que ffmpeg-static no sea empaquetado
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals as any];
      config.externals = [...externals, "ffmpeg-static"];
    }
    return config;
  },
};

export default nextConfig;
