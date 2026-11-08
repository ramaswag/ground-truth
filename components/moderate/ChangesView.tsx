"use client";

import { useState } from "react";
import type { Change } from "@/lib/moderate";
import { formatWhen } from "@/lib/moderate";
import { NotYet, PageHead } from "./Chrome";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

const WHO: { id: "all" | Change["actor"]["kind"]; label: string }[] = [
  { id: "all", label: "Everyone" },
  { id: "expert", label: "Experts" },
  { id: "panel", label: "Panel" },
  { id: "analyst", label: "ACAPS" },
  { id: "you", label: "You" },
];

const KIND: Record<Change["kind"], string> = {
  "proposed-risk": "New risk proposed",
  "proposed-link": "New link proposed",
  "approved-link": "Link approved",
  "probability-move": "Probability",
  "answer-against": "Answer against ACAPS",
  "added-risk": "Risk added",
  "split-risk": "Risk split",
  "merged-risk": "Risk merged",
  "rejected-risk": "Risk rejected",
};

const ACTOR: Record<Change["actor"]["kind"], string> = { expert: "expert", analyst: "ACAPS", panel: "panel", you: "you" };

export function ChangesView() {
  const { data, changes, byId, showOnRadar } = useWorkspace();
  const [who, setWho] = useState<(typeof WHO)[number]["id"]>("all");
  const rows = changes.filter((c) => who === "all" || c.actor.kind === who);

  return (
    <section className={s.page} aria-labelledby="page-head">
      <PageHead title="Changes this week">
        Every new risk, link and reading in the {changes.length} changes since the round opened, newest first, with who
        made it.
      </PageHead>
      {!data.context.hasPanel && changes.length === 0 && (
        <NotYet>
          Nothing has changed on the {data.context.name} radar yet. Risks you add, links you draw, and readings the
          panel moves will all be logged here, with who made each change.
        </NotYet>
      )}
      <fieldset className={s.filters}>
        <legend className="visually-hidden">Show changes by</legend>
        {WHO.map((w) => {
          const n = w.id === "all" ? changes.length : changes.filter((c) => c.actor.kind === w.id).length;
          return (
            <label key={w.id} className={s.filter} data-on={who === w.id}>
              <input
                type="radio"
                name="who"
                className="visually-hidden"
                checked={who === w.id}
                onChange={() => setWho(w.id)}
              />
              {w.label} <span className={s.navCount}>{n}</span>
            </label>
          );
        })}
      </fieldset>
      {rows.length ? (
        <ul className={`${s.rows} ${s.changeRows}`}>
          {rows.map((c) => (
            <li key={c.id}>
              <span className={s.when}>{formatWhen(c.at)}</span>
              <span>
                <span className={s.kindLabel}>{KIND[c.kind]}</span>
                <span className={s.who}>{c.actor.name}</span>
                {c.actor.kind !== "you" && <span className={s.kind}> ({ACTOR[c.actor.kind]})</span>} {c.text}{" "}
                {c.riskIds
                  .filter((id) => byId[id])
                  .map((id) => (
                    <button
                      key={id}
                      type="button"
                      className={s.code}
                      data-status={byId[id].status}
                      onClick={() => showOnRadar(id)}
                      aria-label={`Show ${id} on the radar`}
                    >
                      {id}
                    </button>
                  ))}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className={s.empty}>No changes from {WHO.find((w) => w.id === who)!.label.toLowerCase()} this week.</p>
      )}
    </section>
  );
}
