import { NextResponse, type NextRequest } from "next/server";
import { importCsvText } from "@/lib/db";

/**
 * Takes a Risk Radar CSV from the moderator's Data page (a plain form post), replaces the
 * risks in the database, and sends the browser back to that page with the result.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file = form.get("file");
  const back = String(form.get("back") ?? "/moderate");
  // Only ever send people back inside the moderator pages.
  const target = new URL(back.startsWith("/moderate") ? back : "/moderate", req.url);

  if (!(file instanceof File) || !file.size) {
    target.searchParams.set("error", "Pick a CSV file first.");
    return NextResponse.redirect(target, 303);
  }
  try {
    const result = importCsvText(await file.text(), file.name);
    target.searchParams.set("imported", `${result.risks}`);
    target.searchParams.set("countries", `${result.countries}`);
  } catch (e) {
    target.searchParams.set("error", (e as Error).message);
  }
  return NextResponse.redirect(target, 303);
}
