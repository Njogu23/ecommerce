/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // Add other image domains you might use
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // If you're using experimental features
  experimental: {
    turbo: {
      // Add any turbo-specific config if needed
    },
    serverComponentsExternalPackages: ['@prisma/client', 'prisma']
  },
};

export default nextConfig;