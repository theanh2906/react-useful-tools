import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  env: {
    SECRET_KEY: process.env.SECRET_KEY,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '*.firebasestorage.app',
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
