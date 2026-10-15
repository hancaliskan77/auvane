// Shared daily sky: ecliptic longitudes of the main bodies at 12:00 UTC of a calendar day (spec: same sky for everyone).
import { longitudes } from './hd';

export const SKY_BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'] as const;
export type Sky = Record<(typeof SKY_BODIES)[number], number>;

/** day = 'YYYY-MM-DD' (the user's local calendar date). */
export function skyAt(day: string): Sky {
  const [y, m, d] = day.split('-').map(Number);
  if (!y || !m || !d) throw new Error(`Bad day: ${day}`);
  const all = longitudes(new Date(Date.UTC(y, m - 1, d, 12, 0, 0)));
  return Object.fromEntries(SKY_BODIES.map((b) => [b, Math.round(all[b] * 1e4) / 1e4])) as Sky;
}

/** n consecutive calendar days starting at `from` (UTC arithmetic, so no DST surprises). */
export function daysFrom(from: string, n: number): string[] {
  const [y, m, d] = from.split('-').map(Number);
  return Array.from({ length: n }, (_, i) => new Date(Date.UTC(y, m - 1, d + i)).toISOString().slice(0, 10));
}
