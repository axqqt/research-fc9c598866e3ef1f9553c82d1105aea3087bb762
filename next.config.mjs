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
};

export default nextConfig;
