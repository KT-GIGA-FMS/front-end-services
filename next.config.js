/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',      // 정적 내보내기
  trailingSlash: true,
  images: { unoptimized: true },
};

module.exports = nextConfig;

