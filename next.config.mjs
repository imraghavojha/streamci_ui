/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
}

export default nextConfig