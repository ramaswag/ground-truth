/**
 * The local SQLite database, through Node's built-in `node:sqlite` (no package to install).
 * It holds the Risk Radar export and the links moderators draw between risks.
 *
 * Server only: never import this from a "use client" file. It is also run directly by Node
 * from scripts/seed.ts, which is why its one local import carries the .ts extension.
 *
 * The file is data/ground-truth.db (git-ignored). If it is empty on first use, it fills
 * itself from data/risk-radar.csv (or data/risk-radar-export.csv), or from data/risk-radar.sample.json when the CSV is
 * missing, so the app runs without a seed step.
 */

import { DatabaseSync } from "node:sqlite";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { csvToRecords } from "./csv.ts";

const ROOT = process.cwd();
/**
 * Locally the database sits in data/. On Vercel the project folder is read-only, so it goes
 * in /tmp instead: rebuilt from the CSV whenever a new server starts, which means links drawn
 * there do not last. Fine for a demo; a hosted database would fix it.
 */
const DB_PATH =
  process.env.GROUND_TRUTH_DB ?? (process.env.VERCEL ? "/tmp/ground-truth.db" : join(ROOT, "data", "ground-truth.db"));
/** The export, under either name it tends to arrive with. */
const CSV_PATHS = ["risk-radar.csv", "risk-radar-export.csv"].map((f) => join(ROOT, "data", f));
const SAMPLE_PATH = join(ROOT, "data", "risk-radar.sample.json");

const SCHEMA = `
CREATE TABLE IF NOT EXISTS risks (
  id       TEXT PRIMARY KEY,
  title    TEXT NOT NULL,
  iso      TEXT NOT NULL DEFAULT '',
  country  TEXT NOT NULL DEFAULT '',
  status   TEXT,
  row_json TEXT NOT NULL            -- the whole export row, under the API's column names
);
CREATE TABLE IF NOT EXISTS risk_countries (
  risk_id TEXT NOT NULL,
  iso     TEXT NOT NULL,
  name    TEXT NOT NULL,
  PRIMARY KEY (risk_id, iso)
);
CREATE INDEX IF NOT EXISTS risk_countries_iso ON risk_countries (iso);
CREATE TABLE IF NOT EXISTS links (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  iso        TEXT NOT NULL,         -- the country workspace it was drawn in
  from_id    TEXT NOT NULL,         -- the risk that drives
  to_id      TEXT NOT NULL,         -- the risk it leads to
  horizon    TEXT NOT NULL,         -- "3 months", "6 months", "12 months"
  created_at TEXT NOT NULL,
  UNIQUE (iso, from_id, to_id)
);
CREATE TABLE IF NOT EXISTS imports (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  at     TEXT NOT NULL,
  source TEXT NOT NULL,
  risks  INTEGER NOT NULL
);
`;

type Row = Record<string, string | null>;

/** node:sqlite returns null-prototype rows; React only passes plain objects to the browser. */
const plain = <T extends object>(rows: unknown[]): T[] => rows.map((r) => ({ ...(r as T) }));

// One connection per server process; kept on globalThis so dev reloads do not open more.
const g = globalThis as unknown as { __groundTruthDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  if (g.__groundTruthDb) return g.__groundTruthDb;
  mkdirSync(dirname(DB_PATH), { recursive: true });
  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  g.__groundTruthDb = db;
  const { n } = db.prepare("SELECT COUNT(*) AS n FROM risks").get() as { n: number };
  if (!n) importFromDisk(db);
  return db;
}

/* --------------------------------------------------------------- countries */

/**
 * The countries a risk covers. A risk can cover several ("TCD, NER, CMR, NGA" with
 * "Chad, Niger, Cameroon, Nigeria"); the two lists line up by position.
 */
export function splitCountries(iso: string, country: string): { iso: string; name: string }[] {
  const isos = iso.split(",").map((s) => s.trim().toUpperCase()).filter(Boolean);
  const names = country.split(",").map((s) => s.trim());
  return isos.map((code, i) => ({ iso: code, name: isos.length === names.length ? names[i] : code }));
}

/* ------------------------------------------------------------------ import */

const clean = (v: string | null | undefined) => (v ?? "").replace(/\s+/g, " ").trim();

export type ImportResult = { risks: number; countries: number };

/**
 * Replaces every risk with the rows given. Links drawn by moderators are kept; a link whose
 * risk is no longer in the export simply stops showing.
 */
