// next.config.js - Fix for Next.js Image hostname configuration

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Image configuration to allow Strapi images
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // Add your production Strapi domain here when you deploy
      {
        protocol: 'https',
        hostname: 'your-strapi-domain.com', // Replace with your actual domain
        pathname: '/uploads/**',
      },
      // Common image hosting services (optional)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    
    // Alternative: If you prefer the older domains configuration (simpler but less secure)
    // domains: ['localhost', 'your-strapi-domain.com', 'images.unsplash.com'],
    
    // Image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Other Next.js configurations you might have
  experimental: {
    // Add any experimental features you're using
  },
}

module.exports = nextConfig

// Alternative simpler configuration (if you don't need the advanced settings):
/*
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'your-strapi-domain.com'],
  },
}

module.exports = nextConfig
*/

