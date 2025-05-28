
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
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.repeople.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com', // From sample data
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com', // For Firebase Storage images
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com', // Added to support this common GCS hostname
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.colivingtirana.com', // Added for this specific error
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;
