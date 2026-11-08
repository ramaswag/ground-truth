import { NextResponse, type NextRequest } from "next/server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

/**
 * Simulated: a report an expert flags as evidence on a risk, from the extension.
 * direction: "raises" | "lowers" | "none". An analyst would read it with the risk.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as {
    url?: string;
    title?: string;
    riskId?: string;
    direction?: string;
    note?: string;
  } | null;
  if (!body?.url || !body.riskId || !["raises", "lowers", "none"].includes(body.direction ?? "")) {
    return NextResponse.json({ ok: false, error: "url, riskId and direction are required" }, { status: 400, headers: CORS });
  }
  return NextResponse.json({ ok: true, received: { ...body, at: new Date().toISOString() } }, { headers: CORS });
}
