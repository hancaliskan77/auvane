import assert from 'node:assert/strict';
import { resolveBirth } from '../src/birth';
let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok  ', name); };
const iso = (d: Date) => d.toISOString();

t('Rize 1991-07-21 02:30 = UTC+3, UTC 07-20 23:30', () => {
  const r = resolveBirth({ year: 1991, month: 7, day: 21, hour: 2, minute: 30, zone: 'Europe/Istanbul' });
  assert.equal(r.status, 'ok');
  if (r.status === 'ok') { assert.equal(r.offsetMinutes, 180); assert.equal(iso(r.utc), '1991-07-20T23:30:00.000Z'); }
});
t('New York 1993-06-14 06:40 = UTC-4 (DST), UTC 10:40', () => {
  const r = resolveBirth({ year: 1993, month: 6, day: 14, hour: 6, minute: 40, zone: 'America/New_York' });
  assert.equal(r.status, 'ok');
  if (r.status === 'ok') { assert.equal(r.offsetMinutes, -240); assert.equal(r.isDst, true); assert.equal(iso(r.utc), '1993-06-14T10:40:00.000Z'); }
});
t('New York 2026-11-01 01:30 is ambiguous (05:30 or 06:30 UTC)', () => {
  const b = { year: 2026, month: 11, day: 1, hour: 1, minute: 30, zone: 'America/New_York' };
  const r = resolveBirth(b);
  assert.equal(r.status, 'ambiguous');
  if (r.status === 'ambiguous') assert.deepEqual(r.options.map((o) => iso(o.utc)), ['2026-11-01T05:30:00.000Z', '2026-11-01T06:30:00.000Z']);
  const f = resolveBirth(b, 'first'), s = resolveBirth(b, 'second');
  assert.ok(f.status === 'ok' && iso(f.utc) === '2026-11-01T05:30:00.000Z');
  assert.ok(s.status === 'ok' && iso(s.utc) === '2026-11-01T06:30:00.000Z');
});
t('New York 2026-03-08 02:30 does not exist', () => {
  assert.equal(resolveBirth({ year: 2026, month: 3, day: 8, hour: 2, minute: 30, zone: 'America/New_York' }).status, 'nonexistent');
});
t('Phoenix summer = UTC-7, no DST', () => {
  const r = resolveBirth({ year: 2026, month: 7, day: 1, hour: 12, minute: 0, zone: 'America/Phoenix' });
  assert.ok(r.status === 'ok' && r.offsetMinutes === -420 && !r.isDst && iso(r.utc) === '2026-07-01T19:00:00.000Z');
});
console.log(`\n${n} birth tests passed`);
