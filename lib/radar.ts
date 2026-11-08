/**
 * ACAPS Risk Radar adapter.
 *
 * `RadarRow` mirrors the API's columns exactly. `parseRisk` turns one row into the shape
 * the question page reads. Only Risk ID, Risk Title, ISO and Country are always filled;
 * in the 139-row export the rest run from 97% (exposure) down to 35%, so every other
 * parsed field is optional and the page leaves out whatever a risk does not have.
 *
 * Pure functions, no imports: the same file parses the API response on the server and
 * can be run against a raw export from a script.
 */

export const RADAR_COLUMNS = [
  "Risk ID",
  "Risk Title",
  "Risk Type",
  "ISO",
  "Country",
  "Rationale",
  "Source",
  "Intensity of hazard",
  "Impact",
  "Probability",
  "Risk Level",
  "Risk trend",
  "Status",
  "What materialised?",
  "Hazard materialisation",
  "Materialisation sources",
  "Triggers",
  "Current vulnerability / Coping capacities",
  "Current vulnerability / Coping capacities sources",
  "Expected exposure",
  "Expected impact",
  "Expected impact sources",
  "Expected priority needs",
  "Impact materialisation description",
  "Rationale update",
] as const;

export type RadarColumn = (typeof RADAR_COLUMNS)[number];
export type RadarRow = Partial<Record<RadarColumn, string | null>>;

export type RiskLevel = "Low" | "Medium" | "High";
export type Probability = "Very low" | "Low" | "Medium" | "High" | "Very high";
export type Trend = "Improved" | "Stable" | "Deteriorated";
export type Status = "Active" | "Materialised" | "Not materialised";

/** `date` is ISO: "2026-04-08", or "2026-04" when the source gives only month and year. */
export type SourceRef = { label: string; date?: string; url: string };

/** Analyst text with its inline citations lifted out into `sources`. */
export type Prose = { paragraphs: string[]; sources: SourceRef[] };

export type Update = Prose & { date?: string };

export type Trigger = {
  id: string;
  title: string;
  description?: string;
  /** What 100% completion means, from "Quantitative objective to meet 100%". */
  objective?: string;
  completion?: number;
  updated?: string;
  sources: SourceRef[];
};

export type Risk = {
  id: string;
  title: string;
  iso: string;
  country: string;
  type?: string;
  level?: RiskLevel;
  probability?: Probability;
  impact?: number;
  intensity?: number;
  /** Ready to print, e.g. "More than 500,000 people". */
  exposure?: string;
  trend?: Trend;
  status?: Status;
  rationale?: Prose;
  /** Newest first. */
  updates: Update[];
  triggers: Trigger[];
  priorityNeeds: string[];
};

/* ------------------------------------------------------------------ helpers */

function text(v: string | null | undefined): string | undefined {
  const t = (v ?? "").replace(/\r\n?/g, "\n").trim();
  return t || undefined;
}

function oneOf<T extends string>(v: string | null | undefined, options: readonly T[]): T | undefined {
  const t = text(v)?.toLowerCase();
  return options.find((o) => o.toLowerCase() === t);
}

function scale(v: string | null | undefined): number | undefined {
  const n = Number(text(v));
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : undefined;
}

function iso(day: string | undefined, month: string, year: string): string | undefined {
  const m = Number(month);
  const d = day === undefined ? undefined : Number(day);
  if (m < 1 || m > 12 || (d !== undefined && (d < 1 || d > 31))) return undefined;
  const mm = String(m).padStart(2, "0");
  return d === undefined ? `${year}-${mm}` : `${year}-${mm}-${String(d).padStart(2, "0")}`;
}

/** "08-06-2026" (as used in the Triggers column) -> "2026-06-08". */
function dashDate(v: string | undefined): string | undefined {
  const m = v?.trim().match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  return m ? iso(m[1], m[2], m[3]) : undefined;
}

/* -------------------------------------------------------------- citations */

