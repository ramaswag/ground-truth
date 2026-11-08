"use client";

import { Fragment, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import type { Question } from "@/lib/questions";
import { formatDate, formatTimeLeft, formatDeadline } from "@/lib/dates";
import {
  emailBody,
  emailSubject,
  mailtoHref,
  questionUrl,
  whatsappHref,
  whatsappText,
  type Unit,
} from "@/lib/share";
import { useCopy, useOrigin, useReferral } from "@/lib/client";
import { WhatsAppIcon } from "./icons";
import s from "./carry.module.css";

type Medium = "whatsapp" | "email";

const MEDIA: { id: Medium; label: string }[] = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
];

const URL_RE = /(https?:\/\/[^\s]+|\/q\/[^\s]+)/g;

/** Render WhatsApp's own markup: *bold*, _italic_, and links. */
function WhatsAppText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {renderWaLine(line)}
        </Fragment>
      ))}
    </>
  );
}

function renderWaLine(line: string) {
  const bold = line.match(/^\*(.+)\*$/);
  if (bold) return <strong>{bold[1]}</strong>;
  const italic = line.match(/^_(.+)_$/);
  if (italic) return <em>{italic[1]}</em>;
  return <Linkified text={line} />;
}

function Linkified({ text }: { text: string }) {
  const parts = text.split(URL_RE);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <a key={i} href={p} className="u-break">
            {p}
          </a>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

export function CarryPanel({ question }: { question: Question }) {
  const origin = useOrigin();
  const referral = useReferral();
  const [active, setActive] = useState<Medium>("whatsapp");
  const [copied, copy] = useCopy();

  const unit: Unit = { question, origin, referral, intro: "share" };
  const wa = whatsappText(unit);
  const subject = emailSubject(unit);
  const body = emailBody(unit);
  const host = origin ? new URL(origin).host : "";
  const horizon = formatTimeLeft(question.resolvesOn);

  function onTabKey(e: React.KeyboardEvent<HTMLButtonElement>) {
    const i = MEDIA.findIndex((m) => m.id === active);
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % MEDIA.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + MEDIA.length) % MEDIA.length;
    else return;
    e.preventDefault();
    setActive(MEDIA[next].id);
    document.getElementById(`tab-${MEDIA[next].id}`)?.focus();
  }

  return (
    <section className={s.carry} aria-labelledby="carry-heading">
      <div className={s.head}>
        <h2 id="carry-heading" className={s.heading}>
          Carry this question
        </h2>
        <p className={s.lede}>
          The same question, set for each place it can travel. Every version carries the three answers, so it can be
          answered in one tap. ACAPS reviews anyone you reach this way before their answer counts.
        </p>
      </div>

      <div role="tablist" aria-label="Where to send it" className={s.tabs}>
        {MEDIA.map((m) => (
          <button
            key={m.id}
            id={`tab-${m.id}`}
            type="button"
            role="tab"
            aria-selected={active === m.id}
            aria-controls={`panel-${m.id}`}
            tabIndex={active === m.id ? 0 : -1}
            className={s.tab}
            onClick={() => setActive(m.id)}
            onKeyDown={onTabKey}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div>
        <article
          id="panel-whatsapp"
          role="tabpanel"
          aria-labelledby="tab-whatsapp"
          className={s.col}
          data-active={active === "whatsapp"}
        >
          <h3 className={s.colHead}>
            <WhatsAppIcon size={18} />
            WhatsApp message
          </h3>
          <div className={s.waGround}>
            <div className={s.waBubble}>
              <a className={s.waCard} href={questionUrl(origin, question.id)}>
                {/* eslint-disable-next-line @next/next/no-img-element -- generated share card, same image WhatsApp shows */}
                <img
                  src={`/q/${question.id}/opengraph-image`}
                  alt=""
                  width={1200}
                  height={630}
                  loading="lazy"
                  decoding="async"
                  className={s.waImg}
                />
                <span className={s.waCardText}>
                  <span className={s.waCardTitle}>{question.text}</span>
                  <span className={s.waCardHost}>{host || "Ground Truth by ACAPS"}</span>
                </span>
              </a>
              <p className={s.waText}>
                <WhatsAppText text={wa} />
              </p>
            </div>
          </div>
          <div className={s.actions}>
            <a className="btn btn-wa" href={whatsappHref(wa)} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon size={18} />
              Open in WhatsApp
            </a>
            <button type="button" className="btn" onClick={() => copy("wa", wa)}>
              {copied === "wa" ? <Check aria-hidden size={18} strokeWidth={3} /> : <Copy aria-hidden size={18} />}
              {copied === "wa" ? "Copied" : "Copy text"}
            </button>
          </div>
        </article>

        <article
          id="panel-email"
          role="tabpanel"
          aria-labelledby="tab-email"
          className={s.col}
          data-active={active === "email"}
        >
          <h3 className={s.colHead}>
            <Mail aria-hidden size={18} strokeWidth={2.25} />
            Email
          </h3>
          <div className={s.mail}>
            <dl className={s.mailHead}>
              <div>
                <dt>To</dt>
                <dd>Your colleague</dd>
              </div>
              <div>
                <dt>Subject</dt>
                <dd className={s.mailSubject}>{subject}</dd>
              </div>
            </dl>
            <p className={s.mailBody}>
              <Linkified text={body} />
            </p>
          </div>
          <div className={s.actions}>
            <a className="btn" href={mailtoHref(unit)}>
              <Mail aria-hidden size={18} strokeWidth={2.25} />
              Open in email
            </a>
            <button type="button" className="btn" onClick={() => copy("email", `${subject}\n\n${body}`)}>
              {copied === "email" ? <Check aria-hidden size={18} strokeWidth={3} /> : <Copy aria-hidden size={18} />}
              {copied === "email" ? "Copied" : "Copy text"}
            </button>
          </div>
        </article>
      </div>

      <p className={s.foot}>
        Open until {formatDeadline(question.answerBy)} ·{" "}
        {/* Relative to now, so server and client render can differ at a unit boundary. */}
        <time dateTime={question.resolvesOn} title={formatDate(question.resolvesOn)} suppressHydrationWarning>
          {horizon ? `resolves in ${horizon}` : "resolved"}
        </time>
      </p>
      <p aria-live="polite" className="visually-hidden">
        {copied ? "Copied to clipboard" : ""}
      </p>
    </section>
  );
}
