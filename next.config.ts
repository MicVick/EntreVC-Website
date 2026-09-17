import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Self-hosted on a college VM behind Caddy. `standalone` emits a minimal
  // server bundle that we rsync to the box — the VM never runs `next build`,
  // which would OOM on a small instance. See deploy/ and CLAUDE.md.
  //
  // Skipped where the platform handles its own output: Vercel builds via its own
  // pipeline (and sets VERCEL=1 itself), Heroku starts the app with `next start`.
  // Set PREVIEW_PLATFORM on any such host. Production is still the VM, and with
  // both unset this is byte-for-byte the previous configuration.
  ...(process.env.VERCEL || process.env.PREVIEW_PLATFORM
    ? {}
    : { output: "standalone" as const }),

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
