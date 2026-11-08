import sample from "@/data/risk-radar.sample.json";
import { parseRisk, type RadarColumn, type RadarRow, type Risk } from "./radar";

/**
 * Where risk rows come from. Until the Risk Radar API is linked this reads the R1043 row
 * from the shared export, stored with the API's exact column names. Swap `loadRows` for
 * the API call; nothing downstream changes.
 */
async function loadRows(): Promise<RadarRow[]> {
  return sample as RadarRow[];
}

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
  const rows = await loadRows();
  let row = rows.find((r) => r["Risk ID"]?.trim().toUpperCase() === id.trim().toUpperCase());
  if (!row) return undefined;
  if (opts.sparse) row = { ...row, ...Object.fromEntries(THIN_COLUMNS.map((c) => [c, null])) };
  return parseRisk(row);
}
