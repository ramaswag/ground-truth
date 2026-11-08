"use client";

import { Check } from "lucide-react";
import type { AskPick, Expert, GraphRisk } from "@/lib/moderate";
import { askReasons, reliability, whoToAsk } from "@/lib/moderate";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

/**
 * "Who to ask next round": the risks whose panel reading this week makes a direct ask worth it,
 * and the verified experts to put that ask to. A direct ask is a personal note on the same
 * question everyone gets, so the answer still counts like any other.
 */
export function AskNext({ risk, inline }: { risk: GraphRisk; inline?: boolean }) {
  const { risks, links, data, held, asks, toggleAsk } = useWorkspace();
  const reasons = askReasons(risk, data.panel, Boolean(held[risk.id]));
  const picks = whoToAsk(risk, risks, links, data.panel);
  if (!reasons.length || !picks.length) return null;

  const flagged = asks[risk.id] ?? [];

  return (
    <section className={inline ? s.askInline : s.block} aria-label="Who to ask next round">
      <div className={inline ? s.askInlineHead : s.blockHead}>
        <h3>Who to ask next round</h3>
      </div>
      <p className={s.summary}>{reasonLine(reasons)}.</p>
      <ul className={s.askRows}>
        {picks.map((p) => {
          const on = flagged.includes(p.expert.name);
          return (
            <li key={p.expert.name} className={s.askRow}>
              <span className={s.askWho}>
                <strong>{p.expert.name}</strong>
                <span className={s.askHow}>{howTheyKnow(p)}</span>
              </span>
              <span className={s.askRel}>{reliabilityText(p.expert)}</span>
              <button
                type="button"
                className={`${s.askToggle}${on ? ` ${s.askToggleOn}` : ""}`}
                aria-pressed={on}
                onClick={() => toggleAsk(risk.id, p.expert.name)}
              >
                {on && <Check aria-hidden size={14} strokeWidth={3} />}
                {on ? "Asked" : "Ask directly"}
              </button>
            </li>
          );
        })}
      </ul>
      <p className={s.askNote}>
        A direct ask is a personal note on the same question everyone gets, so the answer still counts like any other.
      </p>
    </section>
  );
}

/** "Covers it" or "covers the risk that drives it", with where they are based. */
function howTheyKnow(p: AskPick): string {
  const based = p.local ? " · based there" : "";
  if (!p.via) return `covers this risk${based}`;
  const link = p.via.drives
    ? `covers ${p.via.risk.short}, which drives it`
    : `covers ${p.via.risk.short}, which it drives`;
  const proposed = p.via.proposed ? " · proposed link" : "";
  return `${link}${proposed}${based}`;
}

function reliabilityText(e: Expert): string {
  const r = reliability(e);
  return r !== undefined ? `Brier ${r.toFixed(2)}` : "Too early to rate";
}

/** Reasons are clauses like "the panel split 4 to 3"; make one sentence of them. */
function reasonLine(reasons: string[]): string {
  const [first, ...rest] = reasons;
  const start = first.charAt(0).toUpperCase() + first.slice(1);
  return rest.length ? `${start}, and ${rest.join(", ")}` : start;
}
