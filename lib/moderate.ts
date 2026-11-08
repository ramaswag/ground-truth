/**
 * The ACAPS moderator's view of one context: its risk graph, panel, the week's changes and
 * what needs a decision. Draft data. Risks with an R ID are real Risk Radar records (read
 * through radar-source.ts); G risks are graph-only risks ACAPS added, P risks are proposals
 * from experts. Everything else here (links, panel, trends, changes, scores) is synthetic,
 * written for this UI draft. Expert and analyst names are invented: no real people.
 */

// Pure data and helpers: imported by browser components too, so no server-only imports here.
import type { Probability, RiskLevel, Trend } from "./radar";

/* ------------------------------------------------------------------ types */

export type Lens = "priority" | "changes" | "coverage" | "disagreement";

/** Very low = 1 … Very high = 5, the Radar's probability scale. */
export const PROBABILITY: Probability[] = ["Very low", "Low", "Medium", "High", "Very high"];

export type ActorKind = "expert" | "analyst" | "panel" | "you";
export type Actor = { name: string; kind: ActorKind };

export type GraphRisk = {
  id: string;
  title: string;
  /** Two or three words for the radar label. */
  short: string;
  place: string;
  /** 0 is the context's root; 1 is what the root causes, 2 what those cause, and so on. */
  layer: 0 | 1 | 2 | 3;
  /** Position on its ring, degrees clockwise from three o'clock. */
  angle: number;
  origin: "radar" | "acaps" | "expert";
  status: "mapped" | "proposed";
  proposedBy?: string;
  level?: RiskLevel;
  /** 1–5, see PROBABILITY. */
  probability?: number;
  impact?: number;
  trend?: Trend;
  /** 0–100: how bad it would be times how unsure we are. */
  priority: number;
  /** Panel answers on this risk's questions this week. */
  panel?: { yes: number; no: number; dontKnow: number; againstAcaps: string[]; median?: number };
  /** Weeks 34–45. ACAPS probability (1–5) and panel median where the panel was asked. */
  history: { week: number; acaps?: number; panel?: number }[];
  /** The week ACAPS last moved its reading, with what moved it. */
  lastMove?: { week: number; note: string };
};

export type GraphLink = {
  id: string;
  /** Row id in the database, for links a moderator drew and saved. */
  dbId?: number;
  from: string;
  to: string;
  status: "mapped" | "proposed";
  window: string;
  strength?: number;
};

export type ChangeKind =
  | "proposed-risk"
  | "proposed-link"
  | "approved-link"
  | "probability-move"
  | "answer-against"
  | "added-risk"
  | "split-risk"
  | "merged-risk"
  | "rejected-risk";

export type Change = {
  id: string;
  /** ISO date-time. */
  at: string;
  actor: Actor;
  kind: ChangeKind;
  riskIds: string[];
  text: string;
};

export type Expert = {
  /** Full name. ACAPS knows who every expert is; names here are invented for the draft. */
  name: string;
  role: string;
  base: string;
  identity: "verified" | "pending";
  forwardedBy?: string;
  covers: string[];
  answered: number;
  /** Brier score on resolved questions in this context: lower is better. */
  brier?: number;
  resolved: number;
  /** Answers against ACAPS's reading over the last 8 weeks. */
  against: number;
};

export type Decision =
  | { id: string; kind: "proposal"; riskId: string; source: string; duplicateOf?: string; at: string }
  | { id: string; kind: "move"; riskId: string; from: number; to: number; votes: string; at: string }
  | { id: string; kind: "pattern"; people: string[]; summary: string; at: string };

export type Outlier = {
  id: string;
  people: string[];
  kind: "against" | "pattern";
  headline: string;
  detail: string;
  reasons: { question: string; answer: string; text: string }[];
  read: string;
};

/** A problem space: the risks one kind of expertise answers for. */
export type Space = { name: string; riskIds: string[]; note: string };

export type Context = {
  /** ISO 3166 alpha-3 code, as in the Risk Radar's ISO column. */
  iso: string;
  name: string;
  week: number;
  closes: string;
  questions: number;
  /** The root risk, when the context has a mapped graph of links. */
  rootId?: string;
  /** True when ACAPS has mapped how this context's risks lead to each other (Chad, for now). */
  mapped: boolean;
  /** True when the context has an expert panel. */
  hasPanel: boolean;
  /** True for the demo workspace: sample data, nothing saved. Real countries save links to the database. */
  demo: boolean;
  /** What each ring means, index 0 to 3. Rings are distance from the root when mapped, status otherwise. */
  rings: [string, string, string, string];
  /** The risk selected when the radar opens. */
  focusId: string;
};

