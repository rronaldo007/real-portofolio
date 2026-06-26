import type { NextRequest } from "next/server";

/**
 * Reverse-proxy for the Django admin, so it lives at this app's /admin while the
 * backend runs on another port. Unlike Next `rewrites` (which strip Set-Cookie
 * and break the admin's CSRF + session), this forwards every header in both
 * directions — including Set-Cookie — and passes redirects through untouched.
 */
export const dynamic = "force-dynamic";

const BACKEND = process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8001";
// Hop-by-hop / encoding headers we must not blindly forward.
const SKIP = new Set([
  "host", "connection", "keep-alive", "transfer-encoding",
  "content-length", "content-encoding", "accept-encoding",
]);

async function proxy(req: NextRequest): Promise<Response> {
  const target = `${BACKEND}${req.nextUrl.pathname}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!SKIP.has(key.toLowerCase())) headers.set(key, value);
  });

  const method = req.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstream = await fetch(target, { method, headers, body, redirect: "manual" });

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lk = key.toLowerCase();
    if (lk === "set-cookie" || SKIP.has(lk)) return;
    if (lk === "location") {
      // keep redirects on this origin (rewrite any absolute backend URL to a path)
      resHeaders.set(key, value.startsWith(BACKEND) ? value.slice(BACKEND.length) || "/" : value);
      return;
    }
    resHeaders.set(key, value);
  });

  // Forward each Set-Cookie individually (Headers collapses them otherwise).
  const cookies = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of cookies) resHeaders.append("set-cookie", cookie);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
