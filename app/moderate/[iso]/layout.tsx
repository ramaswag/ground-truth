import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Band } from "@/components/Band";
import { Chrome } from "@/components/moderate/Chrome";
import { WorkspaceProvider } from "@/components/moderate/state";
import { DEMO_ISO } from "@/lib/moderate";
import { getWorkspace } from "@/lib/workspace";
import { listCountries } from "@/lib/radar-source";
import s from "@/components/moderate/moderate.module.css";

/**
 * Every /moderate/[iso] page shares the band, the context strip, the page navigation and
 * one client-side working state, so a decision on one page shows on all the others.
 * [iso] is a country code from the Risk Radar export, or DEMO for the Chad demo.
 */
export default async function ModerateLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ iso: string }>;
}) {
  // The database changes when a moderator uploads an export or saves a link: read it per request.
  await connection();
  const { iso } = await params;
  const data = await getWorkspace(iso);
  if (!data) notFound();
  const real = await listCountries();
  const countries = [{ iso: DEMO_ISO, name: "Chad (demo, sample data)", risks: 0 }, ...real];

  return (
    <div className={s.frame}>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Band home={`/moderate/${data.context.iso}`}>
        <strong>ACAPS moderator</strong>
        <Link href="/login">Switch role</Link>
      </Band>
      {/* Keyed by country so switching starts a fresh working state. */}
      <WorkspaceProvider key={data.context.iso} data={data}>
        <Chrome countries={countries} />
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
            {data.context.demo
              ? "Demo. Risks with an R ID come from the ACAPS Risk Radar. Everything else here, the G and P risks, links, the panel and its names, scores, trends and changes, is made up, and nothing you do is saved."
              : `The ${data.risks.length} risks for ${data.context.name} come from the ACAPS Risk Radar export. Links you draw are saved. There is no panel here yet, so those pages stay empty.`}{" "}
            <Link href="/login">Switch role</Link>.
          </p>
        </div>
      </footer>
    </div>
  );
}
