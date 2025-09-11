/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // AdSense 설정을 위한 CSP 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;