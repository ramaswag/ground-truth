import type { Question } from "./questions";
import { formatDate, formatDeadline } from "./dates";

/**
 * Transposition: one question unit, set for each medium it travels in.
 * Every medium carries the three answers, so the question can be answered
 * from wherever it lands (WhatsApp, email, a partner platform).
 */

export type AnswerValue = "yes" | "no" | "dk";

export const ANSWERS: { value: AnswerValue; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "dk", label: "Don’t know" },
];

export function answerLabel(value: AnswerValue): string {
  return ANSWERS.find((a) => a.value === value)!.label;
}

export function isAnswerValue(v: unknown): v is AnswerValue {
  return v === "yes" || v === "no" || v === "dk";
}

export type Intro = "forward" | "share";

export type Unit = {
  question: Question;
  origin: string; // e.g. https://groundtruth.example.org ("" before mount)
  referral?: string; // token so ACAPS can trace who forwarded, never shown to the recipient
  personalLine?: string;
  intro: Intro;
};

export function questionUrl(origin: string, id: string, answer?: AnswerValue, referral?: string): string {
  const params = new URLSearchParams();
  if (answer) params.set("a", answer);
  if (referral) params.set("r", referral);
  const qs = params.toString();
  return `${origin}/q/${id}${qs ? `?${qs}` : ""}`;
}

/** "Eastern Chad" -> "eastern Chad" for use mid-sentence. */
function inSentence(area: string): string {
  return area.charAt(0).toLowerCase() + area.slice(1);
}

function introLine(unit: Unit): string {
  const area = inSentence(unit.question.area);
  return unit.intro === "forward"
    ? `ACAPS asked me this about ${area} and I don’t know. You might.`
    : `ACAPS is asking a small expert panel about ${area}. Could you answer?`;
}

function trustLine(unit: Unit): string {
  // Anyone reached through a referral link is not yet on the panel, so ACAPS reviews them first.
  return unit.referral
    ? "Your answer goes to ACAPS, who check who you are before it counts. Other experts never see your name."
    : "Answers are anonymous to other experts and never published with a name.";
}

/** WhatsApp: *bold* and _italic_ are its native emphasis. */
export function whatsappText(unit: Unit): string {
  const { question: q, origin, referral } = unit;
  const lines: string[] = [];
  if (unit.personalLine?.trim()) lines.push(unit.personalLine.trim(), "");
  lines.push(introLine(unit), "");
  lines.push(`*${q.text}*`);
  lines.push(`_${q.counts}_`, "");
  lines.push(q.ask ? `${q.ask} Tap one to answer:` : "Tap one to answer:");
  for (const a of ANSWERS) lines.push(`${a.label}: ${questionUrl(origin, q.id, a.value, referral)}`);
  lines.push("");
  lines.push(`Open until ${formatDeadline(q.answerBy)}. ${trustLine(unit)}`);
  lines.push("", "Ground Truth by ACAPS");
  return lines.join("\n");
}

export function whatsappHref(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function emailSubject(unit: Unit): string {
  const area = inSentence(unit.question.area);
  return unit.intro === "forward"
    ? `Can you answer this ACAPS question on ${area}?`
    : `ACAPS question on ${area}: ${unit.question.ask ? `${unit.question.ask} ` : ""}${unit.question.text}`;
}

/** Plain text, because a mailto: body cannot carry markup. */
export function emailBody(unit: Unit): string {
  const { question: q, origin, referral } = unit;
  const lines: string[] = [];
  if (unit.personalLine?.trim()) lines.push(unit.personalLine.trim(), "");
  lines.push(introLine(unit), "");
  lines.push(q.text, "");
  lines.push(q.counts, "");
  lines.push(q.ask ? `${q.ask} Answer with one click:` : "Answer with one click:");
  for (const a of ANSWERS) lines.push(`  ${a.label}  ${questionUrl(origin, q.id, a.value, referral)}`);
  lines.push("");
  lines.push(`Open until ${formatDeadline(q.answerBy)}. Resolves ${formatDate(q.resolvesOn)}.`);
  lines.push(trustLine(unit), "");
  lines.push("Ground Truth by ACAPS");
  return lines.join("\n");
}

export function mailtoHref(unit: Unit): string {
  return `mailto:?subject=${encodeURIComponent(emailSubject(unit))}&body=${encodeURIComponent(emailBody(unit))}`;
}

/** Referral token for a forward. Random per forward; ACAPS maps it to the forwarding expert. */
export function newReferral(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let out = "";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return out;
}
