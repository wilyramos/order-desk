import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
  remotePatterns: [
    {
      protocol: "https",
      hostname: "cdn.shopify.com",
    },
    {
      protocol: "https",
      hostname: "res.cloudinary.com",
    },
  ],
},
};

export default nextConfig;