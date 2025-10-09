import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Explicitly set Turbopack root to this project to avoid multi-lockfile warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
