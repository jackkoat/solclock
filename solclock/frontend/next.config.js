/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['via.placeholder.com', 'arweave.net', 'cf-ipfs.com', 'bafybeicj2kqyx5rb6yzmogmzmwjbzz3gf5l3vmdqefuqhg6gtdqvjc2toy.ipfs.nftstorage.link'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.ipfs.nftstorage.link',
      },
      {
        protocol: 'https',
        hostname: '**.genesysgo.net',
      }
    ]
  }
};

module.exports = nextConfig;
