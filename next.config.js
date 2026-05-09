/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    config.watchOptions = {
      ignored: ['**/src/**', '**/.next/**', '**/node_modules/**']
    }
    return config
  },
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
}

module.exports = nextConfig
