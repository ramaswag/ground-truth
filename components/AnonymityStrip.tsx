"use client";

import { useId, useState } from "react";
import { ChevronDown, EyeOff } from "lucide-react";
import s from "./shell.module.css";

const WHO = [
  {
    who: "Other experts",
    sees: "Never see your name, and never see your answers.",
  },
  {
    who: "ACAPS",
    sees: "Knows who you are and reads your answer and note. Weighs each answer by the expert’s track record on past questions like it. Your record is never shown to anyone.",
  },
  {
    who: "The public",
    sees: "Only sees panel results ACAPS chooses to publish. Never who said what.",
  },
];

export function AnonymityStrip({ referred }: { referred: boolean }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className={s.stripWrap}>
      <div className={`${s.strip} on-ink`}>
        <div className={s.stripInner}>
          <EyeOff className={s.stripIcon} aria-hidden size={18} strokeWidth={2.25} />
          {referred ? (
            <p className={s.stripText}>
              <strong>Forwarded to you</strong>
              <span className={s.wide}> by a panel expert</span>
              <span className={s.sep}> · </span>
              ACAPS checks who you are first
            </p>
          ) : (
            <p className={s.stripText}>
              <strong>Anonymous</strong> to other experts<span className={s.sep}> · </span>known to ACAPS
              <span className={s.wide}>
                <span className={s.sep}> · </span>never published with your name
              </span>
            </p>
          )}
          <button
            type="button"
            className={s.whoButton}
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((v) => !v)}
          >
            Who sees what
            <ChevronDown aria-hidden size={16} strokeWidth={2.5} className={s.chev} data-open={open} />
          </button>
        </div>
      </div>
      <div id={panelId} className={s.who} hidden={!open}>
        <dl className={s.whoGrid}>
          {WHO.map((w) => (
            <div key={w.who} className={s.whoCell}>
              <dt>{w.who}</dt>
              <dd>{w.sees}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