// [UNHCR 25/09/2026](https://…). The export sometimes pads the URL with spaces or
// escapes the closing paren as "\)".
const CITE = /\[([^\]]+)\]\s?\(\s*([^)\s]+?)\s*\\?\)/g;
// A parenthetical made only of citations: " ([A 01/02/2026](u), [B 03/2026](v))".
const CITE_GROUP = /\s*\(\s*\[[^\]]+\]\s?\([^)]+\)(?:\s*,\s*\[[^\]]+\]\s?\([^)]+\))*\s*\)/g;
// Label ending in a date: "UNHCR 25/09/2026", "IPC 03/2026", "OCHA accessed 05/06/2026".
const LABEL_DATE = /^(.*?)[\s,]*(?:accessed\s*)?(?:(\d{1,2})\/)?(\d{1,2})\/(\d{4})$/i;

function citation(label: string, url: string): SourceRef {
  const m = label.trim().match(LABEL_DATE);
  if (!m) return { label: label.trim(), url };
  const date = iso(m[2], m[3], m[4]);
  return { label: m[1].trim() || label.trim(), url, ...(date && { date }) };
}

function citations(v: string | undefined): SourceRef[] {
  if (!v) return [];
  const seen = new Set<string>();
  const out: SourceRef[] = [];
  for (const [, label, url] of v.matchAll(CITE)) {
    if (seen.has(url)) continue;
    seen.add(url);
    out.push(citation(label, url));
  }
  return out;
}

/** The Source column: bare URLs, one per line. Labelled by host when no citation names them. */
function bareUrls(v: string | null | undefined): SourceRef[] {
  return (text(v)?.match(/https?:\/\/[^\s)\]]+/g) ?? []).map((url) => {
    let label = url;
    try {
      label = new URL(url).hostname.replace(/^www\./, "");
    } catch {}
    return { label, url };
  });
}

function prose(v: string | undefined, extra: SourceRef[] = []): Prose | undefined {
  if (!v) return undefined;
  const paragraphs = v
    .replace(CITE_GROUP, "")
    .replace(CITE, (_, label: string) => label)
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter(Boolean);
  if (!paragraphs.length) return undefined;
  const sources = citations(v);
  for (const s of extra) if (!sources.some((x) => x.url === s.url)) sources.push(s);
  return { paragraphs, sources };
}

/* ---------------------------------------------------------------- updates */

// Each block opens with its own line: "UPDATE 30/09/2026" (sometimes "Update"). Newest first.
const UPDATE_HEAD = /^[ \t]*update[ \t]+(\d{1,2})\/(\d{1,2})\/(\d{4})[ \t:.]*$/gim;

function updates(v: string | undefined): Update[] {
  if (!v) return [];
  const heads = [...v.matchAll(UPDATE_HEAD)];
  if (!heads.length) {
    const p = prose(v);
    return p ? [p] : [];
  }
  const out: Update[] = [];
  heads.forEach((h, i) => {
    const start = h.index! + h[0].length;
    const end = i + 1 < heads.length ? heads[i + 1].index! : v.length;
    const p = prose(v.slice(start, end).trim());
    const date = iso(h[1], h[2], h[3]);
    if (p) out.push({ ...p, ...(date && { date }) });
  });
  return out;
}

/* --------------------------------------------------------------- triggers */

const TRIGGER_KEYS = {
  "Trigger ID": "id",
  Title: "title",
  Description: "description",
  Sources: "sources",
  "Completion rate": "completion",
  "Completion rate history": "history",
  "Quantitative objective to meet 100%": "objective",
  Trend: "trend",
  "Trend history": "trendHistory",
  "Date entered": "entered",
  "Last update": "updated",
} as const;

type TriggerKey = (typeof TRIGGER_KEYS)[keyof typeof TRIGGER_KEYS];

