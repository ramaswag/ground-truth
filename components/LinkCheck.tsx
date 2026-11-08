"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Plus } from "lucide-react";
import type { LinkView } from "@/lib/questions";
import { ANSWERS, type AnswerValue } from "@/lib/share";
import { readStore, writeStore } from "@/lib/client";
import s from "./graph.module.css";
import fm from "./answer.module.css";

type Added = { what: string; relation: "drives" | "follows"; where: string; source: string };
type Stored = { links: Record<string, AnswerValue>; added: Added[] };

const EMPTY: Added = { what: "", relation: "follows", where: "", source: "" };

/**
 * After a forecast: where its risk sits in the graph. Each mapped link is one optional
 * tap, asked of every expert alike whatever they answered; a missing risk can be added
 * for an analyst to review.
 */
export function LinkCheck({ questionId, riskId, links }: { questionId: string; riskId: string; links: LinkView[] }) {
  const storeKey = `gt:${questionId}:links`;
  const [state, setState] = useState<Stored>({ links: {}, added: [] });
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Added>(EMPTY);
  const [error, setError] = useState<string>();
  const whatRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  useEffect(() => {
    const stored = readStore<Stored>(storeKey);
    if (stored) setState(stored);
  }, [storeKey]);

  function save(next: Stored) {
    setState(next);
    writeStore(storeKey, next);
  }

  function submit() {
    if (!draft.what.trim()) {
      setError("Say what the risk is, in a line.");
      whatRef.current?.focus();
      return;
    }
    save({ ...state, added: [...state.added, { ...draft, what: draft.what.trim() }] });
    setDraft(EMPTY);
    setError(undefined);
    setAdding(false);
  }

  const WORDS = ["", "", "two", "three"];
  const count = links.length === 1 ? "the risk below" : `the ${WORDS[links.length] ?? links.length} risks below`;

  return (
    <section className={s.check} aria-labelledby={`${uid}-h`}>
      <h3 id={`${uid}-h`} className={s.checkHeading}>
        Where this sits in the risk graph
      </h3>
      <p className={s.checkLead}>
        ACAPS links this risk to {count}. Does each link hold over the next six months? One tap each, all optional.
      </p>

      <ul className={s.items}>
        {links.map((l) => {
          const drivenBy = l.to.id === riskId;
          const other = drivenBy ? l.from : l.to;
          const picked = state.links[l.id];
          return (
            <li key={l.id} className={s.item}>
              <p className={s.itemMeta}>
                <span>
                  {drivenBy ? "Driven by" : "Leads to"} · Risk {other.id} · {other.place}
                </span>
                {picked && (
                  <span className={s.saved}>
                    <Check aria-hidden size={14} strokeWidth={3} />
                    Sent
                  </span>
                )}
              </p>
              {other.title && <p className={s.itemTitle}>{other.title}</p>}
              <fieldset className={s.seg}>
                <legend className="visually-hidden">
                  Does this link hold: {drivenBy ? `risk ${other.id} drives this one` : `this risk leads to ${other.id}`}?
                </legend>
                {ANSWERS.map((a) => (
                  <label key={a.value} className={s.segOption} data-checked={picked === a.value}>
                    <input
                      type="radio"
                      name={`${uid}-${l.id}`}
                      value={a.value}
                      checked={picked === a.value}
                      onChange={() => save({ ...state, links: { ...state.links, [l.id]: a.value } })}
                      className="visually-hidden"
                    />
                    {picked === a.value && <Check aria-hidden size={16} strokeWidth={3} />}
                    {a.label}
                  </label>
                ))}
              </fieldset>
            </li>
          );
        })}
      </ul>

      {state.added.length > 0 && (
        <ul className={s.addedList}>
          {state.added.map((a, i) => (
            <li key={i} className={s.added}>
              <p className={s.itemMeta}>
                <span>{a.relation === "drives" ? "Drives this risk" : "Follows from this risk"} · sent to ACAPS</span>
                <span className={s.pending}>Pending review</span>
              </p>
              <p className={s.itemTitle}>{a.what}</p>
            </li>
          ))}
        </ul>
      )}

      {adding ? (
        <form
          className={s.addForm}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <label className={fm.field}>
            <span className={fm.fieldLabel}>What risk is missing?</span>
            <input
              ref={whatRef}
              className={fm.input}
              value={draft.what}
              maxLength={160}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? `${uid}-err` : undefined}
              onChange={(e) => {
                setDraft({ ...draft, what: e.target.value });
                if (error) setError(undefined);
              }}
              placeholder="Say it in a line."
              autoFocus
            />
            {error && (
              <span id={`${uid}-err`} className={fm.fieldError}>
                {error}
              </span>
            )}
          </label>
          <fieldset className={s.relation}>
            <legend className={fm.fieldLabel}>How does it connect?</legend>
            <div className={s.relationOptions}>
              {(
                [
                  ["follows", "It follows from this risk"],
                  ["drives", "It drives this risk"],
                ] as const
              ).map(([value, label]) => (
                <label key={value} className={s.relationOption}>
                  <input
                    type="radio"
                    name={`${uid}-relation`}
                    value={value}
                    checked={draft.relation === value}
                    onChange={() => setDraft({ ...draft, relation: value })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </fieldset>
          <div className={s.pair}>
            <label className={fm.field}>
              <span className={fm.fieldLabel}>
                Where? <span className={fm.opt}>optional</span>
              </span>
              <input
                className={fm.input}
                value={draft.where}
                maxLength={80}
                onChange={(e) => setDraft({ ...draft, where: e.target.value })}
              />
            </label>
            <label className={fm.field}>
              <span className={fm.fieldLabel}>
                Source <span className={fm.opt}>optional</span>
              </span>
              <input
                className={fm.input}
                value={draft.source}
                maxLength={200}
                onChange={(e) => setDraft({ ...draft, source: e.target.value })}
                placeholder="A link, or who told you."
              />
            </label>
          </div>
          <p className={s.addNote}>An ACAPS analyst checks it before it joins the graph. Only ACAPS sees it came from you.</p>
          <div className={s.addActions}>
            <button type="submit" className="btn">
              Send to ACAPS
            </button>
            <button
              type="button"
              className="btn-text"
              onClick={() => {
                setAdding(false);
                setError(undefined);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button type="button" className={`btn-text ${s.addButton}`} onClick={() => setAdding(true)}>
          <Plus aria-hidden size={18} strokeWidth={2.5} />
          {state.added.length ? "Add another missing risk" : "Add a risk ACAPS hasn’t mapped"}
        </button>
      )}
    </section>
  );
}