export type Workspace = {
  context: Context;
  spaces: Space[];
  risks: GraphRisk[];
  links: GraphLink[];
  changes: Change[];
  panel: Expert[];
  decisions: Decision[];
  outliers: Outlier[];
};

/* ------------------------------------------------------------------- data */

const WEEKS = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

/** ACAPS's reading per week, panel medians for the weeks it was asked. */
function history(acaps: (number | undefined)[], panel: Record<number, number> = {}): GraphRisk["history"] {
  return WEEKS.map((week, i) => ({ week, acaps: acaps[i], panel: panel[week] }));
}

const flat = (v: number) => WEEKS.map(() => v);

export type Seed = Omit<GraphRisk, "title" | "place" | "level" | "probability" | "impact" | "trend"> &
  Partial<Pick<GraphRisk, "title" | "place" | "level" | "probability" | "impact" | "trend">>;

const RISKS: Seed[] = [
  {
    id: "R0002",
    short: "Sudan conflict",
    layer: 0,
    angle: 0,
    origin: "radar",
    status: "mapped",
    priority: 38,
    history: history(flat(4)),
  },
  {
    id: "R1043",
    short: "Eastern Chad insecurity",
    layer: 1,
    angle: -90,
    origin: "radar",
    status: "mapped",
    priority: 92,
    panel: { yes: 4, no: 3, dontKnow: 0, againstAcaps: ["Adam Yacoub", "Ibrahim Nour", "Saleh Abdelkerim"], median: 5 },
    history: history([3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4], { 41: 4, 42: 4, 43: 4, 44: 5, 45: 5 }),
    lastMove: { week: 38, note: "ACAPS raised it to High after strikes reached Chadian territory" },
  },
  {
    id: "G-0011",
    title: "Chadian armed groups mobilise as proxies in the Sudan conflict",
    short: "Proxy mobilisation",
    place: "Eastern Chad",
    layer: 1,
    angle: 160,
    origin: "acaps",
    status: "mapped",
    level: "Medium",
    probability: 3,
    impact: 4,
    trend: "Stable",
    priority: 34,
    history: history(flat(3), { 43: 3 }),
  },
  {
    id: "G-0012",
    title: "Refugee arrivals in Ouaddaï outpace reception capacity",
    short: "Refugee surge",
    place: "Ouaddaï, Chad",
    layer: 1,
    angle: 20,
    origin: "acaps",
    status: "mapped",
    level: "High",
    probability: 4,
    impact: 4,
    trend: "Deteriorated",
    priority: 71,
    panel: { yes: 3, no: 4, dontKnow: 0, againstAcaps: ["Moussa Djibrine", "Clara Lindqvist", "Ibrahim Nour", "Saleh Abdelkerim"], median: 3 },
    history: history([undefined, undefined, undefined, undefined, 3, 3, 3, 4, 4, 4, 4, 4], { 44: 3, 45: 3 }),
    lastMove: { week: 41, note: "Split out of R1043 and rated High" },
  },
  {
    id: "R1055",
    short: "West Darfur returns",
    layer: 2,
    angle: -165,
    origin: "radar",
    status: "mapped",
    priority: 30,
    panel: { yes: 2, no: 0, dontKnow: 1, againstAcaps: [] },
    history: history(flat(3)),
  },
  {
    id: "G-0016",
    title: "Sudanese forces carry out retaliatory strikes on Chadian territory",
    short: "Retaliatory strikes",
    place: "Eastern Chad",
    layer: 2,
    angle: -90,
    origin: "acaps",
    status: "mapped",
    level: "High",
    probability: 3,
    impact: 5,
    trend: "Deteriorated",
    priority: 55,
    history: history([2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3], { 42: 3 }),
    lastMove: { week: 38, note: "Raised with R1043" },
  },
  {
    id: "R1066",
    short: "Lake Chad Basin",
    layer: 2,
    angle: -15,
    origin: "radar",
    status: "mapped",
    priority: 60,
    history: history(flat(5)),
  },
  {
    id: "P-0008",
    title: "Fuel and food prices spike in Abéché markets",
    short: "Abéché price spike",
    place: "Abéché, Chad",
    layer: 2,
    angle: 0,
    origin: "expert",
    status: "proposed",
    proposedBy: "Adam Yacoub",
    priority: 26,
    history: history([]),
  },
  {
    id: "G-0013",
    title: "Reception sites in eastern Chad are overcrowded",
    short: "Sites overcrowded",
    place: "Eastern Chad",
    layer: 2,
    angle: 65,
    origin: "acaps",
    status: "mapped",
    level: "Medium",
    probability: 4,
    impact: 3,
    trend: "Deteriorated",
    priority: 44,
    history: history([3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4], { 43: 4 }),
    lastMove: { week: 40, note: "Raised after UNHCR site counts" },
  },
  {
    id: "G-0015",
    title: "Tensions rise between host communities and refugees over water and land",
    short: "Host tensions",
    place: "Ouaddaï, Chad",
    layer: 2,
    angle: 125,
    origin: "acaps",
    status: "mapped",
    level: "Medium",
    probability: 3,
    impact: 3,
    trend: "Stable",
    priority: 33,
    history: history(flat(3)),
  },
  {
    id: "P-0007",
    title: "Measles outbreak in Farchana camp",
    short: "Measles, Farchana",
    place: "Farchana camp, Chad",
    layer: 3,
    angle: 30,
    origin: "expert",
    status: "proposed",
    proposedBy: "Fatimé Ousmane",
    priority: 40,
    history: history([]),
  },
  {
    id: "G-0014",
    title: "Disease outbreaks spread in overcrowded camps",
    short: "Disease outbreaks",
    place: "Eastern Chad",
    layer: 3,
    angle: 70,
    origin: "acaps",
    status: "mapped",
    level: "Medium",
    probability: 3,
    impact: 4,
    trend: "Deteriorated",
    priority: 80,
    panel: { yes: 1, no: 0, dontKnow: 4, againstAcaps: [] },
    history: history(flat(3), { 44: 4, 45: 4 }),
  },
];

