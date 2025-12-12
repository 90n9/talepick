import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.pixabay.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
    ],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Configure Turbopack to handle path aliases
  turbopack: {
    resolveAlias: {
      '@lib': './app/lib',
      '@ui': './app/ui',
    },
  },
  webpack: (config) => {
    // Add path alias resolution for webpack (fallback)
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lib': './app/lib',
      '@ui': './app/ui',
    };
    return config;
  },
};

export default nextConfig;
