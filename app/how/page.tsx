import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import { Band } from "@/components/Band";
import { FIRST_QUESTION_ID } from "@/lib/questions";
import s from "./how.module.css";

export const metadata: Metadata = {
  title: "How it works · Ground Truth by ACAPS",
  description:
    "How Ground Truth turns short expert answers into an up-to-date map of humanitarian risks: the weekly loop, the risk map, and the rules for combining answers.",
};

/* ------------------------------------------------------------------ pieces */

/** An arrow that points right on wide screens and down on narrow ones. */
function Flow({ dashed, label }: { dashed?: boolean; label?: string }) {
  return (
    <div className={s.flow} data-dashed={dashed ?? false}>
      {label && <span className={s.flowLabel}>{label}</span>}
      <span className={s.flowLine} aria-hidden>
        <ArrowRight className={s.flowRight} size={20} strokeWidth={2.5} />
        <ArrowDown className={s.flowDown} size={20} strokeWidth={2.5} />
      </span>
    </div>
  );
}

function Node({
  layer,
  id,
  name,
  chance,
  level,
  dashed,
  extra,
}: {
  layer?: string;
  id?: string;
  name: string;
  chance?: string;
  level?: "high" | "medium" | "done";
  dashed?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <div className={s.node} data-dashed={dashed ?? false}>
      {(layer || id) && <p className={s.nodeMeta}>{[layer, id].filter(Boolean).join(" · ")}</p>}
      <p className={s.nodeName}>{name}</p>
      {chance && (
        <p className={s.chance} data-level={level}>
          {chance}
        </p>
      )}
      {extra}
    </div>
  );
}

