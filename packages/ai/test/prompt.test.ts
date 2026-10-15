import assert from 'node:assert/strict';
import { buildFacts, storyPrompt, themePrompt, SYSTEM_PROMPT, THEMES, type ReadingInput } from '../src/prompt';
let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok  ', name); };

const full: ReadingInput = {
  firstName: 'Alex', natal: { sun: 83.38, moon: 17.6, ascendant: 99.45 },
  numerology: { lifePath: 6, expression: 11, soulUrge: 4, personality: 7 }, matrix: { D: 20 },
  humanDesign: { type: 'Manifestor', authority: 'Emotional', profile: '1/3', definition: 'Split' }, chinese: { animal: 'Rooster', element: 'Water' },
};

t('full facts contain every system and the glossary meanings', () => {
  const f = buildFacts(full);
  for (const s of ['Sun in Gemini', 'Moon in Aries', 'Rising sign Cancer', 'Waning Crescent', 'Life Path 6 (care, responsibility, home)',
    'Expression 11 (master number', 'Manifestor (strategy: inform before acting', 'authority Emotional', 'core arcana: 20 Judgement (evaluation, calling, reckoning)', 'Water Rooster']) {
    assert.ok(f.includes(s), `missing: ${s}\n${f}`);
  }
});
t('only the first name is sent, never anything else personal', () => {
  const f = buildFacts(full);
  assert.ok(f.startsWith('First name: Alex\n'));
  assert.ok(!/1993|Brooklyn|Morgan|latitude|\bUTC\b/.test(f));
});
t('unknown birth time: no rising sign and no Human Design at all', () => {
  const f = buildFacts({ ...full, natal: { sun: 83.38, moon: 17.6 }, humanDesign: null });
  assert.ok(!/Rising|Human Design|Manifestor|authority|profile/i.test(f), f);
  assert.ok(f.includes('Sun in Gemini'));
});
t('Destiny Matrix cards 8 and 11 are left out (order unconfirmed)', () => {
  for (const D of [8, 11]) assert.ok(!/Destiny Matrix/.test(buildFacts({ ...full, matrix: { D } })), `card ${D}`);
  assert.ok(/Destiny Matrix/.test(buildFacts({ ...full, matrix: { D: 9 } })));
});
t('theme and story prompts state the length and format; system prompt forbids predictions', () => {
  assert.ok(themePrompt('x', 'Career').includes('50 to 70 words'));
  const s = storyPrompt('x');
  assert.ok(s.includes('600 to 900 words'));
  for (const th of THEMES) assert.ok(s.includes(th));
  for (const r of ['Never predict or promise', 'Never write "you will"', 'medical, legal or financial advice', 'Plain text only', 'ONLY the data provided', 'glossary']) assert.ok(SYSTEM_PROMPT.includes(r), r);
});
console.log(`\n${n} prompt tests passed`);
