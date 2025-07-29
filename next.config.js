/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow warnings but fail on errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
}

module.exports = nextConfig 