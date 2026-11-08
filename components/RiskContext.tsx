import { ChevronDown } from "lucide-react";
import { formatDate } from "@/lib/dates";
import type { Question, Risk, SourceRef } from "@/lib/questions";
import s from "./risk.module.css";

const PROBABILITY = ["Very low", "Low", "Medium", "High", "Very high"];

function Scale({ value, label }: { value: number; label: string }) {
  return (
    <span className={s.scale} role="img" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={s.cell} data-on={n <= value} />
      ))}
    </span>
  );
}

function Sources({ sources }: { sources: SourceRef[] }) {
  if (!sources.length) return null;
  return (
    <p className={s.sources}>
      {sources.map((src, i) => (
        <span key={src.url}>
          {i > 0 && " · "}
          <a href={src.url} target="_blank" rel="noopener noreferrer">
            {src.label}
            {src.date && (
              <>
                , <span className={s.date}>{formatDate(src.date)}</span>
              </>
            )}
          </a>
        </span>
      ))}
    </p>
  );
}

/** "Ratings", "Ratings and triggers", "Ratings, triggers and ACAPS analysis"… from what the risk has. */
function summaryLabel(parts: string[]): string {
  const [first, ...rest] = parts;
  const head = first.charAt(0).toUpperCase() + first.slice(1);
  if (!rest.length) return head;
  return `${[head, ...rest.slice(0, -1)].join(", ")} and ${rest[rest.length - 1]}`;
}

export function RiskContext({ question, risk }: { question: Question; risk: Risk }) {
  return (
    <section className={s.risk} aria-labelledby="risk-heading">
      <h2 id="risk-heading" className={s.heading}>
        Why ACAPS is asking
      </h2>
      <RiskBody risk={risk} place={question.area} testsTrigger={question.testsTrigger} />
    </section>
  );
}

/** One risk: its ID, place and level, its title, and the collapsed ratings and analysis. */
export function RiskBody({ risk: r, place, testsTrigger }: { risk: Risk; place: string; testsTrigger?: string }) {
  const probIndex = r.probability ? PROBABILITY.indexOf(r.probability) + 1 : 0;
  const tested = testsTrigger ? r.triggers.find((t) => t.id === testsTrigger) : undefined;
  const latest = r.updates[0];
  const hasRatings = Boolean(r.probability || r.impact || r.exposure || r.trend);

  const parts = [
    hasRatings && "ratings",
    r.triggers.length > 0 && "triggers",
    (latest || r.rationale) && "ACAPS analysis",
    !hasRatings && !r.triggers.length && !latest && !r.rationale && r.priorityNeeds.length > 0 && "priority needs",
  ].filter((p): p is string => Boolean(p));

  return (
    <>
      <p className={s.idRow}>
        <span>
          Risk {r.id} · {place}
        </span>
        {r.level && (
          <span className={s.level} data-level={r.level.toLowerCase()}>
            {r.level} risk
          </span>
        )}
      </p>
      <p className={s.title}>{r.title}</p>

      {parts.length > 0 && (
        <details className={s.more}>
          <summary className={s.summary}>
            {summaryLabel(parts)}
            <ChevronDown aria-hidden size={18} strokeWidth={2.5} className={s.chev} />
          </summary>

          <div className={s.moreBody}>
            {hasRatings && (
              <dl className={s.ratings}>
                {r.probability && (
                  <div className={s.rating}>
                    <dt>Probability</dt>
                    <dd className={s.value}>
                      {r.probability}
                      <Scale value={probIndex} label={`${r.probability}, step ${probIndex} of 5`} />
                    </dd>
                  </div>
                )}
                {r.impact && (
                  <div className={s.rating}>
                    <dt>Impact</dt>
                    <dd className={s.value}>
                      {r.impact} of 5
                      <Scale value={r.impact} label={`Impact ${r.impact} of 5`} />
                    </dd>
                  </div>
                )}
                {r.exposure && (
                  <div className={s.rating}>
                    <dt>Expected exposure</dt>
                    <dd className={s.value}>{r.exposure}</dd>
                  </div>
                )}
                {r.trend && (
                  <div className={s.rating}>
                    <dt>Trend</dt>
                    <dd className={s.value}>{r.trend}</dd>
                  </div>
                )}
              </dl>
            )}

            {tested && (
              <p className={s.tests}>
                This question tests trigger <strong>{tested.id}</strong>: {tested.title}.
              </p>
            )}

            {r.triggers.length > 0 && (
              <>
                <h3 className={s.subhead}>Triggers ACAPS is watching</h3>
                <ol className={s.triggers}>
                  {r.triggers.map((t) => (
                    <li key={t.id} className={s.trigger} data-tested={t.id === testsTrigger}>
                      <p className={s.triggerHead}>
                        <span className={s.triggerId}>{t.id}</span>
                        {t.id === testsTrigger && <span className={s.thisQ}>This question</span>}
                      </p>
                      <p className={s.triggerTitle}>{t.title}</p>
                      {(t.completion !== undefined || t.updated) && (
                        <p className={s.completion}>
                          {t.completion !== undefined && (
                            <span className={s.track} aria-hidden>
                              <span className={s.fill} style={{ width: `${t.completion}%` }} />
                            </span>
                          )}
                          <span>
                            {t.completion !== undefined && `${t.completion}% reached`}
                            {t.completion !== undefined && t.updated && " · "}
                            {t.updated && (t.completion !== undefined ? formatDate(t.updated) : `Updated ${formatDate(t.updated)}`)}
                          </span>
                        </p>
                      )}
                    </li>
                  ))}
                </ol>
              </>
            )}

            {latest && (
              <>
                <h3 className={s.subhead}>
                  Latest ACAPS update{latest.date && `, ${formatDate(latest.date)}`}
                </h3>
                <div className={s.prose}>
                  {latest.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <Sources sources={latest.sources} />
              </>
            )}

            {r.rationale && (
              <>
                <h3 className={s.subhead}>Why ACAPS rates it this way</h3>
                <div className={s.prose}>
                  {r.rationale.paragraphs.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
                <Sources sources={r.rationale.sources} />
              </>
            )}

            {r.priorityNeeds.length > 0 && (
              <>
                <h3 className={s.subhead}>Expected priority needs</h3>
                <p className={s.prose}>{r.priorityNeeds.join(", ")}</p>
              </>
            )}
          </div>
        </details>
      )}
    </>
  );
}
