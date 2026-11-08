/**
 * Draft data. Questions are authored by ACAPS analysts and point at a Risk Radar risk by
 * ID; the risk itself comes from the Radar (see radar-source.ts) and links between risks
 * from the risk graph (graph.ts). The questions, panel and dates below are synthetic,
 * written for this UI draft.
 *
 * Every expert in a context gets the same weekly set, at most five questions. Each closes
 * within one to two days, so answers land before ACAPS's weekly Risk Radar update. Two clocks
 * per question: `answerBy` (when answering closes, a UTC timestamp) and what the question is
 * about (in its text, plus `resolvesOn`). Three kinds:
 * - verify:  is this true now? Checked against sources within days.
 * - predict: will this happen? Resolves on a date.
 * - map:     does this risk drive that one? Joins the graph once an analyst approves.
 */

import { getRisk } from "./radar-source";
import { getLink, type LinkStatus } from "./graph";
import type { Risk, RiskLevel } from "./radar";

export type { Risk, SourceRef, Trigger, Update, RiskLevel } from "./radar";

export type QuestionKind = "verify" | "predict" | "map";

export const KIND_LABEL: Record<QuestionKind, string> = {
  verify: "Fact check",
  predict: "Forecast",
  map: "Risk link",
};

type QuestionRecord = {
  id: string;
  kind: QuestionKind;
  text: string;
  /**
   * Set when `text` is a claim rather than a question: what Yes / No / Don't know answer,
   * shown beside the answers wherever the question travels (page, WhatsApp, email, card).
   */
  ask?: string;
  counts: string;
  riskId: string;
  /** Where the question is about, as said in a sentence: the Radar only records the country. */
  area: string;
  testsTrigger?: string;
  /**
   * The analyst's current reading, set when the question is written. An answer the other
   * way asks the expert what they are seeing: those answers carry the most information.
   * `basis` completes "ACAPS currently reads this as likely: …".
   */
  acapsReading?: { answer: "yes" | "no"; basis: string };
  /** verify: what ACAPS checks the answers against. */
  checkedAgainst?: string;
  /** map: the graph link this question asks about, with each end's place said in a sentence. */
  asksLink?: { id: string; fromArea: string; toArea: string };
  /** predict: mapped links shown after answering, asked the same of every expert. */
  followUps?: string[];
  askedBy: string;
  askedOn: string;
  /** When answering closes: a UTC timestamp, one to two days after the question goes out. */
  answerBy: string;
  /** predict: resolution date. verify: when answers are checked. map: end of the link's window. */
  resolvesOn: string;
  panel: { name: string; size: number };
  position: { index: number; total: number };
  next?: string;
};

/** The few fields of a risk a link needs to name it. Kept small: it travels to the browser. */
export type RiskStub = { id: string; place: string; title?: string; level?: RiskLevel };

export type LinkView = {
  id: string;
  status: LinkStatus;
  window: string;
  from: RiskStub;
  to: RiskStub;
};

/** A question with its risk and links resolved. `risk` is absent when the Radar has no such risk. */
export type Question = QuestionRecord & { risk?: Risk; link?: LinkView; followUpLinks?: LinkView[] };

const WEEK = {
  askedBy: "ACAPS Chad analysis team",
  askedOn: "2026-11-07",
  answerBy: "2026-11-09T12:00:00Z",
  panel: { name: "Chad", size: 7 },
};