const KEY_LINE = new RegExp(
  `^(${Object.keys(TRIGGER_KEYS)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")}):[ \\t]?(.*)$`,
);

function trigger(block: string): Trigger | undefined {
  const f: Partial<Record<TriggerKey, string>> = {};
  let key: TriggerKey | undefined;
  for (const line of block.split("\n")) {
    const m = line.match(KEY_LINE);
    if (m) {
      key = TRIGGER_KEYS[m[1] as keyof typeof TRIGGER_KEYS];
      f[key] = m[2];
    } else if (key) {
      f[key] = `${f[key] ?? ""}\n${line}`;
    }
  }
  const title = text(f.title);
  if (!title) return undefined;
  const rawId = text(f.id) ?? "";
  const completion = Number(text(f.completion)?.replace("%", ""));
  const description = text(f.description)?.replace(/^:\s*/, "");
  const objective = text(f.objective)?.replace(/^(yes|no)\.\s*/i, "");
  const updated = dashDate(text(f.updated)) ?? dashDate(text(f.entered));
  return {
    id: rawId.match(/T\d+/)?.[0] ?? rawId,
    title,
    ...(description && { description: description.replace(/\s*\n\s*/g, " ") }),
    ...(objective && { objective: objective.replace(/\s*\n\s*/g, " ") }),
    ...(Number.isFinite(completion) && text(f.completion) && { completion }),
    ...(updated && { updated }),
    sources: citations(f.sources),
  };
}

function triggers(v: string | undefined): Trigger[] {
  if (!v) return [];
  return v
    .split(/\n(?=Trigger ID:)/)
    .map(trigger)
    .filter((t): t is Trigger => Boolean(t));
}

/* ------------------------------------------------------------------- risk */

/** ">500,000" -> "More than 500,000 people"; "20,000-100,000" -> "20,000–100,000 people". */
function exposure(v: string | null | undefined): string | undefined {
  const t = text(v);
  if (!t) return undefined;
  const n = t.replace(/\s+/g, "");
  if (n.startsWith(">")) return `More than ${n.slice(1)} people`;
  if (n.startsWith("<")) return `Fewer than ${n.slice(1)} people`;
  const range = n.match(/^([\d,]+)-([\d,]+)$/);
  return range ? `${range[1]}–${range[2]} people` : t;
}

function list(v: string | null | undefined): string[] {
  return (text(v) ?? "")
    .split(/[,;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseRisk(row: RadarRow): Risk | undefined {
  const id = text(row["Risk ID"]);
  const title = text(row["Risk Title"]);
  if (!id || !title) return undefined;

  const risk: Risk = {
    id,
    title,
    iso: text(row["ISO"]) ?? "",
    country: text(row["Country"]) ?? "",
    updates: updates(text(row["Rationale update"])),
    triggers: triggers(text(row["Triggers"])),
    priorityNeeds: list(row["Expected priority needs"]),
  };

  const type = text(row["Risk Type"]);
  const level = oneOf(row["Risk Level"], ["Low", "Medium", "High"] as const);
  const probability = oneOf(row["Probability"], ["Very low", "Low", "Medium", "High", "Very high"] as const);
  const impact = scale(row["Impact"]);
  const intensity = scale(row["Intensity of hazard"]);
  const exp = exposure(row["Expected exposure"]);
  const trend = oneOf(row["Risk trend"], ["Improved", "Stable", "Deteriorated"] as const);
  const status = oneOf(row["Status"], ["Active", "Materialised", "Not materialised"] as const);
  const rationale = prose(text(row["Rationale"]), bareUrls(row["Source"]));

  if (type) risk.type = type;
  if (level) risk.level = level;
  if (probability) risk.probability = probability;
  if (impact) risk.impact = impact;
  if (intensity) risk.intensity = intensity;
  if (exp) risk.exposure = exp;
  if (trend) risk.trend = trend;
  if (status) risk.status = status;
  if (rationale) risk.rationale = rationale;
  return risk;
}
