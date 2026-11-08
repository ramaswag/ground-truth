const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/**
 * "2026-11-21" -> "21 Nov 2026"; "2026-03" -> "Mar 2026". A full timestamp keeps only its
 * date. No locale drift between server and client.
 */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  return d ? `${d} ${MONTHS[m - 1]} ${y}` : `${MONTHS[m - 1]} ${y}`;
}

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function plural(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"}`;
}

/**
 * Time left until an ISO date (start of that day, UTC), scaled to a readable unit:
 * hours under 2 days, days under 60 days, months beyond. "2027-05-07" -> "6 months".
 * Returns undefined once the date has passed.
 */
export function formatTimeLeft(iso: string, now: number = Date.now()): string | undefined {
  const [y, m, d = 1] = iso.slice(0, 10).split("-").map(Number);
  const ms = (iso.includes("T") ? Date.parse(iso) : Date.UTC(y, m - 1, d)) - now;
  if (ms <= 0) return undefined;
  if (ms < 2 * DAY) return plural(Math.max(1, Math.round(ms / HOUR)), "hour");
  const days = Math.round(ms / DAY);
  if (days < 60) return plural(days, "day");
  return plural(Math.round(days / 30.44), "month");
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * An answer deadline. Panels span time zones, so a timestamp is said in UTC:
 * "2026-11-09T12:00:00Z" -> "Mon 9 Nov, 12:00 UTC". A bare date falls back to formatDate.
 */
export function formatDeadline(iso: string): string {
  if (!iso.includes("T")) return formatDate(iso);
  const t = new Date(iso);
  const hh = String(t.getUTCHours()).padStart(2, "0");
  const mm = String(t.getUTCMinutes()).padStart(2, "0");
  return `${WEEKDAYS[t.getUTCDay()]} ${t.getUTCDate()} ${MONTHS[t.getUTCMonth()]}, ${hh}:${mm} UTC`;
}
