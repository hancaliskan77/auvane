import assert from 'node:assert/strict';
import { generate, type Complete } from '../src/generate';
let n = 0;
const t = async (name: string, fn: () => Promise<void>) => { await fn(); n++; console.log('ok  ', name); };
const words = (k: number) => Array.from({ length: k }, () => 'calm').join(' ');
const good = `You tend to ${words(57)}`;
const bad = `You will ${words(57)}`;
const usage = { input_tokens: 1000, output_tokens: 100 };
const base = { kind: 'theme' as const, system: 's', user: 'u', timeKnown: true, spentTodayUsd: 0, capUsd: 10 };
const seq = (...texts: (string | { refused: true })[]): { complete: Complete; calls: () => number } => {
  let i = 0;
  return { calls: () => i, complete: async () => { const x = texts[Math.min(i++, texts.length - 1)]; return typeof x === 'string' ? { text: x, usage } : { text: '', usage, refused: true }; } };
};

await t('good text passes on the first try', async () => {
  const s = seq(good);
  const r = await generate({ ...base, complete: s.complete });
  assert.ok(r.ok && r.attempts === 1 && s.calls() === 1);
});
await t('first attempt fails the check, retry passes (spec: one retry)', async () => {
  const s = seq(bad, good);
  const r = await generate({ ...base, complete: s.complete });
  assert.ok(r.ok && r.attempts === 2 && s.calls() === 2);
});
await t('fails twice: reported, nothing is accepted, no third call', async () => {
  const s = seq(bad, bad, good);
  const r = await generate({ ...base, complete: s.complete });
  assert.ok(!r.ok && r.reason === 'failed_validation' && s.calls() === 2 && r.problems?.length);
});
await t('daily cap reached: no model call at all', async () => {
  const s = seq(good);
  const r = await generate({ ...base, spentTodayUsd: 10, complete: s.complete });
  assert.ok(!r.ok && r.reason === 'daily_cap_reached' && s.calls() === 0 && r.costUsd === 0);
});
await t('cap is re-checked before the retry: an expensive first call that fills the day blocks the retry', async () => {
  let calls = 0;
  const pricey: Complete = async () => { calls++; return { text: bad, usage: { input_tokens: 100_000, output_tokens: 40_000 } }; }; // $0.60, fails the check
  const r = await generate({ ...base, spentTodayUsd: 9.5, capUsd: 10, complete: pricey });
  assert.ok(!r.ok && r.reason === 'daily_cap_reached' && calls === 1 && Math.abs(r.costUsd - 0.6) < 1e-9);
});
await t('a refusal from the model is surfaced, not retried', async () => {
  const s = seq({ refused: true }, good);
  const r = await generate({ ...base, complete: s.complete });
  assert.ok(!r.ok && r.reason === 'refused' && s.calls() === 1);
});
await t('cost of every attempt is counted', async () => {
  const r = await generate({ ...base, complete: seq(bad, good).complete });
  assert.ok(r.ok && Math.abs(r.costUsd - 2 * (1000 * 2 + 100 * 10) / 1e6) < 1e-12);
});
await t('simulated day: realistic calls, spending never goes over the cap', async () => {
  let spent = 0, generated = 0;
  const realistic: Complete = async () => ({ text: good, usage: { input_tokens: 1500, output_tokens: 1400 } }); // ~$0.017 per theme
  for (let i = 0; i < 2000; i++) {
    const r = await generate({ ...base, spentTodayUsd: spent, capUsd: 10, approxInputTokens: 1500, complete: realistic });
    spent += r.costUsd;
    if (r.ok) generated++; else { assert.equal(r.reason, 'daily_cap_reached'); break; }
  }
  assert.ok(spent <= 10, `spent ${spent}`);
  assert.ok(generated > 550 && generated < 600, `generated ${generated}`); // $10 / $0.017 = ~588 texts
});
console.log(`\n${n} generate tests passed`);