const QUESTIONS: QuestionRecord[] = [
  {
    id: "Q-0411",
    kind: "verify",
    text: "Humanitarian access is disrupted around Adré and Tiné.",
    ask: "Is this true now?",
    counts:
      "Yes if aid convoys or humanitarian staff could not reach people around Adré or Tiné on most days from 2 to 8 November. No if they got through on most days.",
    riskId: "R1043",
    area: "Eastern Chad",
    checkedAgainst: "UNHCR and OCHA access reports",
    ...WEEK,
    // A fact check is about now: one day to answer.
    answerBy: "2026-11-08T12:00:00Z",
    resolvesOn: "2026-11-10",
    position: { index: 1, total: 4 },
    next: "Q-0412",
  },
  {
    id: "Q-0412",
    kind: "predict",
    text: "Will there be a direct attack on strategic infrastructure in eastern Chad before 7 May 2027?",
    counts:
      "Counts if a strike or armed attack hits an airport such as Amdjarass, a military facility, a border post or a major transport corridor, and causes significant disruption.",
    riskId: "R1043",
    area: "Eastern Chad",
    testsTrigger: "T0619",
    acapsReading: {
      answer: "yes",
      basis: "it rates this risk High probability, and strikes have already reached Chadian territory.",
    },
    followUps: ["L-0021", "L-0034"],
    ...WEEK,
    resolvesOn: "2027-05-07",
    position: { index: 2, total: 4 },
    next: "Q-0413",
  },
  {
    id: "Q-0413",
    kind: "predict",
    text: "Will Chadian or Sudanese armed groups openly take part in cross-border hostilities in eastern Chad before 7 May 2027?",
    counts:
      "Counts if militias, rebel groups or proxy forces operating across the Chad–Sudan border are reported fighting on Chadian territory, causing sustained violence or retaliatory attacks.",
    riskId: "R1043",
    area: "Eastern Chad",
    testsTrigger: "T0620",
    acapsReading: { answer: "yes", basis: "it rates this risk High probability, with a deteriorating trend." },
    ...WEEK,
    resolvesOn: "2027-05-07",
    position: { index: 3, total: 4 },
    next: "Q-0414",
  },
  {
    id: "Q-0414",
    kind: "map",
    text: "Could escalating insecurity in eastern Chad make the Lake Chad Basin crisis more likely to escalate within 6 months?",
    counts:
      "Yes if insecurity in the east would itself raise the chance of escalation around Lake Chad.",
    riskId: "R1043",
    area: "Eastern Chad",
    asksLink: { id: "L-0058", fromArea: "Eastern Chad", toArea: "Lake Chad Basin" },
    ...WEEK,
    resolvesOn: "2027-05-07",
    position: { index: 4, total: 4 },
  },
];

function stub(id: string, place: string, risk?: Risk): RiskStub {
  return { id, place, ...(risk && { title: risk.title }), ...(risk?.level && { level: risk.level }) };
}

async function linkView(
  id: string,
  opts: { sparse?: boolean },
  areas?: { fromArea: string; toArea: string },
): Promise<LinkView | undefined> {
  const link = getLink(id);
  if (!link) return undefined;
  const [from, to] = await Promise.all([getRisk(link.from, opts), getRisk(link.to, opts)]);
  return {
    id: link.id,
    status: link.status,
    window: link.window,
    from: stub(link.from, areas?.fromArea ?? from?.country ?? "", from),
    to: stub(link.to, areas?.toArea ?? to?.country ?? "", to),
  };
}

export async function getQuestion(id: string, opts: { sparse?: boolean } = {}): Promise<Question | undefined> {
  const record = QUESTIONS.find((q) => q.id.toLowerCase() === id.toLowerCase());
  if (!record) return undefined;
  const [risk, link, followUpLinks] = await Promise.all([
    getRisk(record.riskId, opts),
    record.asksLink ? linkView(record.asksLink.id, opts, record.asksLink) : undefined,
    record.followUps ? Promise.all(record.followUps.map((l) => linkView(l, opts))) : undefined,
  ]);
  return {
    ...record,
    ...(risk && { risk }),
    ...(link && { link }),
    ...(followUpLinks && { followUpLinks: followUpLinks.filter((l): l is LinkView => Boolean(l)) }),
  };
}

export const FIRST_QUESTION_ID = QUESTIONS[0].id;

/** "Central African Republic" -> "central-african-republic", as ReliefWeb writes countries in its URLs. */
function slug(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Questions whose risk sits in any of the given places. A token is an ISO3 code ("tcd") or a
 * country slug ("chad"), the two ways a ReliefWeb report names its countries.
 */
export async function findQuestions(tokens: string[]): Promise<Question[]> {
  const wanted = new Set(tokens.map((t) => t.trim().toLowerCase()).filter(Boolean));
  if (!wanted.size) return [];
  const all = await Promise.all(QUESTIONS.map((q) => getQuestion(q.id)));
  return all.filter((q): q is Question => {
    if (!q?.risk) return false;
    const isos = q.risk.iso.split(",").map((s) => s.trim().toLowerCase());
    const names = q.risk.country.split(",").map((s) => slug(s));
    return [...isos, ...names].some((t) => wanted.has(t));
  });
}
