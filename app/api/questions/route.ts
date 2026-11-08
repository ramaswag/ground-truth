import { NextResponse, type NextRequest } from "next/server";
import { findQuestions, KIND_LABEL } from "@/lib/questions";
import { formatDeadline, formatTimeLeft } from "@/lib/dates";

/**
 * Read-only feed for the ReliefWeb reading companion (the browser extension in /extension).
 * GET /api/questions?places=chad,tcd -> the open questions and their risks for those places.
 * Sample data only, like the rest of the draft.
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
};

export function OPTIONS() {
  return new NextResponse(null, { headers: CORS });
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const places = (req.nextUrl.searchParams.get("places") ?? "").split(",");
  const found = await findQuestions(places);
  const now = Date.now();

  const questions = found
    .filter((q) => Date.parse(q.answerBy) > now)
    .map((q) => ({
      id: q.id,
      kind: q.kind,
      kindLabel: KIND_LABEL[q.kind],
      text: q.text,
      ask: q.ask ?? null,
      counts: q.counts,
      panel: q.panel.name,
      position: q.position,
      answerBy: q.answerBy,
      answerByLabel: formatDeadline(q.answerBy),
      closesIn: formatTimeLeft(q.answerBy, now) ?? null,
      riskId: q.riskId,
      url: `${origin}/q/${q.id}`,
    }));

  const risks = [...new Map(found.flatMap((q) => (q.risk ? [[q.risk.id, q.risk]] : []))).values()].map((r) => ({
    id: r.id,
    title: r.title,
    country: r.country,
    level: r.level ?? null,
  }));

  return NextResponse.json({ app: "ground-truth", questions, risks }, { headers: CORS });
}
