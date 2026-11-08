"use client";

import { useEffect, useId, useState } from "react";
import type { GraphLink, GraphRisk, Lens } from "@/lib/moderate";
import s from "./moderate.module.css";
import m from "./radar-motion.module.css";

/** Long enough for the unfold to finish; after it, nodes moving in the DOM never replay it. */
const UNFOLD_MS = 1200;

/** The radar is drawn in a 760 x 680 box; risks are placed in % of it so the field can scale. */
const W = 760;
const H = 680;
const CX = W / 2;
const CY = H / 2;
const RADII = [0, 125, 225, 305];

export function place(r: Pick<GraphRisk, "layer" | "angle">): { x: number; y: number } {
  const rad = (r.angle * Math.PI) / 180;
  return { x: CX + RADII[r.layer] * Math.cos(rad), y: CY + RADII[r.layer] * Math.sin(rad) };
}

export type LensMark = { flag: boolean; value?: string; spoken?: string };

export function Radar({
  risks,
  links,
  lens,
  marks,
  selected,
  onSelect,
}: {
  risks: GraphRisk[];
  links: GraphLink[];
  lens: Lens;
  marks: Record<string, LensMark>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  const pos = Object.fromEntries(risks.map((r) => [r.id, place(r)]));
  // The wheel unfolds from its root once per visit (radar-motion.module.css).
  const [unfolding, setUnfolding] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setUnfolding(false), UNFOLD_MS);
    return () => clearTimeout(t);
  }, []);
  const maskId = `unfold-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const here = pos[selected];
  // Read order for keyboard and screen readers: what the lens surfaces first, then by layer.
  const ordered = [...risks].sort(
    (a, b) => Number(marks[b.id]?.flag) - Number(marks[a.id]?.flag) || a.layer - b.layer || b.priority - a.priority,
  );

  const rings = (
    <div className={`${s.radar} ${m.wheel}`} data-unfold={unfolding}>
      <svg className={s.radarSvg} viewBox={`0 0 ${W} ${H}`} aria-hidden focusable="false">
        {unfolding && (
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x={-100} y={-100} width={W + 200} height={H + 200}>
              <circle className={m.disc} cx={CX} cy={CY} r={520} fill="white" />
            </mask>
          </defs>
        )}
        <g mask={unfolding ? `url(#${maskId})` : undefined}>
          {RADII.slice(1).map((r, i) => (
            <g key={r}>
              <circle className={s.ring} cx={CX} cy={CY} r={r} />
              <text className={s.ringLabel} x={CX - r - 8} y={CY + 5} textAnchor="end">
                {`Layer ${i + 1}`}
              </text>
            </g>
          ))}
          {links.map((l) => {
            const a = pos[l.from];
            const b = pos[l.to];
            if (!a || !b) return null;
            return (
              <line
                key={l.id}
                className={`${s.link} ${m.link}`}
                data-status={l.status}
                data-near={l.from === selected || l.to === selected}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
              />
            );
          })}
        </g>
        {/* Keyed by the selection so each new choice sends its squares out again. */}
        {here && (
          <g key={selected}>
            {links
              .filter((l) => l.from === selected || l.to === selected)
              .map((l) => {
                const there = pos[l.from === selected ? l.to : l.from];
                if (!there) return null;
                return (
                  <rect
                    key={l.id}
                    className={m.tracer}
                    x={here.x - 4}
                    y={here.y - 4}
                    width={8}
                    height={8}
                    style={{ ["--dx" as string]: `${there.x - here.x}px`, ["--dy" as string]: `${there.y - here.y}px` }}
                  />
                );
              })}
          </g>
        )}
      </svg>
      {ordered.map((r) => {
        const p = pos[r.id];
        const mark = marks[r.id];
        const pressed = r.id === selected;
        // The ID stays out of the radar; the inspector discloses it once a risk is selected.
        const label = [
          r.short,
          r.layer === 0 ? "root of this context" : `layer ${r.layer}`,
          r.level ? `${r.level} risk` : "not rated yet",
          r.status === "proposed" ? "proposed, not approved" : undefined,
          mark?.spoken,
        ]
          .filter(Boolean)
          .join(", ");
        return (
          <button
            key={r.id}
            type="button"
            className={`${s.node} ${m.node}`}
            style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`, ["--layer" as string]: r.layer }}
            data-status={r.status}
            data-flag={Boolean(mark?.flag)}
            aria-pressed={pressed}
            aria-label={label}
            onClick={() => onSelect(r.id)}
            data-lens={lens}
          >
            {r.level && <span className={s.swatch} data-level={r.level.toLowerCase()} aria-hidden />}
            <span className={s.nodeName}>{r.short}</span>
            {mark?.value && (
              <span key={lens} className={`${s.val} ${m.val}`}>
                {mark.value}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  // Too narrow for rings (phones): the same risks as rows, one per layer, same marks and selection.
  const layers = [0, 1, 2, 3]
    .map((layer) => ({ layer, items: ordered.filter((r) => r.layer === layer) }))
    .filter((g) => g.items.length);
  const asList = (
    <div className={s.layers}>
      {layers.map(({ layer, items }) => (
        <div key={layer} className={s.layerRow}>
          <p className={s.layerName}>{layer === 0 ? "Root" : `Layer ${layer}`}</p>
          <div className={s.layerItems}>
            {items.map((r) => {
              const mark = marks[r.id];
              return (
                <button
                  key={r.id}
                  type="button"
                  className={`${s.node} ${m.node}`}
                  style={{ ["--layer" as string]: r.layer }}
                  data-status={r.status}
                  data-flag={Boolean(mark?.flag)}
                  aria-pressed={r.id === selected}
                  aria-label={[r.short, r.level ? `${r.level} risk` : "not rated yet", mark?.spoken]
                    .filter(Boolean)
                    .join(", ")}
                  onClick={() => onSelect(r.id)}
                >
                  {r.level && <span className={s.swatch} data-level={r.level.toLowerCase()} aria-hidden />}
                  <span className={s.nodeName}>{r.short}</span>
                  {mark?.value && (
                    <span key={lens} className={`${s.val} ${m.val}`}>
                      {mark.value}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {rings}
      {asList}
    </>
  );
}
