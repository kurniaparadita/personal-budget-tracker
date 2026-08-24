import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow accessing the dev server via local IP
  allowedDevOrigins: ['172.20.128.1', '192.168.1.119', '192.168.13.50', 'localhost'],
};

export default nextConfig;
