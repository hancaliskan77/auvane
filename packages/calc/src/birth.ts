// Resolve a local birth date/time + IANA zone into a UTC instant.
// Uses the zone's rules for that date (never a fixed per-city offset).
import { DateTime } from 'luxon';

export type BirthResolution =
  | { status: 'ok'; utc: Date; offsetMinutes: number; zone: string; isDst: boolean }
  | { status: 'ambiguous'; options: { utc: Date; offsetMinutes: number; isDst: boolean }[]; zone: string }
  | { status: 'nonexistent'; zone: string };

export interface LocalBirth {
  year: number; month: number; day: number; hour: number; minute: number; zone: string;
}

export function resolveBirth(b: LocalBirth, choice?: 'first' | 'second'): BirthResolution {
  const { year, month, day, hour, minute, zone } = b;
  const dt = DateTime.fromObject({ year, month, day, hour, minute }, { zone });
  if (!dt.isValid) throw new Error(`Invalid birth date/time or zone: ${dt.invalidExplanation}`);
  // Luxon shifts a non-existent local time forward; detect by comparing fields.
  if (dt.hour !== hour || dt.minute !== minute || dt.day !== day) return { status: 'nonexistent', zone };

  // Ambiguous when the same wall-clock time occurs at two offsets (clocks went back).
  const before = dt.minus({ hours: 3 }), after = dt.plus({ hours: 3 });
  const offsets = new Set([before.offset, dt.offset, after.offset]);
  const candidates: DateTime[] = [];
  for (const off of offsets) {
    const utcMs = Date.UTC(year, month - 1, day, hour, minute) - off * 60000;
    const c = DateTime.fromMillis(utcMs, { zone });
    if (c.offset === off && c.hour === hour && c.minute === minute && c.day === day) candidates.push(c);
  }
  candidates.sort((x, y) => x.toMillis() - y.toMillis());
  const mk = (c: DateTime) => ({ utc: c.toJSDate(), offsetMinutes: c.offset, isDst: c.isInDST });
  if (candidates.length > 1) {
    if (!choice) return { status: 'ambiguous', options: candidates.map(mk), zone };
    return { status: 'ok', ...mk(candidates[choice === 'first' ? 0 : 1]), zone };
  }
  return { status: 'ok', ...mk(dt), zone };
}
