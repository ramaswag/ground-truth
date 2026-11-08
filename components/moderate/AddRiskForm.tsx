"use client";

import { useEffect, useRef, useState } from "react";
import type { GraphRisk } from "@/lib/moderate";
import s from "./moderate.module.css";

export type NewRisk = {
  title: string;
  label: string;
  place: string;
  relation: "follows" | "drives";
  target: string;
  source: string;
};

/** Manual entry. A risk ACAPS adds goes straight onto the radar; expert proposals arrive in the queue. */
export function AddRiskForm({
  risks,
  defaultTarget,
  onAdd,
  onCancel,
}: {
  risks: GraphRisk[];
  defaultTarget: string;
  onAdd: (r: NewRisk) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [place, setPlace] = useState("");
  const [relation, setRelation] = useState<NewRisk["relation"]>("follows");
  const [target, setTarget] = useState(defaultTarget);
  const [source, setSource] = useState("");
  const [error, setError] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  // A risk that drives another sits one ring further in, so it cannot drive the root.
  const targets = risks.filter((r) => r.status === "mapped" && (relation === "follows" || r.layer > 0));
  const validTarget = targets.some((r) => r.id === target) ? target : targets[0]?.id;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError(true);
      titleRef.current?.focus();
      return;
    }
    onAdd({
      title: title.trim(),
      label: label.trim(),
      place: place.trim(),
      relation,
      target: validTarget,
      source: source.trim(),
    });
  }

  return (
    <form className={s.addPanel} onSubmit={submit} noValidate aria-labelledby="add-head">
      <div>
        <h2 id="add-head" className={s.addHead}>
          Add a risk
        </h2>
        <p className={s.addNote}>
          It goes onto the radar as an ACAPS risk, linked to the risk you pick. Risks experts flag arrive in Needs a
          decision below.
        </p>
      </div>
      <div className={s.fields}>
        <div className={`${s.field2} ${s.wide}`}>
          <label className={s.label} htmlFor="add-title">
            What could happen, and to whom
          </label>
          <input
            ref={titleRef}
            id="add-title"
            className={s.input}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error && e.target.value.trim()) setError(false);
            }}
            aria-invalid={error}
            aria-describedby={error ? "add-title-error" : undefined}
            autoComplete="off"
          />
          {error && (
            <p id="add-title-error" className={s.error}>
              Describe the risk in a sentence before adding it.
            </p>
          )}
        </div>
        <div className={`${s.field2} ${s.wide}`}>
          <label className={s.label} htmlFor="add-relation">
            How it connects
          </label>
          <div className={s.pair}>
            <select
              id="add-relation"
              className={s.select}
              value={relation}
              onChange={(e) => setRelation(e.target.value as NewRisk["relation"])}
            >
              <option value="follows">Follows from</option>
              <option value="drives">Drives</option>
            </select>
            <select
              aria-label="Connected risk"
              className={s.select}
              value={validTarget}
              onChange={(e) => setTarget(e.target.value)}
            >
              {targets.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.id} {r.short}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={s.field2}>
          <label className={s.label} htmlFor="add-label">
            Label on the radar <span>(optional, two or three words)</span>
          </label>
          <input
            id="add-label"
            className={s.input}
            value={label}
            maxLength={28}
            onChange={(e) => setLabel(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className={s.field2}>
          <label className={s.label} htmlFor="add-place">
            Where <span>(optional)</span>
          </label>
          <input
            id="add-place"
            className={s.input}
            value={place}
            onChange={(e) => setPlace(e.target.value)}
            autoComplete="off"
          />
        </div>
        <div className={`${s.field2} ${s.wide}`}>
          <label className={s.label} htmlFor="add-source">
            Source <span>(optional)</span>
          </label>
          <input
            id="add-source"
            className={s.input}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            autoComplete="off"
          />
        </div>
      </div>
      <div className={s.actions}>
        <button type="submit" className="btn btn-primary">
          Add to the radar
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
