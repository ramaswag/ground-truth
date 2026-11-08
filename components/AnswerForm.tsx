"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check, ChevronDown, Forward, Mail, RotateCcw, TriangleAlert, WifiOff } from "lucide-react";
import type { Question } from "@/lib/questions";
import { formatDate, formatDeadline } from "@/lib/dates";
import {
  ANSWERS,
  answerLabel,
  mailtoHref,
  whatsappHref,
  whatsappText,
  type AnswerValue,
  type Unit,
} from "@/lib/share";
import { formatStamp, readStore, useOrigin, useReferral, writeStore } from "@/lib/client";
import { WhatsAppIcon } from "./icons";
import { LinkCheck } from "./LinkCheck";
import s from "./answer.module.css";

type Via = "whatsapp" | "email";
type FinalState = "sent" | "pending";
type Stored = {
  answer: AnswerValue;
  note: string;
  at: string;
  state: FinalState | "queued";
  finalState: FinalState;
  via?: Via;
  /** The answer went against ACAPS's current reading, so the note was required. */
  differs?: boolean;
};

type Errors = { name?: string; contact?: string; note?: string };

const NOTE_MAX = 280;

type Props = {
  question: Question;
  initialAnswer?: AnswerValue;
  incomingReferral?: string;
  failFirst?: boolean;
};

