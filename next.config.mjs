/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  output: 'export',
  distDir: 'dist'
};

export default nextConfig;