import { KIND_LABEL, type Question } from "@/lib/questions";
import { AnonymityStrip } from "./AnonymityStrip";
import { Band } from "./Band";

export function Shell({ question, referred }: { question: Question; referred: boolean }) {
  return (
    <>
      <a className="skip" href="#answer">
        Skip to answer
      </a>
      <Band home="/">
        <strong>{question.panel.name} panel</strong>
        <span>
          {referred
            ? "Forwarded question"
            : `${KIND_LABEL[question.kind]} · ${question.position.index} of ${question.position.total} this week`}
        </span>
      </Band>
      <AnonymityStrip referred={referred} />
    </>
  );
}
