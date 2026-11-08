import type { Metadata } from "next";
import { connection } from "next/server";
import { PageHead } from "@/components/moderate/Chrome";
import { dataStatus } from "@/lib/db";
import s from "@/components/moderate/moderate.module.css";

export const metadata: Metadata = { title: "Data · Moderator · Ground Truth by ACAPS" };

const WHEN = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

export default async function DataPage({
  params,
  searchParams,
}: {
  params: Promise<{ iso: string }>;
  searchParams: Promise<{ imported?: string; countries?: string; error?: string }>;
}) {
  await connection();
  const { iso } = await params;
  const { imported, countries, error } = await searchParams;
  const status = dataStatus();

  return (
    <section className={s.page} aria-labelledby="page-head">
      <PageHead title="Risk Radar data">
        Every country in the picker comes from the latest ACAPS Risk Radar export. Upload a newer one here when ACAPS
        publishes it.
      </PageHead>

      {imported && (
        <p className={s.notice} role="status">
          Loaded {imported} risks across {countries} countries.
        </p>
      )}
      {error && (
        <p className={s.noticeError} role="alert">
          Nothing changed: {error}
        </p>
      )}

      <dl className={s.facts}>
        <div>
          <dt>Risks</dt>
          <dd>{status.risks}</dd>
        </div>
        <div>
          <dt>Countries</dt>
          <dd>{status.countries}</dd>
        </div>
        <div>
          <dt>Links drawn by moderators</dt>
          <dd>{status.links}</dd>
        </div>
        <div>
          <dt>Last loaded</dt>
          <dd>
            {status.lastImport
              ? `${WHEN.format(new Date(status.lastImport.at))} UTC, from ${status.lastImport.source}`
              : "Never"}
          </dd>
        </div>
      </dl>

      <form className={s.upload} action="/api/import" method="post" encType="multipart/form-data">
        <input type="hidden" name="back" value={`/moderate/${iso}/data`} />
        <label className={s.uploadField}>
          <span>Risk Radar export (CSV)</span>
          <input type="file" name="file" accept=".csv,text/csv" required />
        </label>
        <button type="submit" className="btn btn-primary">
          Load export
        </button>
        <p className={s.small}>
          The upload replaces every risk with the rows in the file. Links you drew stay; a link whose risk is no longer
          in the export stops showing. The file needs the export&rsquo;s own column names (Risk ID, Risk Title, ISO,
          Country and the rest).
        </p>
      </form>
    </section>
  );
}
