import assert from 'node:assert/strict';
import { skyAt, daysFrom } from '../src/sky';
import { dailySentence, DAILY_PHASES, DAILY_SIGNS } from '../src/daily';
import { moonPhase, signOf } from '../src/calc';
let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok  ', name); };

t('sky at 12:00 UTC 2026-10-14 matches the three-engine reference (Sun 201.16, Moon 245.58)', () => {
  const s = skyAt('2026-10-14');
  assert.ok(Math.abs(s.Sun - 201.16) < 0.02, `sun ${s.Sun}`);
  assert.ok(Math.abs(s.Moon - 245.58) < 0.05, `moon ${s.Moon}`);
  assert.equal(moonPhase(s.Sun, s.Moon).name, 'Waxing Crescent');
});
t('sky has all bodies, longitudes in [0,360)', () => {
  const s = skyAt('2026-10-14');
  assert.equal(Object.keys(s).length, 10);
  for (const v of Object.values(s)) assert.ok(v >= 0 && v < 360);
});
t('daysFrom gives consecutive days across month/year ends', () => {
  assert.deepEqual(daysFrom('2026-10-14', 4), ['2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17']);
  assert.deepEqual(daysFrom('2026-12-30', 3), ['2026-12-30', '2026-12-31', '2027-01-01']);
});
t('daily sentence is deterministic and follows the output rules', () => {
  const s = skyAt('2026-10-14');
  assert.equal(dailySentence(s), dailySentence(skyAt('2026-10-14')));
  assert.equal(dailySentence(s), 'The Moon is growing, a good time to begin; with the Moon in Sagittarius, aim at something bigger than today\'s worries.');
});
t('across the whole zodiac and all phases: one sentence, no markdown, no "you will", <= 40 words', () => {
  const phases = new Set<string>(), signs = new Set<string>();
  assert.equal(DAILY_PHASES.length, 8); assert.equal(DAILY_SIGNS.length, 12);
  for (let sun = 0; sun < 360; sun += 15) for (let moon = 0; moon < 360; moon += 5) {
    const text = dailySentence({ Sun: sun, Moon: moon });
    phases.add(moonPhase(sun, moon).name); signs.add(signOf(moon));
    assert.ok(!/[*_#`>\[\]]/.test(text), text);
    assert.ok(!/you will/i.test(text), text);
    assert.ok(text.split(/\s+/).length <= 40, text);
    assert.equal((text.match(/\./g) ?? []).length, 1, text);
    assert.ok(text.includes(`Moon in ${signOf(moon)}`), text);
  }
  assert.equal(phases.size, 8); assert.equal(signs.size, 12);
});
console.log(`\n${n} sky tests passed`);
