import { countryRows, riskRow, riskRows, riskRowsIn, splitCountries } from "./db";
import { parseRisk, type RadarColumn, type RadarRow, type Risk } from "./radar";

/**
 * Where risk records come from: the SQLite database (lib/db.ts), filled from the ACAPS Risk
 * Radar export with `npm run db:seed` or the moderator's Data page. Rows keep the API's
 * exact column names, so switching to the Risk Radar API later only changes lib/db.ts.
 */

/**
 * Columns filled for fewer than 80% of the 139 risks in the export. `?demo=sparse` blanks
 * them so the page can be checked against a typical thin record.
 */
const THIN_COLUMNS: RadarColumn[] = [
  "Risk trend",
  "Triggers",
  "Rationale update",
  "Expected priority needs",
  "What materialised?",
  "Hazard materialisation",
  "Materialisation sources",
  "Current vulnerability / Coping capacities sources",
  "Expected impact",
  "Expected impact sources",
  "Impact materialisation description",
];

export async function getRisk(id: string, opts: { sparse?: boolean } = {}): Promise<Risk | undefined> {
  let row = riskRow(id) as RadarRow | undefined;
  if (!row) return undefined;
  if (opts.sparse) row = { ...row, ...Object.fromEntries(THIN_COLUMNS.map((c) => [c, null])) };
  return parseRisk(row);
}

const parsed = (rows: Record<string, string | null>[]) =>
  rows.map((r) => parseRisk(r as RadarRow)).filter((r): r is Risk => r !== undefined);

/** Every risk in the export, parsed. */
export async function allRisks(): Promise<Risk[]> {
  return parsed(riskRows());
}

/** Risks that cover a country, by ISO code. */
export async function risksIn(iso: string): Promise<Risk[]> {
  return parsed(riskRowsIn(iso));
}

export type Country = { iso: string; name: string; risks: number };

export async function listCountries(): Promise<Country[]> {
  return countryRows();
}

export function countriesOf(risk: Pick<Risk, "iso" | "country">): { iso: string; name: string }[] {
  return splitCountries(risk.iso, risk.country);
}
