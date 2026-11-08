"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { formatDate } from "@/lib/dates";
import { useWorkspace } from "./state";
import s from "./moderate.module.css";

export type CountryOption = { iso: string; name: string; risks: number };

/** The moderator's context strip, country picker and page navigation, on every /moderate page. */
export function Chrome({ countries }: { countries: CountryOption[] }) {
  const { data, base, open, reviewed, changes, risks, announce } = useWorkspace();
  const path = usePathname();
  const router = useRouter();
  const { context, panel } = data;
  const answered = panel.reduce((n, e) => n + e.answered, 0);
  const verifiedFor = (ids: string[]) =>
    panel.filter((e) => e.identity === "verified" && e.covers.some((c) => ids.includes(c))).length;
  const gaps = data.spaces.filter((sp) => verifiedFor(sp.riskIds.filter((id) => risks.some((r) => r.id === id))) <= 1);
  const outliers = data.outliers.filter((o) => !reviewed[o.id]);

  const pages = [
    { href: base, label: "Radar" },
    { href: `${base}/decisions`, label: "Decisions", count: open.length },
    { href: `${base}/changes`, label: "Changes", count: changes.length },
    { href: `${base}/panel`, label: "Panel", count: panel.length },
    { href: `${base}/gaps`, label: "Gaps", count: gaps.length },
    { href: `${base}/outliers`, label: "Outliers", count: outliers.length },
    { href: `${base}/data`, label: "Data" },
  ];

  // Switching country keeps the page the moderator is on: /moderate/TCD/panel -> /moderate/AFG/panel.
  function switchTo(iso: string) {
    const rest = path.startsWith(base) ? path.slice(base.length) : "";
    router.push(`/moderate/${iso}${rest}`);
  }

  return (
    <>
      <div className={s.strip}>
        <div className={s.stripInner}>
          <label className={s.countryPick}>
            <span className="visually-hidden">Country</span>
            <select value={context.iso} onChange={(e) => switchTo(e.target.value)}>
              {countries.map((c) => (
                <option key={c.iso} value={c.iso}>
                  {c.risks ? `${c.name} (${c.risks})` : c.name}
                </option>
              ))}
            </select>
          </label>
          <span className={s.sep} aria-hidden>
            ·
          </span>
          <span>
            {risks.length} risk{risks.length === 1 ? "" : "s"}
          </span>
          <span className={s.sep} aria-hidden>
            ·
          </span>
          {context.hasPanel ? (
            <>
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
              <span>Demo: sample data, nothing saved</span>
            </>
          ) : (
            <span>Risk Radar data. No panel yet. Links you draw are saved.</span>
          )}
        </div>
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

/** What an empty page will hold once this country has a panel. */
export function NotYet({ children }: { children: React.ReactNode }) {
  return <p className={s.notYet}>{children}</p>;
}
