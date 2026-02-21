/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/sign/**',
      },
    ],
  },
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