const LINKS: GraphLink[] = [
  { id: "L-0021", from: "R0002", to: "R1043", status: "mapped", window: "6 months", strength: 0.8 },
  { id: "L-0022", from: "R0002", to: "G-0011", status: "mapped", window: "6 months", strength: 0.6 },
  { id: "L-0023", from: "R0002", to: "G-0012", status: "mapped", window: "3 months", strength: 0.9 },
  { id: "L-0034", from: "R1043", to: "R1055", status: "mapped", window: "6 months", strength: 0.5 },
  { id: "L-0040", from: "R1043", to: "G-0016", status: "mapped", window: "6 months", strength: 0.6 },
  { id: "L-0058", from: "R1043", to: "R1066", status: "proposed", window: "6 months" },
  { id: "L-0041", from: "G-0012", to: "G-0013", status: "mapped", window: "3 months", strength: 0.9 },
  { id: "L-0042", from: "G-0012", to: "G-0015", status: "mapped", window: "6 months", strength: 0.5 },
  { id: "L-0043", from: "G-0015", to: "G-0011", status: "mapped", window: "6 months", strength: 0.3 },
  { id: "L-0044", from: "G-0013", to: "G-0014", status: "mapped", window: "3 months", strength: 0.7 },
  { id: "L-0061", from: "G-0012", to: "P-0008", status: "proposed", window: "3 months" },
  { id: "L-0062", from: "G-0013", to: "P-0007", status: "proposed", window: "3 months" },
];

