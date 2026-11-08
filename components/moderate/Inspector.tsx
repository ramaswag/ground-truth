"use client";

import type { Change, Expert, GraphLink, GraphRisk } from "@/lib/moderate";
import { PROBABILITY, coverage, formatWhen } from "@/lib/moderate";
import Link from "next/link";
import { AskNext } from "./AskNext";
import s from "./moderate.module.css";

const ORIGIN: Record<GraphRisk["origin"], string> = {
  radar: "ACAPS Risk Radar",
  acaps: "Added by ACAPS",
  expert: "Proposed by an expert",
};

export function Inspector({
  risk,
  risks,
  links,
  changes,
  panel,
  onSelect,
  onFindExperts,
  children,
}: {
  risk: GraphRisk;
  risks: GraphRisk[];
  links: GraphLink[];
  changes: Change[];
  panel: Expert[];
  onSelect: (id: string) => void;
  onFindExperts: (riskId: string) => void;
  /** Decision actions, when this risk is waiting on one. */
  children?: React.ReactNode;
}) {
  const byId = Object.fromEntries(risks.map((r) => [r.id, r]));
  const drivenBy = links.filter((l) => l.to === risk.id && byId[l.from]);
  const leadsTo = links.filter((l) => l.from === risk.id && byId[l.to]);
  const mine = changes.filter((c) => c.riskIds.includes(risk.id));
  const experts = coverage(panel, risk.id);
  const p = risk.panel;
  const unverified = experts.filter((e) => e.identity === "pending").length;

  return (
    <section className={s.inspector} aria-labelledby="inspector-title">
      <h2 id="inspector-title" className={s.title}>
        {risk.title}
      </h2>
      <p className={s.idLine}>
        <span>{risk.id}</span>
        <span aria-hidden>·</span>
        <span>{risk.layer === 0 ? "Root of this context" : `Layer ${risk.layer}`}</span>
        {risk.level && (
          <span className={s.level} data-level={risk.level.toLowerCase()}>
            {risk.level}
          </span>
        )}
        {risk.place && <span className={s.origin}>{risk.place}</span>}
        <span aria-hidden>·</span>
        <span className={s.origin}>
          {risk.origin === "expert" && risk.proposedBy ? `Proposed by ${risk.proposedBy}` : ORIGIN[risk.origin]}
        </span>
      </p>

      <div className={s.block}>
        <div className={s.blockHead}>
          <h3>Current reading</h3>
          <p>ACAPS, and the panel this week</p>
        </div>
        <dl className={`${s.facts} ${s.factsInBlock}`}>
          <div>
            <dt>ACAPS probability</dt>
            <dd>{risk.probability ? PROBABILITY[risk.probability - 1] : "Not rated yet"}</dd>
          </div>
          <div>
            <dt>ACAPS impact</dt>
            <dd>{risk.impact ? `${risk.impact} of 5` : "Not rated yet"}</dd>
          </div>
          <div>
            <dt>Since last update</dt>
            <dd>{risk.trend ?? "No update yet"}</dd>
          </div>
          <div>
            <dt>Panel vs ACAPS</dt>
            <dd>{p ? panelLine(p) : "Not asked yet"}</dd>
          </div>
        </dl>
        <p className={s.summary}>
          Covered by{" "}
          <strong>
            {experts.length} of {panel.length} experts
          </strong>
          {unverified ? `, ${unverified} not yet verified` : ""}.
        </p>
      </div>

      {children}

      <AskNext risk={risk} />

      <div className={s.block}>
        <div className={s.blockHead}>
          <h3>Trend, weeks 34 to 45</h3>
        </div>
        <Trend risk={risk} />
      </div>

      <div className={s.block}>
        <div className={s.blockHead}>
          <h3>What changed</h3>
          <p>{mine.length ? `${mine.length} this week` : "Nothing this week"}</p>
        </div>
        {mine.length > 0 && (
          <ul className={s.rows}>
            {mine.map((c) => (
              <li key={c.id}>
                <span className={s.when}>{formatWhen(c.at)}</span>
                <span>
                  <span className={s.who}>{c.actor.name}</span> {c.text}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={s.block}>
        <div className={s.blockHead}>
          <h3>Links</h3>
          <p>{drivenBy.length + leadsTo.length} on the radar</p>
        </div>
        <ul className={s.linkList}>
          {drivenBy.map((l) => (
            <LinkRow key={l.id} link={l} other={byId[l.from]} direction="Driven by" onSelect={onSelect} />
          ))}
          {leadsTo.map((l) => (
            <LinkRow key={l.id} link={l} other={byId[l.to]} direction="Leads to" onSelect={onSelect} />
          ))}
        </ul>
      </div>

      <div className={s.block}>
        <div className={s.blockHead}>
          <h3>Who covers it</h3>
          <p>
            {experts.length} of {panel.length} experts
          </p>
        </div>
        {experts.length > 0 ? (
          <p className={s.coverList}>
            {experts.map((e, i) => (
              <span key={e.name}>
                <strong>{e.name}</strong>
                {e.identity === "pending" && <span className={s.unverified}> (unverified)</span>}
                {i < experts.length - 1 ? ", " : ""}
              </span>
            ))}
          </p>
        ) : (
          <p className={s.small}>Nobody on the panel covers this risk.</p>
        )}
        {experts.filter((e) => e.identity === "verified").length <= 1 && (
          <div className={s.gapNote}>
            <span>
              <strong>Expertise gap.</strong> Answers on this risk rest on {experts.length ? "one person" : "nobody"}.
            </span>
            <button type="button" className={s.textLink} onClick={() => onFindExperts(risk.id)}>
              Find experts
            </button>
          </div>
        )}
        {p && p.againstAcaps.length > 0 && (
          <p className={s.small} style={{ marginTop: "var(--s3)" }}>
            <strong>Against ACAPS this week:</strong> {p.againstAcaps.join(", ")}.{" "}
            <Link href="/moderate/outliers">See outlier profiles</Link>
          </p>
        )}
      </div>
    </section>
  );
}

/** "4 agree, 3 against, 1 don't know": answers this week measured against ACAPS's reading. */
function panelLine(p: NonNullable<GraphRisk["panel"]>): string {
  const against = p.againstAcaps.length;
  const agree = p.yes + p.no - against;
  return [`${agree} agree`, `${against} against`, p.dontKnow ? `${p.dontKnow} don't know` : undefined]
    .filter(Boolean)
    .join(", ");
}

function LinkRow({
  link,
  other,
  direction,
  onSelect,
}: {
  link: GraphLink;
  other: GraphRisk;
  direction: string;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <span>{direction}</span>
      <button type="button" className={s.code} data-status={other.status} onClick={() => onSelect(other.id)}>
        {other.id}
      </button>
      <strong>{other.short}</strong>
      <span>
        {link.status === "proposed"
          ? `proposed link, ${link.window}`
          : `${link.window}${link.strength !== undefined ? `, strength ${link.strength}` : ""}`}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ trend */

const X_PAD = 3;
const Y_PAD = 8;
const xAt = (i: number, n: number) => X_PAD + (i / (n - 1)) * (100 - 2 * X_PAD);
const yAt = (v: number) => Y_PAD + ((5 - v) / 4) * (100 - 2 * Y_PAD);

function Trend({ risk }: { risk: GraphRisk }) {
  const h = risk.history;
  const n = h.length;
  const readings = h.filter((w) => w.acaps !== undefined || w.panel !== undefined);
  if (!readings.length) {
    return (
      <p className={s.emptyChart}>
        No readings yet. {risk.status === "proposed" ? "This risk was proposed this week" : "It has not been rated"}; its
        trend starts once ACAPS rates it or the panel is asked.
      </p>
    );
  }

  // ACAPS's reading as a step line: hold each week's value until the next one.
  const points: string[] = [];
  h.forEach((w, i) => {
    if (w.acaps === undefined) return;
    const prev = points.length ? h.slice(0, i).reverse().find((x) => x.acaps !== undefined) : undefined;
    if (prev && prev.acaps !== w.acaps) points.push(`${xAt(i, n)},${yAt(prev.acaps!)}`);
    points.push(`${xAt(i, n)},${yAt(w.acaps)}`);
  });
  const moveIndex = risk.lastMove ? h.findIndex((w) => w.week === risk.lastMove!.week) : -1;
  const summary = h
    .map((w) =>
      [
        `week ${w.week}`,
        w.acaps ? `ACAPS ${PROBABILITY[w.acaps - 1]}` : undefined,
        w.panel ? `panel ${PROBABILITY[Math.round(w.panel) - 1]}` : undefined,
      ]
        .filter(Boolean)
        .join(" "),
    )
    .filter((t) => t.includes(" "))
    .join("; ");

  return (
    <figure>
      <div className={s.chart} role="img" aria-label={`Probability by week: ${summary}.`}>
        <div className={s.yAxis} aria-hidden>
          {[5, 4, 3, 2, 1].map((v) => (
            <span key={v} style={{ top: `${yAt(v)}%` }}>
              {PROBABILITY[v - 1]}
            </span>
          ))}
        </div>
        <div className={s.plot}>
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden focusable="false">
            {[5, 4, 3, 2, 1].map((v) => (
              <line key={v} className={s.grid} x1="0" x2="100" y1={yAt(v)} y2={yAt(v)} vectorEffect="non-scaling-stroke" />
            ))}
            {moveIndex >= 0 && (
              <line
                className={s.marker}
                x1={xAt(moveIndex, n)}
                x2={xAt(moveIndex, n)}
                y1="0"
                y2="100"
                vectorEffect="non-scaling-stroke"
              />
            )}
            {points.length > 0 && (
              <polyline className={s.acaps} points={points.join(" ")} vectorEffect="non-scaling-stroke" />
            )}
          </svg>
          {h.map((w, i) =>
            w.panel !== undefined ? (
              <span
                key={w.week}
                className={s.dot}
                style={{ left: `${xAt(i, n)}%`, top: `${yAt(w.panel)}%` }}
                aria-hidden
              />
            ) : null,
          )}
        </div>
        <div className={s.xAxis} aria-hidden>
          {h.map((w, i) =>
            i % 3 === 0 || i === n - 1 ? (
              <span key={w.week} style={{ left: `${xAt(i, n)}%` }}>
                W{w.week}
              </span>
            ) : null,
          )}
        </div>
      </div>
      <figcaption className={s.chartKey}>
        <span>
          <span className={s.keyLine} aria-hidden />
          ACAPS reading
        </span>
        <span>
          <span className={s.keyDot} aria-hidden />
          Panel median
        </span>
        {risk.lastMove && (
          <span>
            Dashed line: week {risk.lastMove.week}, {risk.lastMove.note}.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
