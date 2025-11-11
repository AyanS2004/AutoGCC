/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/python/:path*',
        destination: 'http://localhost:5000/:path*',
      },
    ]
  },
}

module.exports = nextConfig