const CHANGES: Change[] = [
  {
    id: "C-118",
    at: "2026-11-07T09:12",
    actor: { name: "Fatimé Ousmane", kind: "expert" },
    kind: "proposed-risk",
    riskIds: ["P-0007", "G-0013"],
    text: "Proposed a new risk, Measles outbreak in Farchana camp, following from overcrowded sites.",
  },
  {
    id: "C-117",
    at: "2026-11-07T08:40",
    actor: { name: "Panel, 4 of 5 verified", kind: "panel" },
    kind: "probability-move",
    riskIds: ["R1043"],
    text: "Read it as Very high, one step above ACAPS; two newcomers held out. Waiting for an analyst.",
  },
  {
    id: "C-116",
    at: "2026-11-06T17:05",
    actor: { name: "Julie Mercier", kind: "analyst" },
    kind: "approved-link",
    riskIds: ["R1043", "R1055"],
    text: "Approved the link to West Darfur returns: 6 months, strength 0.5.",
  },
  {
    id: "C-115",
    at: "2026-11-06T11:30",
    actor: { name: "Adam Yacoub", kind: "expert" },
    kind: "answer-against",
    riskIds: ["R1043"],
    text: "Answered No against ACAPS on Q-0412: “Convoys still crossing at Adré every day.”",
  },
  {
    id: "C-114",
    at: "2026-11-05T16:20",
    actor: { name: "Adam Yacoub", kind: "expert" },
    kind: "proposed-risk",
    riskIds: ["P-0008", "G-0012"],
    text: "Proposed a new risk, Fuel and food price spike in Abéché, following from the refugee surge.",
  },
  {
    id: "C-113",
    at: "2026-11-05T10:02",
    actor: { name: "Julie Mercier", kind: "analyst" },
    kind: "proposed-link",
    riskIds: ["R1043", "R1066"],
    text: "Proposed a link to the Lake Chad Basin crisis; asked to the panel this week as Q-0414.",
  },
  {
    id: "C-112",
    at: "2026-11-04T15:00",
    actor: { name: "Amir Hassan", kind: "analyst" },
    kind: "split-risk",
    riskIds: ["G-0012", "R1043"],
    text: "Moved the refugee surge onto its own ring so the panel can be asked about it separately.",
  },
];

const PANEL: Expert[] = [
  {
    name: "Halima Abakar",
    role: "Conflict analyst",
    base: "N'Djamena",
    identity: "verified",
    covers: ["R0002", "R1043", "G-0011", "G-0016", "G-0015"],
    answered: 4,
    brier: 0.11,
    resolved: 14,
    against: 0,
  },
  {
    name: "Moussa Djibrine",
    role: "NGO field coordinator",
    base: "Abéché",
    identity: "verified",
    covers: ["R1043", "G-0012", "G-0013", "R1055", "G-0015"],
    answered: 2,
    brier: 0.16,
    resolved: 14,
    against: 1,
  },
  {
    name: "Adam Yacoub",
    role: "Cross-border trade network",
    base: "Adré",
    identity: "verified",
    covers: ["R0002", "R1043", "G-0012", "P-0008"],
    answered: 4,
    brier: 0.25,
    resolved: 14,
    against: 3,
  },
  {
    name: "Fatimé Ousmane",
    role: "Camp health worker",
    base: "Farchana",
    identity: "verified",
    covers: ["G-0012", "G-0013", "G-0014", "P-0007"],
    answered: 3,
    brier: 0.17,
    resolved: 12,
    against: 0,
  },
  {
    name: "Clara Lindqvist",
    role: "Researcher, Sudan conflict",
    base: "Remote",
    identity: "verified",
    covers: ["R0002", "R1055", "G-0011", "G-0016"],
    answered: 1,
    brier: 0.32,
    resolved: 14,
    against: 1,
  },
  {
    name: "Ibrahim Nour",
    role: "Forwarded newcomer",
    base: "Unknown",
    identity: "pending",
    forwardedBy: "Adam Yacoub",
    covers: ["R1043", "G-0012"],
    answered: 4,
    resolved: 3,
    against: 2,
  },
  {
    name: "Saleh Abdelkerim",
    role: "Forwarded newcomer",
    base: "Unknown",
    identity: "pending",
    forwardedBy: "Adam Yacoub",
    covers: ["R1043", "G-0012"],
    answered: 4,
    resolved: 3,
    against: 2,
  },
];

const DECISIONS: Decision[] = [
  {
    id: "D-31",
    kind: "proposal",
    riskId: "P-0007",
    source: "MSF situation report, 5 Nov",
    duplicateOf: "G-0014",
    at: "2026-11-07T09:12",
  },
  { id: "D-30", kind: "move", riskId: "R1043", from: 4, to: 5, votes: "4 of 5 verified experts", at: "2026-11-07T08:40" },
  { id: "D-29", kind: "proposal", riskId: "P-0008", source: "Market price survey, Abéché", at: "2026-11-05T16:20" },
  {
    id: "D-28",
    kind: "pattern",
    people: ["Ibrahim Nour", "Saleh Abdelkerim"],
    summary: "Both forwarded by Adam Yacoub on 2 Nov, same answers on 4 of 4 questions, sent within 10 minutes.",
    at: "2026-11-06T12:00",
  },
];

