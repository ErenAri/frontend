import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['logo.clearbit.com'], // dış kaynaklı logolar için izin ver
  },
  reactStrictMode: true,
};

export default nextConfig;
