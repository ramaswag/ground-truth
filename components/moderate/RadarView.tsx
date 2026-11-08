"use client";

import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { Lens } from "@/lib/moderate";
import { coverage } from "@/lib/moderate";
import { Radar, type LensMark } from "./Radar";
import { RadarKey } from "./RadarKey";
import { Inspector } from "./Inspector";
import { AddRiskForm } from "./AddRiskForm";
import { DecisionItem } from "./DecisionsView";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

const LENSES: { id: Lens; label: string; legend: string }[] = [
  {
    id: "priority",
    label: "Priority",
    legend: "Highlighted: the five highest priorities, numbered. Priority is how bad a risk would be times how unsure we are.",
  },
  { id: "changes", label: "Changes this week", legend: "Highlighted: changed this week, with the number of changes." },
  {
    id: "coverage",
    label: "Coverage",
    legend: "Highlighted: one verified expert or none. Numbers are experts covering the risk.",
  },
  {
    id: "disagreement",
    label: "Disagreement",
    legend: "Highlighted: the panel is split or answers against ACAPS. Numbers are Yes and No this week.",
  },
];

export function RadarView() {
  const { data, risks, links, changes, lens, setLens, selected, select, open, addRisk, findExperts } = useWorkspace();
  const [adding, setAdding] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const panel = data.panel;

  const marks = useMemo<Record<string, LensMark>>(() => {
    const out: Record<string, LensMark> = {};
    if (lens === "priority") {
      [...risks]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5)
        .forEach((r, i) => (out[r.id] = { flag: true, value: String(i + 1), spoken: `priority ${i + 1} of 5` }));
    }
    for (const r of risks) {
      if (lens === "changes") {
        const n = changes.filter((c) => c.riskIds.includes(r.id)).length;
        if (n) out[r.id] = { flag: true, value: String(n), spoken: `${n} change${n === 1 ? "" : "s"} this week` };
      } else if (lens === "coverage") {
        const who = coverage(panel, r.id);
        const verified = who.filter((e) => e.identity === "verified").length;
        out[r.id] = {
          flag: verified <= 1,
          value: `${who.length}/${panel.length}`,
          spoken: `${who.length} of ${panel.length} experts cover it, ${verified} verified`,
        };
      } else if (lens === "disagreement" && r.panel) {
        const { yes, no, againstAcaps } = r.panel;
        out[r.id] = {
          flag: againstAcaps.length >= 2 || Math.abs(yes - no) <= 1,
          value: `${yes}–${no}`,
          spoken: `${yes} yes, ${no} no, ${againstAcaps.length} against ACAPS`,
        };
      }
    }
    return out;
  }, [lens, risks, changes, panel]);

  function onTabKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    const i = LENSES.findIndex((l) => l.id === lens);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % LENSES.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + LENSES.length) % LENSES.length;
    else return;
    e.preventDefault();
    setLens(LENSES[next].id);
    document.getElementById(`lens-${LENSES[next].id}`)?.focus();
  }

  const pending = open.find((d) => d.kind !== "pattern" && d.riskId === selected.id);
  const lensInfo = LENSES.find((l) => l.id === lens)!;

  return (
    <div className={s.bench}>
      <h1 className="visually-hidden">Risk radar, {data.context.name} panel</h1>
      <section aria-label="Risk radar" className={s.radarCol}>
        <div className={s.toolbar}>
          <div role="tablist" aria-label="What the radar shows" className={s.tabs}>
            {LENSES.map((l) => (
              <button
                key={l.id}
                id={`lens-${l.id}`}
                type="button"
                role="tab"
                aria-selected={lens === l.id}
                aria-controls="radar-panel"
                tabIndex={lens === l.id ? 0 : -1}
                className={s.tab}
                onClick={() => setLens(l.id)}
                onKeyDown={onTabKey}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button
            ref={addButtonRef}
            type="button"
            className="btn btn-primary"
            aria-expanded={adding}
            onClick={() => setAdding((a) => !a)}
          >
            <Plus aria-hidden size={18} strokeWidth={3} />
            Add risk
          </button>
        </div>
        {adding && (
          <AddRiskForm
            risks={risks}
            defaultTarget={selected.status === "mapped" ? selected.id : "R1043"}
            onAdd={(n) => {
              addRisk(n);
              setAdding(false);
              addButtonRef.current?.focus();
            }}
            onCancel={() => {
              setAdding(false);
              addButtonRef.current?.focus();
            }}
          />
        )}
        <div id="radar-panel" role="tabpanel" aria-labelledby={`lens-${lens}`} className={s.field}>
          <Radar risks={risks} links={links} lens={lens} marks={marks} selected={selected.id} onSelect={select} />
          <RadarKey lens={lens} sentence={lensInfo.legend} />
        </div>
      </section>

      <Inspector
        risk={selected}
        risks={risks}
        links={links}
        changes={changes}
        panel={panel}
        onSelect={select}
        onFindExperts={(id) =>
          findExperts(data.spaces.find((sp) => sp.riskIds.includes(id))?.name ?? selected.short)
        }
      >
        {pending && <DecisionItem d={pending} compact />}
      </Inspector>
    </div>
  );
}
