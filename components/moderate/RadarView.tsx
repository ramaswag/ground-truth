"use client";

import { useMemo, useRef, useState } from "react";
import { Plus } from "lucide-react";
import type { Lens } from "@/lib/moderate";
import { WHEEL_RINGS, coverage, wheelAround } from "@/lib/moderate";
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
  const {
    data,
    base,
    risks,
    links,
    changes,
    lens,
    setLens,
    selected,
    select,
    centreId,
    centreOn,
    open,
    addRisk,
    findExperts,
    addLink,
    removeLink,
  } = useWorkspace();
  const [adding, setAdding] = useState(false);
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const panel = data.panel;

  // One risk per wheel: the chosen risk in the centre, the risks linked to it around it.
  const wheel = useMemo(() => wheelAround(centreId, risks, links), [centreId, risks, links]);
  const centre = wheel[0];
  // The risk tabs keep a steady order: by the risk's ring in the data, then by priority.
  const tabs = useMemo(() => [...risks].sort((a, b) => a.layer - b.layer || b.priority - a.priority), [risks]);
  const linkCount = (id: string) => links.filter((l) => l.from === id || l.to === id).length;
  const onWheel = wheel.find((r) => r.id === selected?.id);

  const marks = useMemo<Record<string, LensMark>>(() => {
    const out: Record<string, LensMark> = {};
    if (lens === "priority") {
      [...wheel]
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 5)
        .forEach((r, i) => (out[r.id] = { flag: true, value: String(i + 1), spoken: `priority ${i + 1} on this wheel` }));
    }
    for (const r of wheel) {
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
  }, [lens, wheel, changes, panel]);

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

  function onRiskTabKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    const i = tabs.findIndex((r) => r.id === centreId);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    centreOn(tabs[next].id);
    document.getElementById(`centre-${tabs[next].id}`)?.focus();
  }

  const pending = open.find((d) => d.kind !== "pattern" && d.riskId === selected?.id);
  const lensInfo = LENSES.find((l) => l.id === lens)!;

  return (
    <div className={s.bench}>
      <h1 className="visually-hidden">Risk radar, {data.context.name}</h1>
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

        <div className={s.riskTabsWrap}>
          <p className={s.riskTabsLabel} id="risk-tabs-label">
            Risk in the centre
          </p>
          <div role="tablist" aria-labelledby="risk-tabs-label" className={s.riskTabs}>
            {tabs.map((r) => {
              const n = linkCount(r.id);
              return (
                <button
                  key={r.id}
                  id={`centre-${r.id}`}
                  type="button"
                  role="tab"
                  aria-selected={r.id === centreId}
                  aria-controls="radar-panel"
                  aria-label={`${r.short}, ${n} link${n === 1 ? "" : "s"}`}
                  title={r.title}
                  tabIndex={r.id === centreId ? 0 : -1}
                  className={s.riskTab}
                  data-status={r.status}
                  onClick={() => centreOn(r.id)}
                  onKeyDown={onRiskTabKey}
                >
                  {r.level && <span className={s.swatch} data-level={r.level.toLowerCase()} aria-hidden />}
                  <span>{r.short}</span>
                  <span className={s.navCount} aria-hidden>
                    {n}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {adding && (
          <AddRiskForm
            risks={risks}
            defaultTarget={selected?.status === "mapped" ? selected.id : data.context.focusId}
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
        <div id="radar-panel" role="tabpanel" aria-labelledby={`centre-${centreId}`} className={s.field}>
          {/* Keyed by the centre so the wheel unfolds again around each new choice. */}
          <Radar
            key={centreId}
            risks={wheel}
            links={links}
            lens={lens}
            marks={marks}
            selected={selected?.id ?? ""}
            onSelect={select}
            rings={WHEEL_RINGS}
          />
          {centre && wheel.length === 1 && (
            <p className={s.wheelHint}>
              Nothing is linked to <strong>{centre.short}</strong> yet. Draw a link in the panel on the right and the
              other risk shows up on the first ring.
            </p>
          )}
          <RadarKey
            lens={lens}
            sentence={`${lensInfo.legend} The wheel shows one risk at a time: the one in the centre, the risks linked to it on the first ring, and the risks linked to those further out. Pick another risk in the tabs above.${data.context.hasPanel ? "" : " No panel here yet, so coverage and disagreement stay empty."}`}
          />
        </div>
      </section>

      <Inspector
        risk={selected}
        risks={risks}
        links={links}
        changes={changes}
        panel={panel}
        ringLabel={
          selected?.id === centreId ? "Centre of the wheel" : onWheel ? WHEEL_RINGS[onWheel.layer] : "Not on this wheel"
        }
        onCentre={selected && selected.id !== centreId ? () => centreOn(selected.id) : undefined}
        outliersHref={`${base}/outliers`}
        demo={data.context.demo}
        onAddLink={addLink}
        onRemoveLink={removeLink}
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
