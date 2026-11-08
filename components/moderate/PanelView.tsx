"use client";

import { PageHead } from "./Chrome";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

export function PanelView() {
  const { data, byId, showOnRadar } = useWorkspace();
  const { panel, context } = data;
  const rows = [...panel].sort((a, b) => (a.brier ?? 9) - (b.brier ?? 9));

  return (
    <section className={s.page} aria-labelledby="page-head">
      <PageHead title="Panel">
        <span className={s.count}>{panel.length}</span> experts on the {context.name} panel. Other experts never see
        these names or scores; only ACAPS does.
      </PageHead>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">Expert</th>
              <th scope="col">Identity</th>
              <th scope="col">Covers</th>
              <th scope="col" className={s.num}>
                This week
              </th>
              <th scope="col" className={s.num}>
                Reliability
              </th>
              <th scope="col" className={s.num}>
                Against ACAPS, 8 weeks
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.name}>
                <td>
                  <p className={s.expertName}>{e.name}</p>
                  <p>
                    {e.role}, {e.base}
                  </p>
                </td>
                <td>
                  {e.identity === "verified" ? (
                    <span className={s.verified}>Verified by ACAPS</span>
                  ) : (
                    <>
                      <span className={s.pending}>Check pending</span>
                      <p>Forwarded by {e.forwardedBy}</p>
                    </>
                  )}
                </td>
                <td>
                  {e.covers
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
                </td>
                <td className={s.num} data-label="This week">
                  {e.answered} of {context.questions}
                </td>
                <td className={s.num} data-label="Reliability">
                  <strong>{e.brier !== undefined && e.resolved >= 10 ? e.brier.toFixed(2) : "Too early"}</strong>
                  <p>{e.resolved} resolved</p>
                </td>
                <td className={s.num} data-label="Against ACAPS">
                  {e.against}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={s.tableNote}>
        Reliability is a Brier score on resolved questions in this context: lower is better, and Don&rsquo;t know is
        never penalised. It needs 10 resolved answers before it means much. Against ACAPS counts the last 8 weeks.
        Names are invented for this draft.
      </p>
    </section>
  );
}
