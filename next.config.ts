import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.asos-media.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.uniqlo.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.adidas.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.sephora.com",
        pathname: "/productimages/**",
      },
      {
        protocol: "https",
        hostname: "**.gstatic.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "serpapi.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
