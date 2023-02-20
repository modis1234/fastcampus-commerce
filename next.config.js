/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: false,
  compiler: {
    emotion: true,
  },
  images: {
    domains: [
      'picsum.photos',
      'raw.githubusercontent.com',
      'cdn.shopity.com',
      'lh3.googleusercontent.com',
      'i.ibb.co',
    ],
  },
}

module.exports = nextConfig
