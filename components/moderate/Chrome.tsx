"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { formatDate } from "@/lib/dates";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

/** The moderator's context strip and page navigation, under the band on every /moderate page. */
export function Chrome() {
  const { data, open, reviewed, changes, risks, announce } = useWorkspace();
  const path = usePathname();
  const { context, panel } = data;
  const answered = panel.reduce((n, e) => n + e.answered, 0);
  const verifiedFor = (ids: string[]) =>
    panel.filter((e) => e.identity === "verified" && e.covers.some((c) => ids.includes(c))).length;
  const gaps = data.spaces.filter((sp) => verifiedFor(sp.riskIds.filter((id) => risks.some((r) => r.id === id))) <= 1);
  const outliers = data.outliers.filter((o) => !reviewed[o.id]);

  const pages = [
    { href: "/moderate", label: "Radar" },
    { href: "/moderate/decisions", label: "Decisions", count: open.length },
    { href: "/moderate/changes", label: "Changes", count: changes.length },
    { href: "/moderate/panel", label: "Panel", count: panel.length },
    { href: "/moderate/gaps", label: "Gaps", count: gaps.length },
    { href: "/moderate/outliers", label: "Outliers", count: outliers.length },
  ];

  return (
    <>
      <div className={s.strip}>
        <p className={s.stripInner}>
          <strong>{context.name} panel</strong>
          <span className={s.sep} aria-hidden>
            ·
          </span>
          <span>{panel.length} experts</span>
          <span className={s.sep} aria-hidden>
            ·
          </span>
          <span>
            Week {context.week} round open until {formatDate(context.closes)}
          </span>
          <span className={s.sep} aria-hidden>
            ·
          </span>
          <span>
            {answered} of {panel.length * context.questions} answers in
          </span>
          <span className={s.sep} aria-hidden>
            ·
          </span>
          <span>Sample data, not saved</span>
        </p>
      </div>
      <nav className={s.nav} aria-label="Moderator">
        <ul className={s.navInner}>
          {pages.map((p) => (
            <li key={p.href}>
              <Link href={p.href} className={s.navLink} aria-current={path === p.href ? "page" : undefined}>
                {p.label}
                {p.count !== undefined && <span className={s.navCount}>{p.count}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="visually-hidden" aria-live="polite">
        {announce}
      </p>
    </>
  );
}

/** Page heading under the navigation: weight-800 title on a 3px rule, one line of purpose. */
export function PageHead({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className={s.sectionHead}>
      <h1 id="page-head">{title}</h1>
      {children && <p>{children}</p>}
    </div>
  );
}
