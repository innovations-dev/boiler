import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  outputFileTracingIncludes: {
    // Explicitly include all MDX files in the content directory in production builds
    '/**/*': ['./content/*.mdx'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    mdxRs: {
      mdxType: 'gfm',
    },
  },
};
const withMDX = require('@next/mdx')();

export default withMDX(nextConfig);
