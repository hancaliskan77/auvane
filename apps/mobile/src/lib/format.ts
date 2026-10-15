const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const monthName = (m: number) => MONTHS[m - 1];

export function fmtTime(hour: number, minute: number) {
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${h12}:${String(minute).padStart(2, '0')} ${hour < 12 ? 'AM' : 'PM'}`;
}
export const fmtDate = (y: number, m: number, d: number) => `${monthName(m)} ${d}, ${y}`;

export function fmtOffset(minutes: number) {
  const sign = minutes < 0 ? '−' : '+';
  const a = Math.abs(minutes), h = Math.floor(a / 60), m = a % 60;
  return `UTC${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`;
}

/** Long zone name on a given instant, e.g. "Eastern Daylight Time". Falls back to the IANA name. */
export function zoneName(utc: Date, tz: string) {
  try {
    const part = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'long' })
      .formatToParts(utc).find((p) => p.type === 'timeZoneName');
    return part?.value ?? tz;
  } catch { return tz; }
}
export function fmtUtc(utc: Date) {
  return `${fmtDate(utc.getUTCFullYear(), utc.getUTCMonth() + 1, utc.getUTCDate())} · ${String(utc.getUTCHours()).padStart(2, '0')}:${String(utc.getUTCMinutes()).padStart(2, '0')}`;
}
