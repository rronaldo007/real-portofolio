import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation. Django pings this (best-effort) whenever editable
 * content changes in the admin, so the live site reflects edits immediately.
 * Lives at /revalidate (not under /api/*) so the whole /api/* space can be
 * proxied to the Django backend. Guarded by a shared secret.
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: true });
}