export function AnswerForm({ question, initialAnswer, incomingReferral, failFirst }: Props) {
  const referred = Boolean(incomingReferral);
  const storeKey = `gt:${question.id}:${referred ? "referred" : "panel"}`;
  const origin = useOrigin();
  const outgoingReferral = useReferral();

  const [answer, setAnswer] = useState<AnswerValue | null>(initialAnswer ?? null);
  const [fromLink, setFromLink] = useState(Boolean(initialAnswer));
  const [note, setNote] = useState("");
  const [line, setLine] = useState("");
  const [identity, setIdentity] = useState({ name: "", contact: "", org: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [sending, setSending] = useState(false);
  const [failed, setFailed] = useState(false);
  const [record, setRecord] = useState<Stored | null>(null);
  const [editing, setEditing] = useState(false);

  const failedOnce = useRef(false);
  const focusConfirm = useRef(false);
  const confirmHeading = useRef<HTMLHeadingElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const contactRef = useRef<HTMLInputElement>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);

  const reading = question.acapsReading;
  const differs = Boolean(reading && answer && answer !== "dk" && answer !== reading.answer);

  // Restore an answer already given on this device.
  useEffect(() => {
    const stored = readStore<Stored>(storeKey);
    if (stored) {
      setRecord(stored);
      setAnswer(stored.answer);
      setNote(stored.note);
      setFromLink(false);
    }
  }, [storeKey]);

  // A queued answer sends itself as soon as the connection is back.
  useEffect(() => {
    if (record?.state !== "queued") return;
    const flush = () => {
      const next: Stored = { ...record, state: record.finalState };
      setRecord(next);
      writeStore(storeKey, next);
    };
    if (navigator.onLine) {
      flush();
      return;
    }
    window.addEventListener("online", flush);
    return () => window.removeEventListener("online", flush);
  }, [record, storeKey]);

  useEffect(() => {
    if (focusConfirm.current && record && !editing) {
      focusConfirm.current = false;
      confirmHeading.current?.focus();
    }
  }, [record, editing]);

  const forwardUnit: Unit = {
    question,
    origin,
    referral: outgoingReferral,
    personalLine: line,
    intro: "forward",
  };
  const forwardText = whatsappText(forwardUnit);

  function choose(value: AnswerValue) {
    setAnswer(value);
    setFromLink(false);
    setFailed(false);
    setErrors({});
  }

  function validate(): boolean {
    if (answer === "dk") return true;
    const e: Errors = {};
    if (referred && !identity.name.trim()) e.name = "Add your name so ACAPS can check who you are.";
    if (referred && !identity.contact.trim()) e.contact = "Add an email address or WhatsApp number ACAPS can reach.";
    if (differs && !note.trim()) e.note = "Add a line on what you are seeing. A place, a date or a source is enough.";
    setErrors(e);
    if (e.name) nameRef.current?.focus();
    else if (e.contact) contactRef.current?.focus();
    else if (e.note) noteRef.current?.focus();
    return !e.name && !e.contact && !e.note;
  }

  function commit(next: Stored) {
    setRecord(next);
    writeStore(storeKey, next);
    setEditing(false);
    focusConfirm.current = true;
  }

  async function send(via?: Via) {
    if (!answer || sending) return;
    if (!validate()) return;
    setFailed(false);
    const finalState: FinalState = referred && answer !== "dk" ? "pending" : "sent";
    const base = { answer, note: note.trim(), at: new Date().toISOString(), finalState, via, differs };

    if (!navigator.onLine) {
      commit({ ...base, state: "queued" });
      return;
    }
    // Forwarding opens WhatsApp or email straight away; the answer is recorded alongside.
    if (!via) {
      setSending(true);
      await new Promise((r) => setTimeout(r, 650));
      setSending(false);
      if (failFirst && !failedOnce.current) {
        failedOnce.current = true;
        setFailed(true);
        return;
      }
    }
    commit({ ...base, state: finalState });
  }

  function change() {
    setEditing(true);
    setFromLink(false);
    requestAnimationFrame(() => {
      optionsRef.current?.querySelector<HTMLInputElement>("input:checked")?.focus();
    });
  }

  if (record && !editing) {
    return (
      <Confirmation
        record={record}
        question={question}
        referred={referred}
        onChange={change}
        headingRef={confirmHeading}
      />
    );
  }

  return (
    <form
      id="answer"
      className={s.form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        void send();
      }}
    >
      <fieldset className={s.fieldset}>
        <legend className={s.legend}>{question.ask ?? "Your answer"}</legend>
        <div className={s.options} ref={optionsRef}>
          {ANSWERS.map((a) => {
            const checked = answer === a.value;
            return (
              <label key={a.value} className={s.option} data-checked={checked}>
                <input
                  type="radio"
                  name="answer"
                  value={a.value}
                  checked={checked}
                  onChange={() => choose(a.value)}
                  className="visually-hidden"
                />
                <span className={s.optionLabel}>{a.label}</span>
                {checked ? (
                  <Check className={s.optionMark} aria-hidden size={22} strokeWidth={3} />
                ) : a.value === "dk" ? (
                  <span className={s.optionHint}>Pass it on</span>
                ) : null}
              </label>
            );
          })}
        </div>
      </fieldset>

      {fromLink && answer && (
        <p className={s.fromLink}>
          You picked <strong>{answerLabel(answer)}</strong> from your message. Send it to confirm.
        </p>
      )}

      {answer && answer !== "dk" && (
        <div className={s.followup} key="known">
          {referred && (
            <fieldset className={s.identity}>
              <legend className={s.sub}>Tell ACAPS who you are</legend>
              <div className={s.identityBox}>
              <p className={s.help}>Only ACAPS sees this. It is never shown to the panel or published.</p>
              <div className={s.identityGrid}>
                <label className={s.field}>
                  <span className={s.fieldLabel}>Name</span>
                  <input
                    ref={nameRef}
                    className={s.input}
                    value={identity.name}
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                    aria-describedby={errors.name ? "err-name" : undefined}
                    onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                  />
                  {errors.name && (
                    <span id="err-name" className={s.fieldError}>
                      {errors.name}
                    </span>
                  )}
                </label>
                <label className={s.field}>
                  <span className={s.fieldLabel}>Email or WhatsApp number</span>
                  <input
                    ref={contactRef}
                    className={s.input}
                    value={identity.contact}
                    autoComplete="email"
                    aria-invalid={Boolean(errors.contact)}
                    aria-describedby={errors.contact ? "err-contact" : undefined}
                    onChange={(e) => setIdentity({ ...identity, contact: e.target.value })}
                  />
                  {errors.contact && (
                    <span id="err-contact" className={s.fieldError}>
                      {errors.contact}
                    </span>
                  )}
                </label>
                <label className={`${s.field} ${s.full}`}>
                  <span className={s.fieldLabel}>
                    Organisation <span className={s.opt}>optional</span>
                  </span>
                  <input
                    className={s.input}
                    value={identity.org}
                    autoComplete="organization"
                    onChange={(e) => setIdentity({ ...identity, org: e.target.value })}
                  />
                </label>
              </div>
              </div>
            </fieldset>
          )}

          <div className={differs ? `${s.field} ${s.differs}` : s.field}>
            {differs && reading ? (
              <>
                <label htmlFor="note" className={s.sub}>
                  What are you seeing?
                </label>
                <p id="note-why" className={s.differsText}>
                  ACAPS currently reads this as {reading.answer === "yes" ? "likely" : "unlikely"}: {reading.basis}{" "}
                  Yours is a different read, and those are the answers ACAPS learns most from.
                </p>
              </>
            ) : (
              <label htmlFor="note" className={s.fieldLabel}>
                {question.kind === "verify" ? "How do you know?" : "Why?"} <span className={s.opt}>optional</span>
              </label>
            )}
            <textarea
              id="note"
              ref={noteRef}
              className={s.textarea}
              rows={differs ? 3 : 2}
              maxLength={NOTE_MAX}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                if (errors.note) setErrors({ ...errors, note: undefined });
              }}
              required={differs}
              aria-invalid={Boolean(errors.note)}
              aria-describedby={[differs && "note-why", errors.note && "err-note", "note-help"].filter(Boolean).join(" ")}
              placeholder={
                differs
                  ? "A place, a date or a source is enough."
                  : question.kind === "verify"
                    ? "Seen it yourself, heard it from someone there, or a link."
                    : "A line or a source is enough."
              }
            />
            {errors.note && (
              <span id="err-note" className={s.fieldError}>
                {errors.note}
              </span>
            )}
            <span id="note-help" className={s.fieldMeta}>
              <span>Only ACAPS reads your note.</span>
              <span aria-hidden>
                {note.length}/{NOTE_MAX}
              </span>
            </span>
          </div>

          <div className={s.sendRow}>
            <button type="submit" className="btn btn-primary" disabled={sending} aria-busy={sending}>
              {sending ? "Sending…" : failed ? "Try again" : "Send answer"}
            </button>
            <p className={s.until}>You can change it until {formatDeadline(question.answerBy)}.</p>
          </div>
          {failed && <SendError />}
        </div>
      )}

      {answer === "dk" && (
        <div className={s.followup} key="dk">
          <h2 className={s.sub}>Who would know?</h2>
          <p className={s.help}>
            Send this question to a colleague closer to it. They see the question only, not the panel. ACAPS checks
            who they are before their answer counts.
          </p>
          <label className={s.field}>
            <span className={s.fieldLabel}>
              Add a line <span className={s.opt}>optional</span>
            </span>
            <input
              className={s.input}
              value={line}
              maxLength={160}
              onChange={(e) => setLine(e.target.value)}
              placeholder="Thought of you because you cover Adré."
            />
          </label>
          <div className={s.forwardActions}>
            <a
              className="btn btn-wa"
              href={whatsappHref(forwardText)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => void send("whatsapp")}
            >
              <WhatsAppIcon size={18} />
              Forward on WhatsApp
            </a>
            <a className="btn" href={mailtoHref(forwardUnit)} onClick={() => void send("email")}>
              <Mail aria-hidden size={18} strokeWidth={2.25} />
              Forward by email
            </a>
          </div>
          <details className={s.preview}>
            <summary>
              See the message
              <ChevronDown aria-hidden size={18} strokeWidth={2.5} className={s.previewChev} />
            </summary>
            <pre className={s.pre}>{forwardText}</pre>
          </details>
          <div className={s.dkSend}>
            <button type="submit" className="btn-text" disabled={sending}>
              {sending ? "Sending…" : "Send ‘Don’t know’ without forwarding"}
            </button>
          </div>
          {failed && <SendError />}
        </div>
      )}
    </form>
  );
}

