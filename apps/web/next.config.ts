import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

  allowedDevOrigins: [
    "192.168.1.180",
  ],
};

export default nextConfig;