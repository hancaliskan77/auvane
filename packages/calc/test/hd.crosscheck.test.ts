// Independent cross-check, NOT Jovian ground truth.
// Expected values below were produced by our code and agreed with a second, independent MIT engine
// (npm `free-human-design`, 15 Oct 2026) on type, authority, defined centers/channels and profile.
// Known difference: that engine's wheel is ~0.04 deg offset, so lines differ when a planet sits within
// 0.04 deg of a line boundary. On the Jovian-verified chart (Design Venus 16.4) OUR value matches Jovian
// and theirs (16.3) does not, so ours is the one kept. Case 1 below (Personality Sun 38.5) is such a boundary case.
// Step 1 still needs real Jovian charts for these births (see CLAUDE.md).
import assert from 'node:assert/strict';
import { humanDesign, resolveBirth } from '../src/index';

const NY = 'America/New_York';
const cases = [
  { d: [1985, 1, 3], type: 'Manifestor', authority: 'Splenic', definition: 'Single', profile: '5/1', channels: '1-8 10-20 10-57 20-57 28-38' },
  { d: [1985, 1, 21], type: 'Projector', authority: 'Splenic', definition: 'Split', profile: '6/2', channels: '1-8 28-38' },
  { d: [1990, 11, 3], type: 'Reflector', authority: 'Lunar', definition: 'None', profile: '4/6', channels: '' },
  { d: [1985, 1, 15], type: 'Manifesting Generator', authority: 'Sacral', definition: 'Split', profile: '6/2', channels: '1-8 10-34 28-38' },
];
for (const c of cases) {
  const r = resolveBirth({ year: c.d[0], month: c.d[1], day: c.d[2], hour: 12, minute: 0, zone: NY });
  assert.equal(r.status, 'ok');
  if (r.status !== 'ok') continue;
  const h = humanDesign(r.utc);
  assert.equal(h.type, c.type, `${c.d} type`);
  assert.equal(h.authority, c.authority, `${c.d} authority`);
  assert.equal(h.definition, c.definition, `${c.d} definition`);
  assert.equal(h.profile, c.profile, `${c.d} profile`);
  assert.equal(h.channels.join(' '), c.channels, `${c.d} channels`);
}
console.log('HD cross-check (independent engine, not Jovian): 4 births, all four types OK');
