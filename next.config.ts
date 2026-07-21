import type { NextConfig } from "next";

const isGitHubPagesBuild = process.env.GITHUB_ACTIONS === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const basePath = isGitHubPagesBuild && repositoryName ? `/${repositoryName}` : '';

const nextConfig: NextConfig = {
  output: 'export',
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
