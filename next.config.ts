import type { NextConfig } from "next";

/**
 * `output: "standalone"` produces a self-contained server bundle for
 * self-hosting (the sandbox `start` script runs `.next/standalone/server.js`).
 * Vercel does not support it, so it is enabled only off-Vercel (Vercel sets
 * `VERCEL=1` on its builds).
 */
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: "standalone" }),

  /**
   * Serve images as plain static files instead of routing them through
   * Vercel's `/_next/image` optimizer.
   *
   * Why: this project deploys as a multi-service Vercel project (vercel.json
   * with app + relay + scorer). In services mode every request is routed via
   * the top-level rewrites, and `/_next/image` is not reachable in that
   * routing layer — it lands on the deployment's 404 page (verified with
   * x-matched-path: /404), breaking every `next/image` (the Young10 Marketing
   * logo). Static assets like /brand/logo.png work fine, so we let
   * `next/image` render plain <img> tags pointing at the original files.
   * The brand assets are small (20-48 KB) PNGs — optimization gains nothing.
   */
  images: {
    unoptimized: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
