/**
 * npm run db:seed — (re)loads the ACAPS Risk Radar export into the SQLite database.
 * Reads data/risk-radar.csv, or the four sample rows when that file is missing.
 * Links drawn by moderators are kept. Node runs this file directly (built-in type stripping).
 */
import { dataStatus, importFromDisk } from "../lib/db.ts";

const result = importFromDisk();
const status = dataStatus();
console.log(
  `Loaded ${result.risks} risks across ${result.countries} countries from ${result.source}. ` +
    `${status.links} saved link${status.links === 1 ? "" : "s"} kept.`,
);
