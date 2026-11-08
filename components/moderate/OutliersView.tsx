"use client";

import { Check } from "lucide-react";
import { PageHead } from "./Chrome";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

export function OutliersView() {
  const { data, reviewed, review } = useWorkspace();
  return (
    <section className={s.page} aria-labelledby="page-head">
      <PageHead title="Against the current">
        Experts whose answers run against ACAPS&rsquo;s reading or against the panel. Disagreement is signal: ask
        before you weigh it down.
      </PageHead>
      <div className={s.outliers}>
        {data.outliers.map((o) => (
          <article key={o.id} className={s.outlier} aria-labelledby={`${o.id}-head`}>
            <h2 id={`${o.id}-head`} className={s.itemTitle}>
              {o.headline}
            </h2>
            <p className={s.meta}>{o.detail}</p>
            {o.reasons.map((r) => (
              <p key={r.question} className={s.quote}>
                <strong>
                  {r.question}, {r.answer}:
                </strong>{" "}
                &ldquo;{r.text}&rdquo;
              </p>
            ))}
            <p className={s.read}>
              <strong>Reading:</strong> {o.read}
            </p>
            {reviewed[o.id] ? (
              <p className={s.done}>
                <Check aria-hidden size={16} strokeWidth={3} />
                {reviewed[o.id]}
              </p>
            ) : (
              <div className={s.itemActions}>
                {o.kind === "against" && (
                  <button
                    type="button"
                    className="btn"
                    onClick={() =>
                      review(o.id, `Follow-up drafted for ${o.people[0]}: “What are you seeing at the crossing?”`)
                    }
                  >
                    Ask what they are seeing
                  </button>
                )}
                <button type="button" className="btn" onClick={() => review(o.id, "Marked as reviewed.")}>
                  Mark reviewed
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
