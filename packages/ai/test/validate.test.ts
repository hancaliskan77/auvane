import assert from 'node:assert/strict';
import { validate, wordCount } from '../src/validate';
let n = 0;
const t = (name: string, fn: () => void) => { fn(); n++; console.log('ok  ', name); };
const words = (k: number, w = 'calm') => Array.from({ length: k }, () => w).join(' ');
const theme = (extra = '') => `You tend to ${words(56)} ${extra}`.trim();
const story = (body: string) => ['Personality', body, '', 'Relationships', body, '', 'Career', body, '', 'Spiritual path', body].join('\n');

t('word counting', () => { assert.equal(wordCount(' a  b\nc '), 3); assert.equal(wordCount(''), 0); });
t('a clean theme passes', () => assert.deepEqual(validate(theme(), 'theme', { timeKnown: true }), { ok: true, problems: [] }));
t('too short and too long themes fail', () => {
  assert.equal(validate(words(20), 'theme', { timeKnown: true }).ok, false);
  assert.equal(validate(words(90), 'theme', { timeKnown: true }).ok, false);
});
t('certain-prediction phrases fail', () => {
  for (const p of ['you will find love', "you'll meet someone", 'you are going to change', 'this will definitely work', 'we guarantee it']) {
    assert.equal(validate(theme(p), 'theme', { timeKnown: true }).ok, false, p);
  }
});
t('markdown and emoji fail', () => {
  for (const p of ['**bold** word', 'a `code` b', 'see [x](http://y)', 'nice ✨']) assert.equal(validate(theme(p), 'theme', { timeKnown: true }).ok, false, p);
  for (const line of ['# Heading', '## Heading', '- bullet', '* bullet', '1. item', '> quote']) {
    assert.equal(validate(`${theme()}\n${line}`, 'theme', { timeKnown: true }).ok, false, line); // line-start markdown
  }
  assert.equal(validate(`# Title\n${theme()}`, 'theme', { timeKnown: true }).ok, false);
});
t('medical / legal / financial advice wording fails', () => {
  for (const p of ['you should invest in stocks', 'ask about a different medication', 'this is legal advice', 'a doctor may diagnose it']) {
    assert.equal(validate(theme(p), 'theme', { timeKnown: true }).ok, false, p);
  }
});
t('unknown birth time: mentioning rising sign or Human Design fails', () => {
  for (const p of ['your rising sign is bold', 'as a Projector you wait', 'your Human Design authority', 'your profile 1/3']) {
    assert.equal(validate(theme(p), 'theme', { timeKnown: false }).ok, false, p);
    assert.equal(validate(theme(p), 'theme', { timeKnown: true }).ok, true, p); // fine when the time IS known
  }
});
t('a theme must be one paragraph', () => assert.equal(validate(`${words(30)}\n\n${words(30)}`, 'theme', { timeKnown: true }).ok, false));
t('story: four titles in order and 600-900 words', () => {
  assert.deepEqual(validate(story(words(190)), 'story', { timeKnown: true }), { ok: true, problems: [] });
  assert.equal(validate(story(words(100)), 'story', { timeKnown: true }).ok, false);
  assert.equal(validate(story(words(300)), 'story', { timeKnown: true }).ok, false);
  const missing = story(words(190)).replace('Career', 'Work');
  assert.ok(validate(missing, 'story', { timeKnown: true }).problems.some((p) => p.includes('Career')));
  const wrongOrder = ['Relationships', words(190), 'Personality', words(190), 'Career', words(190), 'Spiritual path', words(190)].join('\n');
  assert.equal(validate(wrongOrder, 'story', { timeKnown: true }).ok, false);
});
console.log(`\n${n} validate tests passed`);