const OUTLIERS: Outlier[] = [
  {
    id: "O-12",
    people: ["Adam Yacoub"],
    kind: "against",
    headline: "Adam Yacoub answers against ACAPS on 3 of the last 4 forecasts, all on R1043",
    detail: "Against ACAPS. Reliability 0.25, mid-panel; covers the Adré crossing directly.",
    reasons: [
      { question: "Q-0412", answer: "No", text: "Convoys still crossing at Adré every day; no strikes near the airport." },
      { question: "Q-0413", answer: "No", text: "Armed groups pulled back from the border after the October talks." },
    ],
    read: "Specific and first-hand: treat it as signal. Ask what they are seeing before the round closes.",
  },
  {
    id: "O-11",
    people: ["Ibrahim Nour", "Saleh Abdelkerim"],
    kind: "pattern",
    headline: "Ibrahim Nour and Saleh Abdelkerim, two forwarded newcomers, answer alike",
    detail: "Pattern to review. Same answers on 4 of 4 questions, within 10 minutes, both forwarded by Adam Yacoub.",
    reasons: [],
    read: "Held out of the panel view until an analyst reviews them. If it is coordination, removal is open, never silent.",
  },
];

const SPACES: Space[] = [
  {
    name: "Lake Chad Basin spillover",
    riskIds: ["R1066"],
    note: "The link from eastern Chad is asked this week, but nobody on the panel knows the basin.",
  },
  {
    name: "Health in the camps",
    riskIds: ["G-0014", "P-0007"],
    note: "4 of 5 answers on disease questions this week were Don't know.",
  },
  {
    name: "Markets and prices in Abéché",
    riskIds: ["P-0008"],
    note: "Only the expert who proposed the risk covers it.",
  },
  {
    name: "Armed groups and cross-border security",
    riskIds: ["R1043", "G-0011", "G-0016"],
    note: "Well covered, though most of it runs through the Adré crossing.",
  },
];

/** The Chad sample: everything except the Radar fields of R risks, which are read at load. */
export const CHAD_SAMPLE = {
  risks: RISKS,
  links: LINKS,
  changes: CHANGES,
  panel: PANEL,
  decisions: DECISIONS,
  outliers: OUTLIERS,
  spaces: SPACES,
};

export { WEEKS };

/** The demo workspace: Chad with a made-up panel, links and decisions. Every real country starts from the Risk Radar alone. */
export const DEMO_ISO = "DEMO";

const STOP = new Set(
  "in on of the and to by for from with a an at as between across into over linked leads lead leading due after amid during around near among".split(
    " ",
  ),
);

/** Two to four words for the radar label: the title up to its first small word after the second. */
export function shortLabel(title: string): string {
  const words = title.replace(/[.,:;()]/g, " ").split(/\s+/).filter(Boolean);
  const out: string[] = [];
  for (const w of words) {
    if (out.length >= 2 && STOP.has(w.toLowerCase())) break;
    out.push(w);
    if (out.length === 4) break;
  }
  while (out.length > 1 && STOP.has(out[out.length - 1].toLowerCase())) out.pop();
  return out.join(" ");
}

/** A free spot on a ring near an angle, keeping labels apart. Used on the server and in the browser. */
export function freeAngle(risks: Pick<GraphRisk, "layer" | "angle">[], layer: number, near: number): number {
  const gap = layer === 1 ? 50 : layer === 2 ? 30 : 24;
  const taken = risks.filter((r) => r.layer === layer).map((r) => r.angle);
  const dist = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);
  for (let step = 0; step <= 180; step += 10) {
    for (const a of step ? [near + step, near - step] : [near]) {
      if (taken.every((t) => dist(a, t) >= gap)) return a;
    }
  }
  return near + 180;
}

/* ---------------------------------------------------------------- helpers */

