import type { NextRequest } from "next/server";

/**
 * Transparent reverse-proxy to the Django backend, forwarding every header in
 * both directions — including Set-Cookie (which Next `rewrites` strip, breaking
 * the admin's CSRF/session) — and passing redirects through with the exact path
 * (so Django's trailing-slash URLs don't trigger Next redirect loops).
 */
const BACKEND = process.env.BACKEND_ORIGIN ?? "http://127.0.0.1:8001";
const SKIP = new Set([
  "host", "connection", "keep-alive", "transfer-encoding",
  "content-length", "content-encoding", "accept-encoding",
]);

export async function proxyToBackend(req: NextRequest): Promise<Response> {
  const target = `${BACKEND}${req.nextUrl.pathname}${req.nextUrl.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!SKIP.has(key.toLowerCase())) headers.set(key, value);
  });

  const method = req.method;
  const body = method === "GET" || method === "HEAD" ? undefined : await req.arrayBuffer();

  let upstream: Response;
  try {
    upstream = await fetch(target, { method, headers, body, redirect: "manual" });
  } catch {
    // Backend down/unreachable — return a clean gateway error, not a stack trace.
    return new Response("Backend unavailable", { status: 502 });
  }

  const resHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    const lk = key.toLowerCase();
    if (lk === "set-cookie" || SKIP.has(lk)) return;
    if (lk === "location") {
      resHeaders.set(key, value.startsWith(BACKEND) ? value.slice(BACKEND.length) || "/" : value);
      return;
    }
    resHeaders.set(key, value);
  });

  const cookies = upstream.headers.getSetCookie?.() ?? [];
  for (const cookie of cookies) resHeaders.append("set-cookie", cookie);

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: resHeaders,
  });
}
