import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getQuestion } from "@/lib/questions";
import { formatDate, formatDeadline } from "@/lib/dates";

export const alt = "Ground Truth by ACAPS: an expert question";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Same plates as the page's risk chip: vermilion High, amber Medium, outlined Low. */
const LEVEL_CHIP = {
  High: { background: "#c8321e", color: "#ffffff" },
  Medium: { background: "#e07a10", color: "#121212" },
  Low: { background: "#ffffff", color: "#121212", border: "3px solid #121212" },
} as const;

const FONT_DIR = join(process.cwd(), "node_modules", "@fontsource", "archivo", "files");

/** The share card WhatsApp and email clients unfurl: the same unit, set as an image. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await getQuestion(id);
  const [w500, w800] = await Promise.all([
    readFile(join(FONT_DIR, "archivo-latin-500-normal.woff")),
    readFile(join(FONT_DIR, "archivo-latin-800-normal.woff")),
  ]);

  const text = q?.text ?? "Question not found";
  const long = text.length > 90;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#f4f4f1",
          color: "#121212",
          fontFamily: "Archivo",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            background: "#004b78",
            color: "#ffffff",
            padding: "28px 56px 22px",
            borderBottom: "8px solid #121212",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>Ground Truth</span>
            <span style={{ fontSize: 24, fontWeight: 500 }}>by ACAPS</span>
          </div>
          {q && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 26, fontWeight: 800 }}>
              <span>
                {q.area} · Risk {q.riskId}
              </span>
              {q.risk?.level && (
                <span style={{ padding: "4px 14px", ...LEVEL_CHIP[q.risk.level] }}>{q.risk.level}</span>
              )}
            </div>
          )}
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "40px 56px 0",
            fontSize: long ? 54 : 62,
            lineHeight: 1.08,
            fontWeight: 800,
            letterSpacing: -1.5,
          }}
        >
          {text}
        </div>
        {q?.ask && (
          <div style={{ display: "flex", padding: "0 56px 16px", fontSize: 32, fontWeight: 800 }}>{q.ask}</div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 56px 48px" }}>
          {["Yes", "No", "Don’t know"].map((label) => (
            <div
              key={label}
              style={{
                display: "flex",
                padding: "14px 30px",
                border: "4px solid #121212",
                background: "#ffffff",
                fontSize: 32,
                fontWeight: 800,
              }}
            >
              {label}
            </div>
          ))}
          {q && (
            <div style={{ display: "flex", marginLeft: "auto", fontSize: 26, fontWeight: 500 }}>
              Answer by {formatDeadline(q.answerBy)}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Archivo", data: w500, weight: 500, style: "normal" },
        { name: "Archivo", data: w800, weight: 800, style: "normal" },
      ],
    },
  );
}
