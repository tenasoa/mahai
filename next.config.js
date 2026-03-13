const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Silence turbopack workspace root warning
  turbopack: {
    root: path.resolve(__dirname),
  },
}

module.exports = nextConfig
