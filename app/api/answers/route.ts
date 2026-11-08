import { NextResponse, type NextRequest } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

/** Simulated: the draft has no backend. Accepts an answer from the extension and echoes it. */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    questionId?: string;
    answer?: string;
    note?: string;
    via?: string;
  } | null;
  if (!body?.questionId || !["yes", "no", "dk"].includes(body.answer ?? "")) {
    return NextResponse.json(
      { ok: false, error: "questionId and answer (yes, no or dk) are required" },
      { status: 400, headers: CORS },
    );
  }
  return NextResponse.json({ ok: true, received: { ...body, at: new Date().toISOString() } }, { headers: CORS });
}
