import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  // Next.js will use .babelrc (not babel.config.js)
  // babel.config.js is only for Expo/React Native
  // Exclude React Native files from Next.js processing
  transpilePackages: [],
  // Explicitly tell Next.js to ignore babel.config.js
  // and only use .babelrc for Next.js files
  experimental: {
    // Ensure Turbopack uses .babelrc, not babel.config.js
  },
};

export default nextConfig;
