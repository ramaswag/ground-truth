import Link from "next/link";
import { Band } from "@/components/Band";
import { Chrome } from "@/components/moderate/Chrome";
import { WorkspaceProvider } from "@/components/moderate/state";
import { getWorkspace } from "@/lib/moderate";
import s from "@/components/moderate/moderate.module.css";

/**
 * Every /moderate page shares the band, the context strip, the page navigation and one
 * client-side working state, so a decision on one page shows on all the others.
 */
export default async function ModerateLayout({ children }: { children: React.ReactNode }) {
  const data = await getWorkspace();
  const radarIds = data.risks.filter((r) => r.origin === "radar").map((r) => r.id);
  return (
    <div className={s.frame}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Band home="/moderate">
        <strong>ACAPS moderator</strong>
        <Link href="/login">Switch role</Link>
      </Band>
      <WorkspaceProvider data={data}>
        <Chrome />
        <main id="main" className={s.main}>
          {children}
        </main>
      </WorkspaceProvider>
      <footer className={s.footer}>
        <div className={s.footInner}>
          <p className={s.footMark}>
            <strong>Ground Truth</strong> by ACAPS
          </p>
          <p className={s.footNote}>
            Interface draft. Risks {radarIds.slice(0, -1).join(", ")} and {radarIds.at(-1)} come from the ACAPS Risk
            Radar export. G and P risks, links, the panel and its names, scores, trends and changes are sample data,
            and decisions made here are not saved. Demo: <Link href="/login">switch role</Link>.
          </p>
        </div>
      </footer>
    </div>
  );
}
