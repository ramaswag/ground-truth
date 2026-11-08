import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getQuestion } from "@/lib/questions";
import { formatDate, formatDeadline, formatTimeLeft } from "@/lib/dates";
import { isAnswerValue } from "@/lib/share";
import { Shell } from "@/components/Shell";
import { AnswerForm } from "@/components/AnswerForm";
import { RiskContext } from "@/components/RiskContext";
import { LinkContext } from "@/components/LinkContext";
import { getRisk } from "@/lib/radar-source";
import { CarryPanel } from "@/components/CarryPanel";
import { StickyColumn } from "@/components/StickyColumn";
import s from "./page.module.css";

type Params = Promise<{ id: string }>;
type Search = Promise<{ a?: string | string[]; r?: string | string[]; demo?: string | string[] }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  const q = await getQuestion(id);
  if (!q) return { title: "Question not found · Ground Truth by ACAPS" };
  const description = `Expert question from ACAPS on ${q.area}. Answer Yes, No or Don’t know by ${formatDeadline(q.answerBy)}.`;
  return {
    title: `${q.text} · Ground Truth by ACAPS`,
    description,
    openGraph: { title: q.text, description, siteName: "Ground Truth by ACAPS", type: "website" },
  };
}

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

export default async function QuestionPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const sp = await searchParams;
  const opts = { sparse: one(sp.demo) === "sparse" };
  const question = await getQuestion(id, opts);
  if (!question) notFound();
  // A link question shows both risks in full; only their stubs travel with the question.
  const [fromRisk, toRisk] = question.link
    ? await Promise.all([getRisk(question.link.from.id, opts), getRisk(question.link.to.id, opts)])
    : [];

  const a = one(sp.a);
  const referral = one(sp.r);
  const referred = Boolean(referral);
  const latest = question.risk?.updates[0]?.date;
  const horizon = formatTimeLeft(question.resolvesOn);
  const closesIn = formatTimeLeft(question.answerBy);

  return (
    <>
      <Shell question={question} referred={referred} />
      <main className={s.main}>
        <div className={s.grid}>
          <StickyColumn className={s.primary} aria-labelledby="question">
            <h1 id="question" className={s.question}>
              {question.text}
            </h1>
            <p className={s.counts}>{question.counts}</p>
            <dl className={s.facts}>
              <div>
                <dt>Answer by</dt>
                <dd>
                  <time dateTime={question.answerBy}>{formatDeadline(question.answerBy)}</time>
                  <span className={s.left}>{closesIn ? `Closes in ${closesIn}` : "Closed"}</span>
                </dd>
              </div>
              {question.kind === "verify" ? (
                <div>
                  <dt>Checked against</dt>
                  <dd>{question.checkedAgainst ?? "ACAPS sources"}</dd>
                </div>
              ) : question.kind === "map" && question.link ? (
                <div>
                  <dt>Looks ahead</dt>
                  <dd>{question.link.window}</dd>
                </div>
              ) : (
                <div>
                  <dt>Resolves</dt>
                  <dd>
                    <time dateTime={question.resolvesOn} title={formatDate(question.resolvesOn)}>
                      {horizon ? `In ${horizon}` : "Resolved"}
                    </time>
                  </dd>
                </div>
              )}
              <div>
                <dt>Asked by</dt>
                <dd>{question.askedBy}</dd>
              </div>
            </dl>
            <AnswerForm
              key={`${question.id}-${referred}`}
              question={question}
              initialAnswer={isAnswerValue(a) ? a : undefined}
              incomingReferral={referral}
              failFirst={one(sp.demo) === "fail"}
            />
          </StickyColumn>
          <aside className={s.context}>
            {question.link ? (
              <LinkContext link={question.link} from={fromRisk} to={toRisk} />
            ) : (
              question.risk && <RiskContext question={question} risk={question.risk} />
            )}
            <CarryPanel question={question} />
          </aside>
        </div>
      </main>
      <footer className={s.footer}>
        <div className={s.footInner}>
          <p className={s.footMark}>
            <strong>Ground Truth</strong> by ACAPS
          </p>
          <p className={s.footNote}>
            Interface draft.{" "}
            {question.link
              ? `Risks ${question.link.from.id} and ${question.link.to.id} come`
              : `Risk ${question.riskId} data comes`}{" "}
            from the ACAPS Risk Radar export{latest ? ` (latest update ${formatDate(latest)})` : ""}. The questions,
            panel, dates and links between risks are sample content.
            Demo: <Link href="/login">switch role</Link> · <Link href="/how">how it works</Link>.
          </p>
        </div>
      </footer>
    </>
  );
}
