import { NextResponse, type NextRequest } from "next/server";
import { addLink, removeLink } from "@/lib/db";

/**
 * Links a moderator draws between two risks of one country, saved in SQLite.
 * POST { iso, from, to, horizon } saves one (drawing the same pair again updates its window).
 * DELETE { id } removes one. Same-origin only: the moderator pages call it.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    iso?: string;
    from?: string;
    to?: string;
    horizon?: string;
  } | null;
  if (!body?.iso || !body.from || !body.to || !body.horizon) {
    return NextResponse.json({ ok: false, error: "iso, from, to and horizon are required" }, { status: 400 });
  }
  try {
    const link = addLink(body.iso, body.from, body.to, body.horizon);
    return NextResponse.json({ ok: true, link });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { id?: number } | null;
  if (typeof body?.id !== "number") {
    return NextResponse.json({ ok: false, error: "id is required" }, { status: 400 });
  }
  const removed = removeLink(body.id);
  return NextResponse.json({ ok: removed }, { status: removed ? 200 : 404 });
}
