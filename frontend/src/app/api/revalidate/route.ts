import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation. Django pings this (best-effort) whenever editable
 * content changes in the admin, so the live site reflects edits immediately
 * instead of waiting for the ISR window. Guarded by a shared secret.
 */
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  // Revalidate the whole app tree (home + sub-pages share the same data).
  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, revalidated: true });
}
