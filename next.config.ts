import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Self-hosted on a college VM behind Caddy. `standalone` emits a minimal
  // server bundle that we rsync to the box — the VM never runs `next build`,
  // which would OOM on a small instance. See deploy/ and CLAUDE.md.
  //
  // Vercel sets VERCEL=1 and produces its own build output, so the team-preview
  // deployment skips standalone. Production is still the VM, and with VERCEL
  // unset this is byte-for-byte the previous configuration.
  ...(process.env.VERCEL ? {} : { output: "standalone" as const }),

  images: {
    // Media is served from local disk on the same origin, so no remote patterns
    // are needed. AVIF first, then WebP.
    formats: ["image/avif", "image/webp"],
  },

  // Surface real problems at build time rather than shipping them.
  // (Next 16 removed the `eslint` key — linting runs via `npm run lint`.)
  typescript: { ignoreBuildErrors: false },
};

export default withPayload(nextConfig, { devBundleServerPackages: false });
