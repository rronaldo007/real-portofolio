import type { NextConfig } from "next";

// The Django backend (admin + API + its static/media) lives on a separate port.
const BACKEND = process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8001";

const nextConfig: NextConfig = {
  // Django requires trailing slashes (APPEND_SLASH) on /admin/ URLs. Next's
  // default trailing-slash redirect fights that and causes an infinite
  // /admin/login/?next=... redirect loop, so disable it for proxied paths.
  skipTrailingSlashRedirect: true,

  // Serve the Django admin's static/media from this origin via rewrites (no
  // cookies needed there). The /admin HTML itself is proxied by a Route Handler
  // (app/admin/[[...path]]/route.ts) because Next rewrites strip Set-Cookie,
  // which breaks the admin's CSRF + session. The public API stays on the backend
  // directly (server-side fetch), and this app keeps its own /api/revalidate.
  async rewrites() {
    return [
      { source: "/static/:path*", destination: `${BACKEND}/static/:path*` },
      { source: "/media/:path*", destination: `${BACKEND}/media/:path*` },
    ];
  },
};

export default nextConfig;
