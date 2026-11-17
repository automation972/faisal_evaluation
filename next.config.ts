import type { NextConfig } from "next";

/**
 * `output: "standalone"` produces a self-contained server bundle for
 * self-hosting (the sandbox `start` script runs `.next/standalone/server.js`).
 *
 * Vercel does NOT support standalone output: when it is enabled, Vercel's
 * `/_next/image` optimizer route 404s and every `next/image` on the site
 * (e.g. the Young10 Marketing logo) renders as a broken image. Vercel is
 * detected via the `VERCEL` environment variable, which it sets on builds.
 */
const isVercel = process.env.VERCEL === "1";

const nextConfig: NextConfig = {
  ...(isVercel ? {} : { output: "standalone" }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
