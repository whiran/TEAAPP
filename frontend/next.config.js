/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Disable image optimization for Docker
    images: {
        unoptimized: true,
    },
    // Environment variables
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    },
}

module.exports = nextConfig
