// Own natal Sun/Moon/Ascendant (tropical, geocentric, true equinox of date) + cross-check vs. an external API.
import * as A from 'astronomy-engine';
import { norm360 } from './calc';

const rad = Math.PI / 180;

export function ascendant(date: Date, latDeg: number, lonDeg: number): number {
  const gst = A.SiderealTime(date); // hours, apparent
  const lst = norm360(gst * 15 + lonDeg) * rad;
  const eps = A.e_tilt(A.MakeTime(date)).tobl * rad; // true obliquity (deg->rad)
  const lat = latDeg * rad;
  const asc = Math.atan2(Math.cos(lst), -(Math.sin(lst) * Math.cos(eps) + Math.tan(lat) * Math.sin(eps)));
  return norm360(asc / rad);
}

export function natalPoints(date: Date, lat: number, lon: number) {
  return {
    sun: norm360(A.SunPosition(date).elon),
    moon: norm360(A.EclipticGeoMoon(date).lon),
    ascendant: ascendant(date, lat, lon),
  };
}

export const TOLERANCE = { sun: 0.5, moon: 0.5, ascendant: 1 } as const;
const diff = (a: number, b: number) => { const d = Math.abs(norm360(a) - norm360(b)); return d > 180 ? 360 - d : d; };

export interface VerifyResult { ok: boolean; diffs: { sun: number; moon: number; ascendant?: number } }

/** Spec rule: Sun/Moon within 0.5°, Ascendant within 1°. Ascendant skipped when birth time unknown. */
export function verifyAgainstApi(
  ours: { sun: number; moon: number; ascendant: number },
  api: { sun: number; moon: number; ascendant?: number },
  timeKnown = true,
): VerifyResult {
  const diffs: VerifyResult['diffs'] = { sun: diff(ours.sun, api.sun), moon: diff(ours.moon, api.moon) };
  let ok = diffs.sun <= TOLERANCE.sun && diffs.moon <= TOLERANCE.moon;
  if (timeKnown && api.ascendant !== undefined) {
    diffs.ascendant = diff(ours.ascendant, api.ascendant);
    ok = ok && diffs.ascendant <= TOLERANCE.ascendant;
  }
  return { ok, diffs };
}

/** Within `deg` of a sign boundary (used for the "not certain" Ascendant note, spec: 2°). */
export function nearSignBoundary(lon: number, deg = 2): boolean {
  const r = norm360(lon) % 30;
  return r < deg || 30 - r < deg;
}
