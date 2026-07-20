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
};

export default nextConfig;
