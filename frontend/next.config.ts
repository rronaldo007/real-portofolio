import type { NextConfig } from "next";

// The Django backend (admin + API + its static/media) lives on a separate port.
const BACKEND = process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8001";

const nextConfig: NextConfig = {
  // Django requires trailing slashes (APPEND_SLASH) on /admin/ URLs. Next's
  // default trailing-slash redirect fights that and causes an infinite
  // /admin/login/?next=... redirect loop, so disable it for proxied paths.
  skipTrailingSlashRedirect: true,

  // :8000 is the single front door — proxy the API, admin static, and media to
  // the backend so the browser only ever uses this origin. The /admin HTML is
  // proxied by a Route Handler (app/admin/[[...path]]/route.ts) because Next
  // rewrites strip Set-Cookie, which breaks the admin's CSRF + session. This
  // app's own revalidation route lives at /revalidate (not under /api) so /api/*
  // is free to proxy.
  async rewrites() {
    return [
      { source: "/static/:path*", destination: `${BACKEND}/static/:path*` },
      { source: "/media/:path*", destination: `${BACKEND}/media/:path*` },
    ];
  },
};

export default nextConfig;