function SendError() {
  return (
    <div role="alert" className={s.error}>
      <TriangleAlert aria-hidden size={20} strokeWidth={2.25} className={s.errorIcon} />
      <p>
        <strong>Your answer didn’t send.</strong> It is still here. Check your connection and try again.
      </p>
    </div>
  );
}

function Confirmation({
  record,
  question,
  referred,
  onChange,
  headingRef,
}: {
  record: Stored;
  question: Question;
  referred: boolean;
  onChange: () => void;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
}) {
  const word = answerLabel(record.answer);
  const label =
    record.state === "sent"
      ? `Sent ${formatStamp(record.at)}`
      : record.state === "pending"
        ? "Received · pending ACAPS review"
        : "Saved on this device · not sent yet";

  return (
    <section id="answer" className={s.confirm} aria-labelledby="confirm-heading">
      <h2 id="confirm-heading" ref={headingRef} tabIndex={-1} className="visually-hidden">
        {record.state === "sent"
          ? `Your answer, ${word}, was sent.`
          : record.state === "pending"
            ? `Your answer, ${word}, is waiting for ACAPS review.`
            : `Your answer, ${word}, is saved and will send when you are back online.`}
      </h2>
      <div className={s.plate} data-state={record.state} aria-hidden>
        <p className={s.plateLabel}>
          {record.state === "queued" && <WifiOff size={16} strokeWidth={2.5} />}
          {label}
        </p>
        <p className={s.plateWord}>{word}</p>
      </div>

      {record.state === "pending" && (
        <p className={s.confirmText}>
          ACAPS will check who you are. Once they have, your answer counts. Nobody on the panel sees your name.
        </p>
      )}
      {record.state === "queued" && (
        <p className={s.confirmText}>
          You seem to be offline. It sends by itself when the connection returns, or next time you open this page.
        </p>
      )}

      {record.note && (
        <figure className={s.noteQuote}>
          <blockquote>{record.note}</blockquote>
          <figcaption>Your note · only ACAPS reads it</figcaption>
        </figure>
      )}

      {record.via && (
        <p className={s.forwarded}>
          <Forward aria-hidden size={18} strokeWidth={2.25} />
          <span>
            Forwarded by {record.via === "whatsapp" ? "WhatsApp" : "email"}. If your colleague answers, ACAPS reviews
            it before it counts.
          </span>
        </p>
      )}

      <p className={s.until}>You can change your answer until {formatDeadline(question.answerBy)}.</p>

      {!referred && question.followUpLinks && question.followUpLinks.length > 0 && (
        <LinkCheck questionId={question.id} riskId={question.riskId} links={question.followUpLinks} />
      )}

      <div className={s.confirmActions}>
        {question.next && !referred ? (
          <Link className="btn btn-primary" href={`/q/${question.next}`}>
            Next question
            <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
          </Link>
        ) : (
          <p className={s.done}>
            {referred
              ? "Thank you. That was the only question sent to you."
              : "That’s this week’s questions done. The next set comes next week, or sooner if the situation shifts."}
          </p>
        )}
        <button type="button" className="btn" onClick={onChange}>
          <RotateCcw aria-hidden size={18} strokeWidth={2.25} />
          Change answer
        </button>
      </div>
    </section>
  );
}
