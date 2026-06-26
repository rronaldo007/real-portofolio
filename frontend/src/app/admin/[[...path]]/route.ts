import { proxyToBackend } from "@/lib/proxy";

// Serve the Django admin at this app's /admin (backend runs on an internal port).
export const dynamic = "force-dynamic";

export const GET = proxyToBackend;
export const POST = proxyToBackend;
export const PUT = proxyToBackend;
export const PATCH = proxyToBackend;
export const DELETE = proxyToBackend;
export const HEAD = proxyToBackend;
export const OPTIONS = proxyToBackend;
