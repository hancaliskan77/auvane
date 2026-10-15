import assert from 'node:assert/strict';
import { chineseZodiac } from '../src/chinese';
let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok  ', name); };
// Spec table (verified with the lunardate library, 14 Oct 2026)
const cases: [number, number, number, string][] = [
  [1993, 6, 14, 'Water Rooster'],
  [1993, 1, 15, 'Water Monkey'],   // before CNY: previous year's animal
  [1993, 1, 22, 'Water Monkey'],
  [1993, 1, 23, 'Water Rooster'],  // Chinese New Year
  [2000, 2, 4, 'Earth Rabbit'],
  [2000, 2, 5, 'Metal Dragon'],
];
for (const [y, m, d, want] of cases) t(`${y}-${m}-${d} = ${want}`, () => assert.equal(chineseZodiac(y, m, d).label, want));
console.log(`\n${n} chinese tests passed`);