export function importRecords(db: DatabaseSync, rows: Row[], source: string): ImportResult {
  const usable = rows.filter((r) => clean(r["Risk ID"]) && clean(r["Risk Title"]));
  if (!usable.length) throw new Error("No rows with a Risk ID and a Risk Title.");

  const putRisk = db.prepare(
    "INSERT OR REPLACE INTO risks (id, title, iso, country, status, row_json) VALUES (?, ?, ?, ?, ?, ?)",
  );
  const putCountry = db.prepare("INSERT OR REPLACE INTO risk_countries (risk_id, iso, name) VALUES (?, ?, ?)");

  db.exec("BEGIN");
  try {
    db.exec("DELETE FROM risk_countries; DELETE FROM risks;");
    for (const r of usable) {
      const id = clean(r["Risk ID"]).toUpperCase();
      const iso = clean(r["ISO"]);
      const country = clean(r["Country"]);
      putRisk.run(id, clean(r["Risk Title"]), iso, country, clean(r["Status"]) || null, JSON.stringify(r));
      for (const c of splitCountries(iso, country)) putCountry.run(id, c.iso, c.name);
    }
    db.prepare("INSERT INTO imports (at, source, risks) VALUES (?, ?, ?)").run(
      new Date().toISOString(),
      source,
      usable.length,
    );
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
  const { n } = db.prepare("SELECT COUNT(DISTINCT iso) AS n FROM risk_countries").get() as { n: number };
  return { risks: usable.length, countries: n };
}

/** A Risk Radar CSV export, checked for the columns the app needs. */
export function importCsvText(text: string, source: string): ImportResult {
  const rows = csvToRecords(text);
  const header = Object.keys(rows[0] ?? {});
  for (const need of ["Risk ID", "Risk Title", "ISO", "Country"]) {
    if (!header.includes(need)) throw new Error(`This does not look like a Risk Radar export: no "${need}" column.`);
  }
  return importRecords(getDb(), rows, source);
}

/** The CSV in data/ if it is there, the four sample rows otherwise. */
export function importFromDisk(db: DatabaseSync = getDb()): ImportResult & { source: string } {
  const csv = CSV_PATHS.find((p) => existsSync(p));
  if (csv) {
    const source = `data/${basename(csv)}`;
    return { ...importRecords(db, csvToRecords(readFileSync(csv, "utf8")), source), source };
  }
  const rows = JSON.parse(readFileSync(SAMPLE_PATH, "utf8")) as Row[];
  return { ...importRecords(db, rows, "data/risk-radar.sample.json"), source: "data/risk-radar.sample.json" };
}

/* ------------------------------------------------------------------- reads */

export function riskRows(): Row[] {
  return (getDb().prepare("SELECT row_json FROM risks ORDER BY id").all() as { row_json: string }[]).map(
    (r) => JSON.parse(r.row_json) as Row,
  );
}

export function riskRowsIn(iso: string): Row[] {
  const rows = getDb()
    .prepare(
      "SELECT r.row_json FROM risks r JOIN risk_countries c ON c.risk_id = r.id WHERE c.iso = ? ORDER BY r.id",
    )
    .all(iso.toUpperCase()) as { row_json: string }[];
  return rows.map((r) => JSON.parse(r.row_json) as Row);
}

export function riskRow(id: string): Row | undefined {
  const r = getDb().prepare("SELECT row_json FROM risks WHERE id = ?").get(id.trim().toUpperCase()) as
    | { row_json: string }
    | undefined;
  return r && (JSON.parse(r.row_json) as Row);
}

export function countryRows(): { iso: string; name: string; risks: number }[] {
  return plain<{ iso: string; name: string; risks: number }>(
    getDb()
      .prepare("SELECT iso, MIN(name) AS name, COUNT(*) AS risks FROM risk_countries GROUP BY iso ORDER BY name")
      .all(),
  );
}

export type DataStatus = { risks: number; countries: number; links: number; lastImport?: { at: string; source: string } };

export function dataStatus(): DataStatus {
  const db = getDb();
  const one = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  const last = db.prepare("SELECT at, source FROM imports ORDER BY id DESC LIMIT 1").get() as
    | { at: string; source: string }
    | undefined;
  return {
    risks: one("SELECT COUNT(*) AS n FROM risks"),
    countries: one("SELECT COUNT(DISTINCT iso) AS n FROM risk_countries"),
    links: one("SELECT COUNT(*) AS n FROM links"),
    lastImport: last && { at: last.at, source: last.source },
  };
}

/* ------------------------------------------------------------------- links */

export type LinkRow = { id: number; iso: string; from_id: string; to_id: string; horizon: string };

export const HORIZONS = ["3 months", "6 months", "12 months"] as const;

/** Links drawn in a country's workspace, both of whose risks are still in the export. */
export function linksIn(iso: string): LinkRow[] {
  const rows = getDb()
    .prepare(
      `SELECT l.id, l.iso, l.from_id, l.to_id, l.horizon FROM links l
       WHERE l.iso = ?
         AND EXISTS (SELECT 1 FROM risks WHERE id = l.from_id)
         AND EXISTS (SELECT 1 FROM risks WHERE id = l.to_id)
       ORDER BY l.id`,
    )
    .all(iso.toUpperCase());
  return plain<LinkRow>(rows);
}

export function addLink(iso: string, from: string, to: string, horizon: string): LinkRow {
  const db = getDb();
  const code = iso.toUpperCase();
  if (from === to) throw new Error("A risk cannot lead to itself.");
  if (!(HORIZONS as readonly string[]).includes(horizon)) throw new Error("Unknown time window.");
  const inCountry = db.prepare("SELECT 1 FROM risk_countries WHERE risk_id = ? AND iso = ?");
  if (!inCountry.get(from, code) || !inCountry.get(to, code)) throw new Error("Both risks must be in this country.");
  db.prepare(
    `INSERT INTO links (iso, from_id, to_id, horizon, created_at) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT (iso, from_id, to_id) DO UPDATE SET horizon = excluded.horizon`,
  ).run(code, from, to, horizon, new Date().toISOString());
  const row = db.prepare("SELECT id, iso, from_id, to_id, horizon FROM links WHERE iso = ? AND from_id = ? AND to_id = ?").get(code, from, to);
  return plain<LinkRow>([row])[0];
}

export function removeLink(id: number): boolean {
  return getDb().prepare("DELETE FROM links WHERE id = ?").run(id).changes > 0;
}
