/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true,
    },
    images: { 
      domains: ['img.youtube.com', 'cdn.myanimelist.net','images.unsplash.com','api.dicebear.com'],
      unoptimized: true 
    }
  };
  
  module.exports = nextConfig;