/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const userServiceApi = process.env.NEXT_PUBLIC_USERSERVICE_API || 'http://localhost:4000';
    return [
      {
        source: '/api/userservice/:path*',
        destination: userServiceApi + '/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
