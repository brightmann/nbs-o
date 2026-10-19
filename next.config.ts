import type { NextConfig } from 'next';

// Static export for Cloudflare Workers (no OpenNext adapter):
// no middleware, no API routes, no server features.
const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
};

export default nextConfig;