export function coverage(panel: Expert[], riskId: string): Expert[] {
  return panel.filter((e) => e.covers.includes(riskId));
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-07T09:12" -> "Sat 7 Nov, 09:12". Parsed by hand so server and client agree. */
export function formatWhen(at: string): string {
  const [date, time] = at.split("T");
  const [y, m, d] = date.split("-").map(Number);
  const day = DAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${day} ${d} ${MONTHS[m - 1]}${time ? `, ${time}` : ""}`;
}

/* ------------------------------------------------------------------ wheel */

/** The wheel is drawn in a 760 x 680 box; Radar.tsx places risks in % of it so it can scale. */
export const WHEEL_W = 760;
export const WHEEL_H = 680;
/** Ring radii in that box, centre first. Ring 1 leaves room for a long centre label. */
export const WHEEL_RADII = [0, 150, 235, 312] as const;

/** What each ring means, from the centre out (inspector, screen readers, phone list). */
export const WHEEL_RINGS = ["Centre", "Directly linked", "Two steps away", "Three steps away"] as const;
/** The short marks drawn on the rings themselves. */
export const WHEEL_RING_MARKS = ["", "L1", "L2", "L3"] as const;

export function wheelPoint(layer: number, angle: number): { x: number; y: number } {
  const rad = (angle * Math.PI) / 180;
  const r = WHEEL_RADII[layer] ?? 0;
  return { x: WHEEL_W / 2 + r * Math.cos(rad), y: WHEEL_H / 2 + r * Math.sin(rad) };
}

type Box = { x: number; y: number; w: number; h: number };

/** A risk label's size on the wheel, estimated: 13px bold text, level square, padding, number tag. */
function labelBox(short: string, layer: number, angle: number): Box {
  const w = Math.round(short.length * 7.6 + 52);
  const h = 32;
  const p = wheelPoint(layer, angle);
  return { x: p.x - w / 2, y: p.y - h / 2, w, h };
}

const GAP = 6;
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.w + GAP && b.x < a.x + a.w + GAP && a.y < b.y + b.h + GAP && b.y < a.y + a.h + GAP;
const inside = (b: Box) => b.x >= 4 && b.y >= 4 && b.x + b.w <= WHEEL_W - 4 && b.y + b.h <= WHEEL_H - 4;

/**
 * One risk per wheel: the chosen risk sits in the centre, the risks linked to it (either
 * direction) on the first ring, the risks linked to those on the second, and so on to the
 * third. Risks with no path to the centre are left off this wheel.
 *
 * Each label is placed at the nearest angle where it fits inside the box without touching
 * another label or a ring mark, so long titles never pile up. Returns copies with layer and
 * angle set for this wheel; the stored risks are not changed.
 */
export function wheelAround(centreId: string, risks: GraphRisk[], links: GraphLink[]): GraphRisk[] {
  const byId = new Map(risks.map((r) => [r.id, r]));
  const centre = byId.get(centreId);
  if (!centre) return [];

  const neighbours = (id: string) =>
    links
      .flatMap((l) => (l.from === id ? [l.to] : l.to === id ? [l.from] : []))
      .filter((n) => byId.has(n));

  const depth = new Map<string, number>([[centreId, 0]]);
  const parent = new Map<string, string>();
  let frontier = [centreId];
  for (let d = 1; d <= 3 && frontier.length; d++) {
    const next: string[] = [];
    for (const id of frontier) {
      for (const n of neighbours(id)) {
        if (depth.has(n)) continue;
        depth.set(n, d);
        parent.set(n, id);
        next.push(n);
      }
    }
    frontier = next;
  }

  const ringOf = (d: number) =>
    [...depth]
      .filter(([, x]) => x === d)
      .map(([id]) => byId.get(id)!)
      .sort((a, b) => b.priority - a.priority);

  // The ring marks sit just left of each ring; labels keep clear of them too.
  const taken: Box[] = [1, 2, 3].map((layer) => ({
    x: WHEEL_W / 2 - WHEEL_RADII[layer] - 64,
    y: WHEEL_H / 2 - 12,
    w: 60,
    h: 20,
  }));
  taken.push(labelBox(centre.short, 0, 0));

  /** The nearest angle to `want` where this label fits; `want` itself if nothing does. */
  function settle(r: GraphRisk, layer: number, want: number): number {
    for (let step = 0; step <= 180; step += 3) {
      for (const a of step ? [want + step, want - step] : [want]) {
        const box = labelBox(r.short, layer, a);
        if (inside(box) && !taken.some((t) => overlaps(box, t))) {
          taken.push(box);
          return a;
        }
      }
    }
    taken.push(labelBox(r.short, layer, want));
    return want;
  }

  const out: GraphRisk[] = [{ ...centre, layer: 0, angle: 0 }];
  // First ring: aim for an even spread, highest priority at twelve o'clock.
  const first = ringOf(1);
  first.forEach((r, i) => out.push({ ...r, layer: 1, angle: settle(r, 1, -90 + (i * 360) / first.length) }));
  // Outer rings: as close as there is room to the risk that links them in.
  for (const d of [2, 3] as const) {
    for (const r of ringOf(d)) {
      const from = out.find((x) => x.id === parent.get(r.id));
      out.push({ ...r, layer: d, angle: settle(r, d, from?.angle ?? -90) });
    }
  }
  return out;
}
