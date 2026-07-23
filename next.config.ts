import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
    // Options: 'warn' (recommended) or true (for all logs)
    browserToTerminal: true,
  },
  compiler: {
    // REMOVE or comment out this block to allow console logs in production
    removeConsole: false,
  },
};

export default nextConfig;
