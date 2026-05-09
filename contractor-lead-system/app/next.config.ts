import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.0.167'],
  async redirects() {
    return [
      // Vantage is the only public-facing product here. Hide the legacy
      // LRP routes by redirecting the root to /vantage.
      { source: '/', destination: '/vantage', permanent: false },
      { source: '/sign-in', destination: '/vantage', permanent: false },
      { source: '/dashboard', destination: '/vantage/hub', permanent: false },
      // Backwards-compat: anything bookmarked at /apex still works.
      { source: '/apex', destination: '/vantage', permanent: false },
      { source: '/apex/:path*', destination: '/vantage/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
