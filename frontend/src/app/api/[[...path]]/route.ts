import { proxyToBackend } from "@/lib/proxy";

// Proxy the public API at this app's /api so :8000 is the single browser origin.
// (Server-side rendering still fetches the backend directly via BACKEND_ORIGIN.)
export const dynamic = "force-dynamic";

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
export const HEAD = proxyToBackend;
export const OPTIONS = proxyToBackend;
