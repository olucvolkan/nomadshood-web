
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com', // Added Unsplash
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // For repeople.co images
        hostname: 'www.repeople.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // For example.com placeholders if any are used
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
