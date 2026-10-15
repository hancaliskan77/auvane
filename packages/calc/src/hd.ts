// Human Design chart from a UTC birth moment. Depends on astronomy-engine (MIT).
import * as A from 'astronomy-engine';
import { norm360 as n360 } from './calc';
const rad = Math.PI / 180;
export const WHEEL = [41,19,13,49,30,55,37,63,22,36,25,17,21,51,42,3,27,24,2,23,8,20,16,35,45,12,15,52,39,53,62,56,31,33,7,4,29,59,40,64,47,6,46,18,48,57,32,50,28,44,1,43,14,34,9,5,26,11,10,58,38,54,61,60];
const START = 302; // 2 deg Aquarius = start of gate 41
export function activation(lon: number) {
  const x = n360(lon - START) / 5.625;
  return { gate: WHEEL[Math.floor(x)], line: Math.floor((x % 1) * 6) + 1 };
}
function trueNode(date: Date): number {
  const T = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 86400000 / 36525;
  const mean = 125.04452 - 1934.136261 * T;
  const D = 297.8501921 + 445267.1114034 * T, M = 357.5291092 + 35999.0502909 * T,
    F = 93.272095 + 483202.0175233 * T, L = 218.3164477 + 481267.88123421 * T;
  return n360(mean + (-1.4979 * Math.sin(2 * (D - F) * rad) - 0.15 * Math.sin(M * rad)
    - 0.1226 * Math.sin(2 * D * rad) + 0.1176 * Math.sin(2 * F * rad) - 0.0801 * Math.sin(2 * (L - F) * rad)));
}
const PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
function longitudes(date: Date): Record<string, number> {
  const o: Record<string, number> = { Sun: A.SunPosition(date).elon, Moon: A.EclipticGeoMoon(date).lon };
  for (const b of PLANETS) {
    const e = A.RotateVector(A.Rotation_EQJ_ECT(date), A.GeoVector(b as A.Body, date, true));
    o[b] = n360(Math.atan2(e.y, e.x) / rad);
  }
  o.NorthNode = trueNode(date);
  o.Earth = n360(o.Sun + 180);
  o.SouthNode = n360(o.NorthNode + 180);
  return o;
}
export function designMoment(birth: Date): Date {          // Sun exactly 88 degrees earlier on the ecliptic
  const target = n360(A.SunPosition(birth).elon - 88);
  let lo = birth.getTime() - 100 * 864e5, hi = birth.getTime() - 80 * 864e5;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (n360(A.SunPosition(new Date(mid)).elon - target) > 180) lo = mid; else hi = mid;
  }
  return new Date((lo + hi) / 2);
}
const CENTERS: Record<string, number[]> = { Head: [64,61,63], Ajna: [47,24,4,17,43,11], Throat: [62,23,56,35,12,45,33,8,31,20,16],
  G: [1,13,25,46,2,15,10,7], Heart: [21,40,26,51], Spleen: [48,57,44,50,32,28,18],
  Sacral: [5,14,29,59,9,3,42,27,34], SolarPlexus: [36,22,37,6,49,55,30], Root: [53,60,52,19,39,41,58,38,54] };
const CHANNELS: [number, number][] = [[1,8],[2,14],[3,60],[4,63],[5,15],[6,59],[7,31],[9,52],[10,20],[10,34],[10,57],[11,56],[12,22],[13,33],[16,48],[17,62],[18,58],[19,49],[20,34],[20,57],[21,45],[23,43],[24,61],[25,51],[26,44],[27,50],[28,38],[29,46],[30,41],[32,54],[34,57],[35,36],[37,40],[39,55],[42,53],[47,64]];
const centerOf = (g: number): string => Object.keys(CENTERS).find((c) => CENTERS[c].includes(g))!;
export function analyze(gates: number[]) {
  const on = new Set(gates);
  const chans = CHANNELS.filter(([a, b]) => on.has(a) && on.has(b));
  const defined = new Set<string>();
  chans.forEach(([a, b]) => { defined.add(centerOf(a)); defined.add(centerOf(b)); });
  const adj: Record<string, Set<string>> = {}; defined.forEach((c) => (adj[c] = new Set()));
  chans.forEach(([a, b]) => { const x = centerOf(a), y = centerOf(b); adj[x].add(y); adj[y].add(x); });
  const seen = new Set<string>(), comp: Record<string, number> = {}; let comps = 0;
  for (const c of defined) {
    if (seen.has(c)) continue; comps++;
    const st: string[] = [c];
    while (st.length) { const v = st.pop()!; if (seen.has(v)) continue; seen.add(v); comp[v] = comps; adj[v].forEach((w) => st.push(w)); }
  }
  const motors = ['Sacral', 'SolarPlexus', 'Heart', 'Root'];
  const motorToThroat = defined.has('Throat') && motors.some((m) => defined.has(m) && comp[m] === comp.Throat);
  const type = defined.size === 0 ? 'Reflector'
    : defined.has('Sacral') ? (motorToThroat ? 'Manifesting Generator' : 'Generator')
    : (motorToThroat ? 'Manifestor' : 'Projector');
  const authority = defined.has('SolarPlexus') ? 'Emotional' : defined.has('Sacral') ? 'Sacral'
    : defined.has('Spleen') ? 'Splenic' : defined.has('Heart') ? 'Ego'
    : (defined.has('G') && comp.G === comp.Throat) ? 'Self-projected' : defined.size ? 'Mental' : 'Lunar';
  const definition = defined.size ? ['Single', 'Split', 'Triple Split', 'Quadruple Split'][comps - 1] : 'None';
  return { type, authority, definition, definedCenters: [...defined].sort(), channels: chans.map((c) => c.join('-')) };
}
export function humanDesign(birthUtc: Date) {
  const P = longitudes(birthUtc), D = longitudes(designMoment(birthUtc));
  const side = (L: Record<string, number>): Record<string, string> => Object.fromEntries(Object.keys(L).map((k) => { const a = activation(L[k]); return [k, `${a.gate}.${a.line}`]; }));
  const personality = side(P), design = side(D);
  const gates = [...Object.values(personality), ...Object.values(design)].map((s) => Number(s.split('.')[0]));
  const profile = `${personality.Sun.split('.')[1]}/${design.Sun.split('.')[1]}`;
  const g = (s: string) => s.split('.')[0];
  return { personality, design, profile, cross: `${g(personality.Sun)}/${g(personality.Earth)} | ${g(design.Sun)}/${g(design.Earth)}`, ...analyze(gates) };
}
