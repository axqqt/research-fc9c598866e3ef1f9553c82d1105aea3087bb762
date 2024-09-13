/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.aliexpress-media.com',
        port: '',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['node-fetch'],
  },
};

export default nextConfig