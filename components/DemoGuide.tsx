"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, RotateCcw, X } from "lucide-react";
import s from "./demo.module.css";

/**
 * Presenter bar for the live demo. It walks the story of /how across the real pages: the three
 * kinds of question, how gaps are found, and what ACAPS sees. It appears only once a demo is started
 * (a link with ?tour=1 starts fresh, ?tour=go joins without clearing) and stays for the browser tab.
 */

const STEPS = [
  {
    href: "/q/Q-0411",
    short: "Facts",
    title: "Fact check gathers data",
    line: "Is this true now? Experts confirm what is happening on the ground; ACAPS checks the answers against UNHCR and OCHA within days.",
    act: "Tap an answer and send it.",
  },
  {
    href: "/q/Q-0412",
    short: "Predictions",
    title: "Forecast gathers predictions",
    line: "Will it happen by a date? Answers, weighted by each expert’s track record, move the risk’s chance.",
    act: "Send an answer, then check the risk’s links and add a risk ACAPS hasn’t mapped.",
  },
  {
    href: "/q/Q-0413",
    short: "Gaps",
    title: "Don’t know shows the gaps",
    line: "Not knowing is useful: the question goes to a better-placed colleague, and a panel that keeps saying Don’t know shows where ACAPS lacks experts.",
    act: "Tap Don’t know and look at the forward options.",
  },
  {
    href: "/q/Q-0414",
    short: "Links",
    title: "Risk link maps cause and effect",
    line: "Does one risk drive another? If the panel agrees, a new arrow joins the risk map after an analyst approves it.",
    act: "Answer whether the link holds.",
  },
  {
    href: "/moderate",
    short: "ACAPS view",
    title: "ACAPS sees the result",
    line: "Answers land on the risk wheel: what changed this week, where coverage is thin and where the panel disagrees.",
    act: "Switch the lens to Changes this week, then select a risk.",
  },
] as const;

const KEY = "gt:demo";

function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

/** Answers saved in this browser: cleared so every run of the demo starts from empty questions. */
function clearAnswers() {
  safe(() => {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith("gt:Q-"));
    keys.forEach((k) => localStorage.removeItem(k));
  }, undefined);
}

export function DemoGuide() {
  const pathname = usePathname();
  const [on, setOn] = useState(false);
  const bar = useRef<HTMLElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tour = params.get("tour");
    if (tour === "1" || tour === "go") {
      safe(() => sessionStorage.setItem(KEY, "on"), undefined);
      params.delete("tour");
      const clean = `${window.location.pathname}${params.size ? `?${params}` : ""}`;
      if (tour === "1") {
        clearAnswers();
        // A full load, so the page's forms read the now-empty storage.
        window.location.replace(clean);
        return;
      }
      window.history.replaceState(null, "", clean);
    }
    setOn(safe(() => sessionStorage.getItem(KEY) === "on", false));
  }, [pathname]);

  // Reserve room under the page for the bar, so it never covers the last action.
  useEffect(() => {
    const root = document.documentElement;
    if (!on || !bar.current) {
      delete root.dataset.demo;
      return;
    }
    root.dataset.demo = "on";
    const el = bar.current;
    const ro = new ResizeObserver(() => root.style.setProperty("--demo-h", `${el.offsetHeight}px`));
    ro.observe(el);
    return () => {
      ro.disconnect();
      delete root.dataset.demo;
    };
  }, [on]);

  if (!on) return null;

  const current = STEPS.findIndex((st) => (st.href === "/moderate" ? pathname.startsWith("/moderate") : pathname === st.href));
  const step = current >= 0 ? STEPS[current] : null;
  const next = current >= 0 ? STEPS[current + 1] : STEPS[0];

  function restart() {
    clearAnswers();
    window.location.assign(STEPS[0].href);
  }

  function end() {
    safe(() => sessionStorage.removeItem(KEY), undefined);
    setOn(false);
  }

  return (
    <nav ref={bar} className={`${s.bar} on-ink`} aria-label="Demo">
      <div className={s.inner}>
        <div className={s.top}>
          <p className={s.label}>Demo</p>
          <ol className={s.steps}>
            {STEPS.map((st, i) => (
              <li key={st.href}>
                <Link href={st.href} className={s.step} aria-current={i === current ? "step" : undefined}>
                  <span className={s.num}>{i + 1}</span>
                  <span className={s.short}>{st.short}</span>
                </Link>
              </li>
            ))}
          </ol>
          <div className={s.actions}>
            <button type="button" className={s.quiet} onClick={restart} aria-label="Restart the demo">
              <RotateCcw aria-hidden size={16} strokeWidth={2.5} />
              <span>Restart</span>
            </button>
            {next ? (
              <Link href={next.href} className={s.next}>
                {current < 0 ? (
                  "Start"
                ) : (
                  <>
                    Next<span className={s.wide}> step</span>
                  </>
                )}
                <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
              </Link>
            ) : (
              <Link href="/how" className={s.next} onClick={end}>
                Finish
                <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
              </Link>
            )}
            <button type="button" className={s.close} onClick={end} aria-label="End the demo">
              <X aria-hidden size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
        <p className={s.say} aria-live="polite">
          {step ? (
            <>
              <strong>{step.title}.</strong> {step.line} <span className={s.act}>Try: {step.act}</span>
            </>
          ) : (
            <>
              <strong>Five steps, one story.</strong> The three kinds of question, how gaps are found, and what ACAPS
              sees. Press Start.
            </>
          )}
        </p>
      </div>
    </nav>
  );
}
