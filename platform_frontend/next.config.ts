import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:8000"}/api/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${process.env.BACKEND_URL || "http://localhost:8000"}/uploads/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { hostname: "localhost" },
      { hostname: "img.youtube.com" },
      { hostname: "i.ytimg.com" },
    ],
  },
};

export default nextConfig;
