"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import type { Decision } from "@/lib/moderate";
import { PROBABILITY, formatWhen } from "@/lib/moderate";
import { NotYet, PageHead } from "./Chrome";
import { AskNext } from "./AskNext";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

export function DecisionsView() {
  const { data, base, open } = useWorkspace();
  return (
    <section className={s.page} aria-labelledby="page-head">
      <PageHead title="Needs a decision">
        <span className={s.count}>{open.length}</span> open. Risks experts flag land here first; add one yourself from
        the <Link href={base}>radar</Link>.
      </PageHead>
      {!data.context.hasPanel && (
        <NotYet>
          {data.context.name} has no panel yet. Once experts answer here, three things land on this page: risks they
          propose (add, merge or reject), panel readings that differ from ACAPS (approve or hold), and answer
          patterns to review.
        </NotYet>
      )}
      <div className={s.queue}>
        {data.decisions.map((d) => (
          <DecisionItem key={d.id} d={d} />
        ))}
      </div>
    </section>
  );
}

/** One decision. `compact` is the version that sits inside the radar's inspector. */
export function DecisionItem({ d, compact }: { d: Decision; compact?: boolean }) {
  const { base, original, byId, outcomes, held, decide, showOnRadar } = useWorkspace();
  const outcome = outcomes[d.id];
  let title: string;
  let meta: React.ReactNode;
  let actions: React.ReactNode;

  if (d.kind === "proposal") {
    const r = original[d.riskId];
    title = r.title;
    meta = (
      <>
        Proposed by <strong>{r.proposedBy}</strong>, {formatWhen(d.at)}. Source: {d.source}.{" "}
        {d.duplicateOf
          ? `Close to ${d.duplicateOf} ${byId[d.duplicateOf]?.short ?? ""}: merging may fit better.`
          : "No close match among existing risks."}
      </>
    );
    actions = (
      <>
        <button type="button" className="btn" onClick={() => decide(d, "add")}>
          Add to radar
        </button>
        {d.duplicateOf && (
          <button type="button" className="btn" onClick={() => decide(d, "merge")}>
            Merge into {d.duplicateOf}
          </button>
        )}
        <button type="button" className="btn" onClick={() => decide(d, "reject")}>
          Reject
        </button>
      </>
    );
  } else if (d.kind === "move") {
    title = `${d.riskId} to ${PROBABILITY[d.to - 1]}`;
    meta = (
      <>
        The panel reads it one step above ACAPS ({PROBABILITY[d.from - 1]}): <strong>{d.votes}</strong>,{" "}
        {formatWhen(d.at)}.
      </>
    );
    actions = (
      <>
        <button type="button" className="btn" onClick={() => decide(d, "approve")}>
          Approve
        </button>
        <button type="button" className="btn" onClick={() => decide(d, "hold")}>
          Hold a round
        </button>
      </>
    );
  } else {
    title = `${d.people.join(" and ")} answer alike`;
    meta = d.summary;
    actions = (
      <>
        <button type="button" className="btn" onClick={() => decide(d, "reviewed")}>
          Mark reviewed
        </button>
        <Link className="btn" href={`${base}/outliers`}>
          Open profiles
        </Link>
      </>
    );
  }

  const riskId = d.kind === "pattern" ? undefined : d.riskId;

  return (
    <article className={s.item} data-kind={d.kind} data-done={Boolean(outcome)} aria-label={title}>
      {compact ? (
        <p className={s.itemTitle}>Waiting for your decision</p>
      ) : (
        <div className={s.itemHead}>
          <h2 className={s.itemTitle}>{title}</h2>
          {riskId && byId[riskId] && (
            <button type="button" className={s.textLink} onClick={() => showOnRadar(riskId)}>
              Show on radar
            </button>
          )}
        </div>
      )}
      <p className={s.meta}>{meta}</p>
      {outcome ? (
        <p className={s.done}>
          <Check aria-hidden size={16} strokeWidth={3} />
          {outcome}
        </p>
      ) : (
        <div className={s.itemActions}>{actions}</div>
      )}
      {d.kind === "move" && held[d.riskId] && !compact && byId[d.riskId] && (
        <AskNext risk={byId[d.riskId]} inline />
      )}
    </article>
  );
}
