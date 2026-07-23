import type { NextConfig } from "next";

const isStaticExport = process.env.NEXT_STATIC_EXPORT === 'true';
const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const basePath =
  isStaticExport && isGitHubPagesBuild && repositoryName
    ? `/${repositoryName}`
    : '';

const nextConfig: NextConfig = {
  output: isStaticExport ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
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
