/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => [
    {
      source: '/categories/:path*',
      headers: [
        { key: 'Cache-Control', value: 'no-store, must-revalidate' },
      ],
    },
    {
      source: '/categories',
      headers: [
        { key: 'Cache-Control', value: 'no-store, must-revalidate' },
      ],
    },
  ],
};

export default nextConfig;
