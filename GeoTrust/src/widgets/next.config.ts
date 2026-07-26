import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Images are unoptimized for widget deployment.
   * NitroStack CLI handles widget bundling (static HTML) separately.
   */
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
