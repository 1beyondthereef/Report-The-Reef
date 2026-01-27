/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Fix for @libsql modules
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['@libsql/client', '@prisma/adapter-libsql'],
  },
};

export default nextConfig;
