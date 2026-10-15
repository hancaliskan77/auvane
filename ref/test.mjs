import assert from 'node:assert/strict';
import * as c from './calc.mjs';
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ', name); };

t('reduceKeepMaster keeps 11 and 22, reduces 33 to 6', () => {
  assert.equal(c.reduceKeepMaster(29), 11); // 2+9=11
  assert.equal(c.reduceKeepMaster(38), 11);
  assert.equal(c.reduceKeepMaster(48), 3);  // 12 -> 3
  assert.equal(c.reduceKeepMaster(33), 6); // 33 is not a master here
  assert.equal(c.reduceKeepMaster(9), 9);
});
t('life path: 1993-06-14 = 6 (6 + 5 + 22 = 33 -> 6)', () => assert.equal(c.lifePath(1993, 6, 14), 6));
t('life path: 1990-11-29 = 5 (11 + 11 + 1 = 23 -> 5)', () => assert.equal(c.lifePath(1990, 11, 29), 5));
t('life path: 1996-04-11 = 22 (4 + 11 + 7)', () => assert.equal(c.lifePath(1996, 4, 11), 22));
t('life path: 1992-04-22 = 11 (4 + 22 + 3 = 29)', () => assert.equal(c.lifePath(1992, 4, 22), 11));
t('life path: 1983-05-08 = 7 (5 + 8 + 3 = 16)', () => assert.equal(c.lifePath(1983, 5, 8), 7));
t('life path: 2000-01-01', () => assert.equal(c.lifePath(2000, 1, 1), 4));
t('name numbers: Alex Morgan (47->11, vowels 13->4, consonants 34->7)', () => assert.deepEqual(c.nameNumbers('Alex Morgan'), { expression: 11, soulUrge: 4, personality: 7 }));
t('name ignores accents/punctuation', () => {
  assert.deepEqual(c.nameNumbers('Zoë  O\'Neil'), c.nameNumbers('Zoe ONeil'));
});
t('matrix: 14 Jun 1993 (D=42->20, E=34->12, F=26->4, G=42->20)', () => assert.deepEqual(c.destinyMatrix(1993, 6, 14), { A: 14, B: 6, C: 22, D: 20, E: 12, F: 4, G: 20 }));
t('matrix: day > 22 is reduced (29 -> 7)', () => assert.equal(c.destinyMatrix(1990, 11, 29).A, 7));
t('matrix: all values 1..22', () => {
  for (let y = 1930; y <= 2012; y += 3) for (let m = 1; m <= 12; m++) for (let d = 1; d <= 28; d++) {
    for (const v of Object.values(c.destinyMatrix(y, m, d))) assert.ok(v >= 1 && v <= 22);
  }
});
t('moon phase boundaries', () => {
  assert.equal(c.moonPhase(100, 100).name, 'New Moon');
  assert.equal(c.moonPhase(100, 190).name, 'First Quarter');
  assert.equal(c.moonPhase(100, 280).name, 'Full Moon');
  assert.equal(c.moonPhase(100, 10).name, 'Last Quarter');
  assert.ok(Math.abs(c.moonPhase(100, 280).illumination - 1) < 1e-9);
  assert.ok(Math.abs(c.moonPhase(100, 100).illumination) < 1e-9);
});
t('moon phase wraps 360', () => assert.equal(c.moonPhase(350, 10).elongation, 20));
t('aspects', () => {
  assert.deepEqual(c.aspectBetween(10, 12), { aspect: 'conjunction', off: 2 });
  assert.deepEqual(c.aspectBetween(10, 130), { aspect: 'trine', off: 0 });
  assert.deepEqual(c.aspectBetween(350, 80), { aspect: 'square', off: 0 }); // across 0
  assert.equal(c.aspectBetween(10, 40), null);
  assert.deepEqual(c.aspectBetween(0, 183), { aspect: 'opposition', off: 3 });
});
t('signOf', () => { assert.equal(c.signOf(0), 'Aries'); assert.equal(c.signOf(359.9), 'Pisces'); assert.equal(c.signOf(83), 'Gemini'); });
t('moon phase vs real ephemeris (2026-10-14, 10-26, 11-09)', () => {
  assert.equal(c.moonPhase(200.9, 242.5).name, 'Waxing Crescent');
  assert.equal(c.moonPhase(213.1, 37.5).name, 'Full Moon');
  assert.equal(c.moonPhase(227.1, 229.5).name, 'New Moon');
});
t('sample birth chart signs (ephemeris): Sun 83.38, Moon 17.6, Asc 99.45', () => {
  assert.equal(c.signOf(83.38), 'Gemini');
  assert.equal(c.signOf(17.6), 'Aries');
  assert.equal(c.signOf(99.45), 'Cancer');
  assert.equal(c.moonPhase(83.38, 17.6).name, 'Waning Crescent');
});
t('daily aspects at 12:00 UTC on 2026-10-14 (3 engines agree: Sun 201.16)', () => {
  assert.deepEqual(c.aspectBetween(201.16, 83.38), { aspect: 'trine', off: 2.22 });
  assert.deepEqual(c.aspectBetween(201.16, 17.6), { aspect: 'opposition', off: 3.56 });
  assert.equal(c.signOf(201.16), 'Libra');
  assert.equal(c.moonPhase(201.16, 245.58).name, 'Waxing Crescent');
});
t('Turkish letters: Çağrı Şahin (CAGRI 29 + SAHIN 24 = 53 -> 8; vowels 20 -> 2; consonants 33 -> 6)', () => {
  assert.deepEqual(c.nameNumbers('Çağrı Şahin'), { expression: 8, soulUrge: 2, personality: 6 });
});
console.log(`\n${n} tests passed`);
