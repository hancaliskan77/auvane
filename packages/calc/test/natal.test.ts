import assert from 'node:assert/strict';
import { natalPoints, verifyAgainstApi, nearSignBoundary } from '../src/natal';
let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok  ', name); };

// Spec verification table: 1993-06-14 10:40 UTC, Brooklyn -> Sun 83.38, Moon 17.60, Asc 99.45 (3 engines, max 0.005 deg apart)
const p = natalPoints(new Date('1993-06-14T10:40:00Z'), 40.6782, -73.9442);
t('sample birth Sun/Moon/Asc match three-engine reference', () => {
  assert.ok(Math.abs(p.sun - 83.38) < 0.02, `sun ${p.sun}`);
  assert.ok(Math.abs(p.moon - 17.6) < 0.02, `moon ${p.moon}`);
  assert.ok(Math.abs(p.ascendant - 99.45) < 0.1, `asc ${p.ascendant}`);
});
t('verify passes inside tolerance, fails outside', () => {
  assert.equal(verifyAgainstApi(p, { sun: p.sun + 0.4, moon: p.moon - 0.4, ascendant: p.ascendant + 0.9 }).ok, true);
  assert.equal(verifyAgainstApi(p, { sun: p.sun + 0.6, moon: p.moon, ascendant: p.ascendant }).ok, false);
  assert.equal(verifyAgainstApi(p, { sun: p.sun, moon: p.moon, ascendant: p.ascendant + 1.1 }).ok, false);
});
t('unknown birth time ignores Ascendant', () => {
  assert.equal(verifyAgainstApi(p, { sun: p.sun, moon: p.moon, ascendant: p.ascendant + 40 }, false).ok, true);
});
t('wraps around 0/360', () => assert.equal(verifyAgainstApi({ sun: 359.9, moon: 0, ascendant: 0 }, { sun: 0.2, moon: 0 }).ok, true));
t('near sign boundary (2 deg)', () => {
  assert.equal(nearSignBoundary(99.45), false);
  assert.equal(nearSignBoundary(119.0), true);
  assert.equal(nearSignBoundary(90.5), true);
});
console.log(`\n${n} natal tests passed`);
