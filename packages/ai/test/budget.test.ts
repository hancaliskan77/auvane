import assert from 'node:assert/strict';
import { MODEL, canRegenerateStory, checkBudget, costUsd, worstCaseUsd, DEFAULT_DAILY_CAP_USD } from '../src/budget';
let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok  ', name); };
const close = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-9, `${a} vs ${b}`);

t('model id and price (Sonnet 5.5: $2 in / $10 out per MTok)', () => {
  assert.equal(MODEL, 'claude-sonnet-5-5');
  close(costUsd({ input_tokens: 1_000_000, output_tokens: 0 }), 2);
  close(costUsd({ input_tokens: 0, output_tokens: 1_000_000 }), 10);
  close(costUsd({ input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 1_000_000 }), 0.2);
  close(costUsd({ input_tokens: 1200, output_tokens: 1400 }), 0.0164);
});
t('default cap is $10/day', () => assert.equal(DEFAULT_DAILY_CAP_USD, 10));
t('cap: allowed below, blocked at or above, worst case counted', () => {
  assert.deepEqual(checkBudget(5, 10), { allowed: true });
  assert.deepEqual(checkBudget(10.01, 10), { allowed: false, reason: 'daily_cap_reached' });
  assert.deepEqual(checkBudget(9.99, 10, 0.05), { allowed: false, reason: 'daily_cap_reached' });
  assert.deepEqual(checkBudget(9.9, 10, 0.05), { allowed: true });
  assert.ok(worstCaseUsd(2000, 4500) > costUsd({ input_tokens: 2000, output_tokens: 1400 }));
});
t('story regeneration at most once per 7 days', () => {
  assert.equal(canRegenerateStory(null, '2026-10-15'), true);
  assert.equal(canRegenerateStory('2026-10-09', '2026-10-15'), false); // 6 days
  assert.equal(canRegenerateStory('2026-10-08', '2026-10-15'), true);  // 7 days
  assert.equal(canRegenerateStory('2026-12-28', '2027-01-04'), true);  // across the year end
});
console.log(`\n${n} budget tests passed`);
