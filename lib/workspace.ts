/**
 * Builds the moderator's workspace on the server, from the SQLite database (lib/db.ts).
 * Only Server Components import it.
 *
 * Two kinds of workspace:
 * - DEMO: Chad with a made-up panel, links, changes and decisions (CHAD_SAMPLE in
 *   moderate.ts). Its R risks read their real Radar fields. Nothing is saved.
 * - One per country in the Risk Radar export, real data only. Links moderators draw there
 *   are saved; the panel, decision, change, gap and outlier pages stay empty for now.
 */

import { getRisk, listCountries, risksIn } from "./radar-source";
import { linksIn } from "./db";
import type { Probability, Risk } from "./radar";
import { CHAD_SAMPLE, DEMO_ISO, WEEKS, shortLabel } from "./moderate";
import type { Context, GraphLink, GraphRisk, Workspace } from "./moderate";

const PROB_INDEX: Record<Probability, number> = { "Very low": 1, Low: 2, Medium: 3, High: 4, "Very high": 5 };
const WEEK = WEEKS[WEEKS.length - 1];
const CLOSES = "2026-11-21";

/** The Radar fields a graph node reads from a Risk Radar record. */
function fromRadar(r: Risk): Pick<GraphRisk, "title" | "place" | "level" | "probability" | "impact" | "trend"> {
  return {
    title: r.title,
    place: r.country,
    ...(r.level && { level: r.level }),
    ...(r.probability && { probability: PROB_INDEX[r.probability] }),
    ...(r.impact && { impact: r.impact }),
    ...(r.trend && { trend: r.trend }),
  };
}

/**
 * Priority from the Radar alone, 0 to 100: probability times impact, halved once a risk is
 * no longer active. Unrated fields count as Medium (3). Once a panel is asked, its spread of
 * answers can supply the "how unsure we are" half; until then this is the ACAPS reading only.
 */
function radarPriority(r: Pick<Risk, "probability" | "impact" | "status">): number {
  const p = r.probability ? PROB_INDEX[r.probability] : 3;
  const i = r.impact ?? 3;
  const base = p * i * 4;
  return Math.round(r.status === "Active" ? base : base / 2);
}

/** History with only this week's ACAPS reading: the export holds no past readings. */
function oneReading(r: Risk): GraphRisk["history"] {
  const now = r.probability ? PROB_INDEX[r.probability] : undefined;
  return WEEKS.map((week) => ({ week, acaps: week === WEEK ? now : undefined }));
}

function node(r: Risk, layer: 1 | 2 | 3, angle: number): GraphRisk {
  return {
    id: r.id,
    short: shortLabel(r.title),
    ...fromRadar(r),
    layer,
    angle,
    origin: "radar",
    status: "mapped",
    priority: radarPriority(r),
    history: oneReading(r),
  };
}

const STATUS_RING: Record<string, 1 | 2 | 3> = { Active: 1, Materialised: 2 };
const RING_NAME = ["", "Active", "Materialised", "Closed"];
/** How many labels fit on each ring before they collide (see the gaps in freeAngle, moderate.ts). */
const RING_ROOM = [0, 7, 12, 16];

/**
 * Without mapped links there is no root and no distance from it, so the rings show status
 * instead: active risks inside, materialised in the middle, closed outside. A full ring
 * passes its lowest priorities outwards, and each ring's label says what it holds.
 */
function statusLayout(records: Risk[]): { risks: GraphRisk[]; rings: Context["rings"] } {
  const rows = records
    .map((r) => ({ r, ring: STATUS_RING[r.status ?? ""] ?? 3, priority: radarPriority(r) }))
    .sort((a, b) => a.ring - b.ring || b.priority - a.priority);

  const onRing: (typeof rows)[] = [[], [], [], []];
  for (const row of rows) {
    let layer = row.ring;
    while (layer < 3 && onRing[layer].length >= RING_ROOM[layer]) layer++;
    onRing[layer].push(row);
  }

  const risks: GraphRisk[] = [];
  const rings: Context["rings"] = ["", "", "", ""];
  for (const layer of [1, 2, 3] as const) {
    const items = onRing[layer];
    const held = [...new Set(items.map((x) => x.ring))].sort().map((n) => RING_NAME[n]);
    rings[layer] = held.length ? held.join(", ") : "";
    const step = 360 / Math.max(items.length, 1);
    // Each ring starts a little further round so labels on neighbouring rings do not line up.
    const start = -90 + layer * 17;
    items.forEach(({ r }, i) => risks.push(node(r, layer, Math.round(start + i * step))));
  }
  return { risks, rings };
}

async function demoWorkspace(): Promise<Workspace> {
  const risks = await Promise.all(
    CHAD_SAMPLE.risks.map(async (seed): Promise<GraphRisk> => {
      if (seed.origin !== "radar") return seed as GraphRisk;
      const r = await getRisk(seed.id);
      return { ...seed, ...(r ? fromRadar(r) : { title: seed.id, place: "" }) };
    }),
  );

  return {
    context: {
      iso: DEMO_ISO,
      name: "Chad (demo)",
      week: WEEK,
      closes: CLOSES,
      questions: 4,
      rootId: "R0002",
      mapped: true,
      hasPanel: true,
      demo: true,
      rings: ["Root", "Layer 1", "Layer 2", "Layer 3"],
      focusId: "R1043",
    },
    ...CHAD_SAMPLE,
    risks,
  };
}

/** Links moderators drew in this country and saved. */
function savedLinks(iso: string): GraphLink[] {
  return linksIn(iso).map((l) => ({
    id: `L-db-${l.id}`,
    dbId: l.id,
    from: l.from_id,
    to: l.to_id,
    status: "mapped",
    window: l.horizon,
  }));
}

/** The moderator's workspace for one country, by ISO code; undefined if the export has none. */
export async function getWorkspace(iso: string): Promise<Workspace | undefined> {
  const code = iso.toUpperCase();
  if (code === DEMO_ISO) return demoWorkspace();

  const country = (await listCountries()).find((c) => c.iso === code);
  if (!country) return undefined;
  const { risks, rings } = statusLayout(await risksIn(code));
  const focus = [...risks].sort((a, b) => a.layer - b.layer || b.priority - a.priority)[0];

  return {
    context: {
      iso: code,
      name: country.name,
      week: WEEK,
      closes: CLOSES,
      questions: 0,
      mapped: false,
      hasPanel: false,
      demo: false,
      rings,
      focusId: focus?.id ?? "",
    },
    spaces: [],
    risks,
    links: savedLinks(code),
    changes: [],
    panel: [],
    decisions: [],
    outliers: [],
  };
}