function MiniQuestion({ text }: { text: string }) {
  return (
    <div className={s.mini}>
      <p className={s.miniQ}>{text}</p>
      <p className={s.miniAnswers} aria-hidden>
        <span>Yes</span>
        <span>No</span>
        <span>Don’t know</span>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------- data */

const LOOP = [
  { n: "1", title: "Map", text: "ACAPS keeps a map of risks and of how one risk leads to another." },
  { n: "2", title: "Ask", text: "Each week, every expert on a panel gets the same few questions. Five at most, open for two days." },
  { n: "3", title: "Answer", text: "Yes, No or Don’t know, in seconds. Don’t know? Pass it to someone who knows." },
  { n: "4", title: "Combine", text: "Answers are added up. Experts with a good track record count a little more." },
  { n: "5", title: "Update", text: "An analyst checks the result in time for the weekly Risk Radar update. Numbers change, missing risks get added." },
];

const KINDS = [
  {
    name: "Fact check",
    asks: "Is this true now?",
    example: "Humanitarian access is disrupted around Adré and Tiné. Is this true now?",
    changes: "The facts the map stands on",
    settles: "In days, checked against UNHCR and OCHA reports",
  },
  {
    name: "Forecast",
    asks: "Will this happen?",
    example: "Will there be a direct attack on strategic infrastructure in eastern Chad before 7 May 2027?",
    changes: "The chance of one risk",
    settles: "On the date in the question",
  },
  {
    name: "Risk link",
    asks: "Does this lead to that?",
    example:
      "Could escalating insecurity in eastern Chad make the Lake Chad Basin crisis more likely to escalate within 6 months?",
    changes: "The strength of one arrow, or a new arrow",
    settles: "When an ACAPS analyst approves",
  },
];

type Answer = "yes" | "no" | "dk";
const PANEL: { who: string; answer: Answer; weight: number }[] = [
  { who: "Expert A", answer: "yes", weight: 1.2 },
  { who: "Expert B", answer: "yes", weight: 1.0 },
  { who: "Expert C", answer: "yes", weight: 0.9 },
  { who: "Expert D", answer: "no", weight: 1.6 },
  { who: "Expert E", answer: "yes", weight: 0.8 },
  { who: "Expert F", answer: "dk", weight: 1.1 },
  { who: "Expert G", answer: "yes", weight: 0.6 },
];
const ANSWER_WORD: Record<Answer, string> = { yes: "Yes", no: "No", dk: "Don’t know" };
const WEIGHT_MAX = 2;

const yesWeight = PANEL.filter((p) => p.answer === "yes").reduce((t, p) => t + p.weight, 0);
const countedWeight = PANEL.filter((p) => p.answer !== "dk").reduce((t, p) => t + p.weight, 0);
const yesCount = PANEL.filter((p) => p.answer === "yes").length;
const countedCount = PANEL.filter((p) => p.answer !== "dk").length;
const pct = (x: number) => `${Math.round(x * 100)}%`;
const one = (x: number) => x.toFixed(1);

const RECORD = [
  { q: "Joins the panel", said: "Starts at the average.", verdict: "Start", weight: 1.0 },
  { q: "Fact check", said: "Said Yes. It was true.", verdict: "Right", weight: 1.05 },
  { q: "Forecast", said: "Said No. It did not happen.", verdict: "Right", weight: 1.1 },
  { q: "Forecast", said: "Said Yes. It did not happen.", verdict: "Wrong", weight: 1.02 },
  { q: "Forecast", said: "Said Yes when most said No. It happened.", verdict: "Right, against the panel", weight: 1.25 },
  { q: "Fact check", said: "Said Don’t know.", verdict: "No change", weight: 1.25 },
];
const RECORD_MAX = 1.5;

const SIGNALS = [
  {
    lead: "“What are you seeing?”",
    text: "An answer that goes against ACAPS’s view comes with a reason. Those reasons often name what the map is missing.",
  },
  {
    lead: "A whole panel says Don’t know",
    text: "Either the map has a gap there, or nobody on the panel covers it. Both are worth fixing.",
  },
  { lead: "An expert adds a risk", text: "In a line: what it is, what it follows from, where, and a source." },
  {
    lead: "ACAPS proposes an arrow",
    text: "Between two risks not yet linked. The panel says whether it holds.",
  },
  { lead: "Experts check arrows", text: "After a forecast, one tap each: does this link hold?" },
];

const RULES = [
  { lead: "Answer first, then see the group.", text: "Your first answer is the one your track record is scored on." },
  { lead: "Anonymous to each other.", text: "Known to ACAPS. Never published with a name." },
  { lead: "Disagreeing is welcome.", text: "An answer against the view asks for a reason. It is never punished." },
  { lead: "No hidden bans.", text: "Experts know answers are weighted. Bad faith is reviewed by a person, and removal is open." },
  { lead: "People decide.", text: "An ACAPS analyst approves every change to the map." },
  { lead: "Machines only help.", text: "AI can draft questions or spot duplicates. Experts never see an unapproved draft." },
];

/* ------------------------------------------------------------------- page */

export default function HowPage() {
  return (
    <>
      <Band home="/">
        <strong>How it works</strong>
        <span>Ground Truth, step by step</span>
      </Band>

      <main className={s.main}>
        {/* The loop: the whole idea in one viewport. */}
        <header className={s.hero}>
          <h1 className={s.h1}>Short answers from experts keep a map of crisis risks true.</h1>
          <p className={s.lede}>
            ACAPS asks a small panel of experts a few questions each week. Their answers, weighed by how often each
            expert has been right, update a map of risks and of how one risk leads to another.
          </p>
        </header>

        <figure className={s.loopFigure} aria-label="The weekly loop">
          <ol className={s.loop}>
            {LOOP.map((step, i) => (
              <li key={step.n} className={s.step} data-key={step.title === "Answer"}>
                <p className={s.stepNo} aria-hidden>
                  {step.n}
                </p>
                <p className={s.stepTitle}>{step.title}</p>
                <p className={s.stepText}>{step.text}</p>
                {i < LOOP.length - 1 && (
                  <span className={s.stepArrow} aria-hidden>
                    <ArrowRight className={s.flowRight} size={22} strokeWidth={2.5} />
                    <ArrowDown className={s.flowDown} size={22} strokeWidth={2.5} />
                  </span>
                )}
              </li>
            ))}
          </ol>
          <figcaption className={s.loopBack}>
            <RotateCcw aria-hidden size={20} strokeWidth={2.5} />
            Then again, every week. Each round brings the map a little closer to what is happening on the ground.
          </figcaption>
        </figure>

        {/* The map */}
        <section className={s.section} aria-labelledby="map-h">
          <div className={s.intro}>
            <h2 id="map-h" className={s.h2}>
              Risks cause other risks
            </h2>
            <p>
              The map starts from one event, like a war or an earthquake. The first layer is what that event causes. The
              next layer is what those cause.
            </p>
            <p>
              Each risk has a <strong>chance</strong> of happening. Each arrow has a <strong>strength</strong>: how much
              one risk makes the next more likely.
            </p>
          </div>
          <figure className={s.figure} aria-label="Part of the map for eastern Chad">
            <div className={s.map}>
              <p className={s.layerHead} style={{ gridColumn: 1 }}>
                Starting event
              </p>
              <p className={s.layerHead} style={{ gridColumn: 3 }}>
                Layer 1: what it causes
              </p>
              <p className={s.layerHead} style={{ gridColumn: 5 }}>
                Layer 2: what that causes
              </p>
              <div className={s.cellStart}>
                <Node layer="Start" id="R0002" name="Conflict across Sudan" chance="Already happening" level="done" />
              </div>
              <div className={s.cellEdge1}>
                <Flow label="Strong" />
              </div>
              <div className={s.cellMid}>
                <Node layer="Layer 1" id="R1043" name="Insecurity in eastern Chad" chance="High chance" level="high" />
              </div>
              <div className={s.cellEdge2a}>
                <Flow label="Medium" />
              </div>
              <div className={s.cellEdge2b}>
                <Flow dashed label="Not linked yet: ask the panel" />
              </div>
              <div className={s.cellEnd1}>
                <Node layer="Layer 2" id="R1055" name="Refugees return to West Darfur" chance="Medium chance" level="medium" />
              </div>
              <div className={s.cellEnd2}>
                <Node layer="Layer 2" id="R1066" name="Lake Chad Basin crisis escalates" chance="High chance" level="high" />
              </div>
            </div>
            <figcaption className={s.caption}>
              Real risks from the ACAPS Risk Radar. Arrow strengths are examples. A dashed arrow is one nobody has
              confirmed yet.
            </figcaption>
          </figure>
        </section>

        {/* Kinds of question */}
        <section className={s.section} aria-labelledby="kinds-h">
          <div className={s.intro}>
            <h2 id="kinds-h" className={s.h2}>
              Three kinds of question
            </h2>
            <p>Every question checks one piece of the map, and every one is answered Yes, No or Don’t know.</p>
          </div>
          <div className={s.figure}>
            <ul className={s.kinds}>
              {KINDS.map((k) => (
                <li key={k.name} className={s.kind}>
                  <h3 className={s.h3}>{k.name}</h3>
                  <p className={s.asks}>{k.asks}</p>
                  <MiniQuestion text={k.example} />
                  <dl className={s.kindFacts}>
                    <div>
                      <dt>Changes</dt>
                      <dd>{k.changes}</dd>
                    </div>
                    <div>
                      <dt>Settles</dt>
                      <dd>{k.settles}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Combining answers */}
        <section className={s.section} aria-labelledby="combine-h">
          <div className={s.intro}>
            <h2 id="combine-h" className={s.h2}>
              From seven answers to one number
            </h2>
            <p>Seven experts answer the same forecast, each on their own.</p>
            <p>
              <strong>Don’t know is set aside.</strong> It is not half a Yes.
            </p>
            <p>
              <strong>Each answer counts by its expert’s weight.</strong> Weight comes from track record: 1.0 is the
              panel average.
            </p>
            <p>
              Answers reach ACAPS the moment they are sent. The number is ready once four experts have answered,
              usually within hours, and every question closes within two days.
            </p>
          </div>
          <figure className={s.figure} aria-labelledby="tally-cap">
            <table className={s.tally}>
              <caption id="tally-cap" className={s.caption}>
                One forecast, seven answers. Example weights.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Expert</th>
                  <th scope="col">Answer</th>
                  <th scope="col">Weight</th>
                </tr>
              </thead>
              <tbody>
                {PANEL.map((p) => (
                  <tr key={p.who} data-answer={p.answer}>
                    <th scope="row">{p.who}</th>
                    <td>
                      <span className={s.answerChip} data-answer={p.answer}>
                        {ANSWER_WORD[p.answer]}
                      </span>
                    </td>
                    <td>
                      <span className={s.weightCell}>
                        <span className={s.track} aria-hidden>
                          <span className={s.fill} style={{ width: `${(p.weight / WEIGHT_MAX) * 100}%` }} />
                        </span>
                        <span className={s.weightNum}>{p.answer === "dk" ? "not counted" : one(p.weight)}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <dl className={s.result}>
              <div className={s.resultRow}>
                <dt>Plain count</dt>
                <dd>
                  {yesCount} Yes of {countedCount} answers
                </dd>
                <dd className={s.resultPct}>{pct(yesCount / countedCount)}</dd>
              </div>
              <div className={s.resultRow} data-main="true">
                <dt>Weighted by track record</dt>
                <dd>
                  {one(yesWeight)} Yes of {one(countedWeight)}
                </dd>
                <dd className={s.resultPct}>{pct(yesWeight / countedWeight)}</dd>
              </div>
            </dl>
            <p className={s.after}>
              Expert D has the strongest record and said No, so the weighted number is lower than the plain count.
              ACAPS rates this risk High (for example 60 to 80%). {pct(yesWeight / countedWeight)} fits High, so the
              rating holds, and D’s reason goes to the analyst.
            </p>
          </figure>
        </section>

        {/* Track record */}
        <section className={s.section} aria-labelledby="trust-h">
          <div className={s.intro}>
            <h2 id="trust-h" className={s.h2}>
              Who to trust: the track record
            </h2>
            <p>When a question settles, ACAPS checks every answer against what happened.</p>
            <ul className={s.ruleList}>
              <li>
                <strong>Right:</strong> weight goes up a little.
              </li>
              <li>
                <strong>Wrong:</strong> weight goes down a little.
              </li>
              <li>
                <strong>Right when the panel was wrong:</strong> weight goes up the most.
              </li>
              <li>
                <strong>Don’t know:</strong> no change. Honesty never costs anything.
              </li>
            </ul>
            <p>
              Weights move slowly, so two misses never sink anyone. New experts start at 1.0. Nobody but ACAPS sees a
              weight.
            </p>
          </div>
          <figure className={s.figure} aria-labelledby="record-cap">
            <ol className={s.record}>
              {RECORD.map((r, i) => (
                <li key={i} className={s.recordStep} data-verdict={r.verdict.startsWith("Right") ? "right" : r.verdict === "Wrong" ? "wrong" : "none"}>
                  <span className={s.recordBarWrap} aria-hidden>
                    <span className={s.recordBar} style={{ ["--w" as string]: `${(r.weight / RECORD_MAX) * 100}%` }} />
                  </span>
                  <span className={s.recordText}>
                    <span className={s.recordWeight}>{r.weight.toFixed(2)}</span>
                    <span className={s.recordVerdict}>{r.verdict}</span>
                    <span className={s.recordSaid}>
                      {r.q}. {r.said}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
            <figcaption id="record-cap" className={s.caption}>
              One expert, five questions settled. The dashed line is the panel average, 1.0. Example numbers. The
              scoring follows a standard rule (the Brier score) under which an honest answer always scores best.
            </figcaption>
          </figure>
        </section>

        {/* Spreading */}
        <section className={s.section} aria-labelledby="spread-h">
          <div className={s.intro}>
            <h2 id="spread-h" className={s.h2}>
              When one risk moves, the next ones follow
            </h2>
            <p>If a cause becomes more likely, what it leads to becomes more likely too, as far as the arrow’s strength.</p>
            <p>
              A risk with several causes adds up the share from each arrow. An analyst checks every change before it is
              saved.
            </p>
          </div>
          <figure className={s.figure} aria-label="How a change travels along one arrow">
            <div className={s.spread}>
              <Node
                id="R1043"
                name="Insecurity in eastern Chad"
                extra={
                  <p className={s.move}>
                    <span>60%</span>
                    <ArrowRight aria-hidden size={16} strokeWidth={2.5} />
                    <strong>75%</strong>
                    <span className={s.delta}>+15 points</span>
                  </p>
                }
              />
              <Flow label="Strength 0.4" />
              <Node
                id="R1055"
                name="Refugees return to West Darfur"
                extra={
                  <p className={s.move}>
                    <span>40%</span>
                    <ArrowRight aria-hidden size={16} strokeWidth={2.5} />
                    <strong>46%</strong>
                    <span className={s.delta}>+6 points</span>
                  </p>
                }
              />
            </div>
            <p className={s.sum}>
              <span>15 points</span>
              <span aria-hidden>×</span>
              <span>strength 0.4</span>
              <span aria-hidden>=</span>
              <strong>6 points</strong>
            </p>
            <figcaption className={s.caption}>Example numbers.</figcaption>
          </figure>
        </section>

        {/* Gaps */}
        <section className={s.section} aria-labelledby="gaps-h">
          <div className={s.intro}>
            <h2 id="gaps-h" className={s.h2}>
              Finding what the map is missing
            </h2>
            <p>The map is never finished. Experts help fill it in five ways.</p>
            <p>
              Everything new starts <strong>dashed</strong>. An analyst approves it, then the whole panel is asked about
              it, like any other piece of the map.
            </p>
          </div>
          <div className={s.figure}>
            <figure className={s.gapMap} aria-label="An expert adds a missing risk">
              <Node id="R1043" name="Insecurity in eastern Chad" chance="High chance" level="high" />
              <Flow dashed label="Added by an expert" />
              <Node
                dashed
                name="Fuel prices spike in Abéché"
                extra={<p className={s.pendingTag}>Waiting for an analyst</p>}
              />
              <figcaption className={s.caption}>Example contribution.</figcaption>
            </figure>
            <ol className={s.signals}>
              {SIGNALS.map((g) => (
                <li key={g.lead}>
                  <strong>{g.lead}</strong>
                  <span>{g.text}</span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Rules */}
        <section className={s.section} aria-labelledby="rules-h">
          <div className={s.intro}>
            <h2 id="rules-h" className={s.h2}>
              Rules that keep it honest
            </h2>
          </div>
          <ul className={`${s.figure} ${s.rules}`}>
            {RULES.map((r) => (
              <li key={r.lead} className={s.rule}>
                <strong>{r.lead}</strong>
                <span>{r.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <section className={s.close} aria-labelledby="close-h">
        <div className={s.closeInner}>
          <h2 id="close-h" className={s.closeH}>
            One question at a time, the map gets closer to the ground truth.
          </h2>
          <Link className="btn" href={`/q/${FIRST_QUESTION_ID}`}>
            Try this week’s questions
            <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
          </Link>
          <p className={s.closeNote}>
            Interface draft. Risks shown are real ACAPS Risk Radar records; weights, percentages and arrow strengths are
            examples.
          </p>
        </div>
      </section>
    </>
  );
}
