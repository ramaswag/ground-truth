"use client";

import { useEffect, useRef } from "react";
import { PageHead } from "./Chrome";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

export function GapsView() {
  const { data, byId, showOnRadar, finderFor, findExperts } = useWorkspace();
  const finderRef = useRef<HTMLDivElement>(null);

  // Arriving from "Find experts" elsewhere: take the reader to the finder.
  useEffect(() => {
    if (finderFor) finderRef.current?.focus();
  }, [finderFor]);

  const spaces = data.spaces
    .map((sp) => {
      const ids = sp.riskIds.filter((id) => byId[id]);
      const verified = data.panel.filter((e) => e.identity === "verified" && e.covers.some((c) => ids.includes(c)));
      return { sp, ids, verified };
    })
    .sort((a, b) => a.verified.length - b.verified.length);

  return (
    <div className={s.split}>
      <section aria-labelledby="page-head">
        <PageHead title="Expertise gaps">
          Problem spaces where answers rest on one verified expert or none. Find people for them before the next
          round.
        </PageHead>
        <ul className={s.gapRows}>
          {spaces.map(({ sp, ids, verified }) => (
            <li key={sp.name}>
              <div>
                <p className={s.gapName}>
                  {sp.name}{" "}
                  {ids.map((id) => (
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
                </p>
                <p className={s.gapCount}>
                  <strong>
                    {verified.length} verified expert{verified.length === 1 ? "" : "s"}
                  </strong>
                  {verified.length ? ` (${verified.map((e) => e.name).join(", ")})` : ""}. {sp.note}
                </p>
              </div>
              {verified.length <= 1 ? (
                <button
                  type="button"
                  className="btn"
                  aria-pressed={finderFor === sp.name}
                  onClick={() => findExperts(sp.name)}
                >
                  Find experts
                </button>
              ) : (
                <span className={s.gapCount}>Covered</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div
        id="finder"
        ref={finderRef}
        className={s.finder}
        tabIndex={-1}
        role="region"
        aria-labelledby="finder-head"
        aria-live="polite"
      >
        <h2 id="finder-head">Expert finder</h2>
        {finderFor ? (
          <p>
            Looking for experts on <strong>{finderFor}</strong>. The search tool is not connected yet, so no
            suggestions come back in this draft.
          </p>
        ) : (
          <p>Not connected yet. Pick Find experts on a gap to start a search here.</p>
        )}
        <p>
          ACAPS&rsquo;s expert search plugs in here: it suggests people for a gap, and ACAPS checks each one before
          anyone is invited.
        </p>
      </div>
    </div>
  );
}
