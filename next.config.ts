import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL('https://static.acm.illinois.edu/**')],
  }
};

export default nextConfig;
