import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack est activé via --turbo dans package.json scripts
  
  // Images optimisées
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-*.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: 'images.clerk.dev',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  
  // Redirections
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/etudiant',
        permanent: false,
      },
      {
        source: '/profil',
        destination: '/compte',
        permanent: false,
      },
    ];
  },
}

export default nextConfig
