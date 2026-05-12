import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.0.167',
    '*.trycloudflare.com',
    'highland-clarke-double-anchor.trycloudflare.com',
  ],
};

export default nextConfig;
