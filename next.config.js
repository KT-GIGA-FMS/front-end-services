/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  trailingSlash: true,
  images: { unoptimized: true },
  output: 'standalone', //배포아티팩트 최소화
};

module.exports = nextConfig;

