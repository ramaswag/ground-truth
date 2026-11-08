import { ArrowDown } from "lucide-react";
import type { LinkView, Risk } from "@/lib/questions";
import { RiskBody } from "./RiskContext";
import r from "./risk.module.css";
import s from "./graph.module.css";

function Node({ role, stub, risk }: { role: string; stub: LinkView["from"]; risk?: Risk }) {
  return (
    <div className={s.row}>
      <span className={s.nodeRail} aria-hidden />
      <div className={s.node}>
        <h3 className={s.role}>{role}</h3>
        {risk ? (
          <RiskBody risk={risk} place={stub.place} />
        ) : (
          <p className={r.idRow}>
            Risk {stub.id} · {stub.place}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * Context for a "map" question: the two risks it asks about, drawn as one edge of the
 * risk graph. A link not yet accepted is dashed, like everything else still unconfirmed.
 */
export function LinkContext({ link, from, to }: { link: LinkView; from?: Risk; to?: Risk }) {
  const proposed = link.status === "proposed";
  return (
    <section className={r.risk} aria-labelledby="link-heading">
      <h2 id="link-heading" className={r.heading}>
        Why ACAPS is asking
      </h2>
      <p className={s.lead}>
        {proposed
          ? "ACAPS has not linked these two risks yet. If the panel sees a link, an analyst reviews it before it joins the risk graph."
          : "ACAPS links these two risks. The panel’s answers tell it how strongly."}
      </p>
      <div className={s.chain}>
        <Node role="Possible cause" stub={link.from} risk={from} />
        <div className={s.row}>
          <span className={s.edgeRail} data-status={link.status} aria-hidden>
            <span className={s.edgeLine} />
            <ArrowDown size={20} strokeWidth={2.5} className={s.edgeArrow} />
          </span>
          <p className={s.edgeLabel}>
            {proposed ? "Not linked yet" : "Linked"} · within {link.window}
          </p>
        </div>
        <Node role="Possible effect" stub={link.to} risk={to} />
      </div>
    </section>
  );
}
