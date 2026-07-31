import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.180', '192.168.1.251', '192.168.1.251:3000', '191.168.1.251:5000'],
};

export default nextConfig;
