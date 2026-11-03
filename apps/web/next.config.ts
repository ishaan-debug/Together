import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML in out/, so the app can be served from any host or wrapped for Android.
  output: "export",
  trailingSlash: true,
  // The shared package ships TypeScript source.
  transpilePackages: ["@together/shared"],
};

export default nextConfig;
