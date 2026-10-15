import { moonPhase, signOf } from '../../calc/src/calc';
import { arcanaName } from '../../calc/src/arcana';
import { ARCANA_KEYWORDS, CHINESE_ANIMALS, CHINESE_ELEMENTS, HD_TYPES, NUMEROLOGY, NUMEROLOGY_ROLES } from './meanings';

export const THEMES = ['Personality', 'Relationships', 'Career', 'Spiritual path'] as const;
export type Theme = (typeof THEMES)[number];

export const SYSTEM_PROMPT = `You are a warm, perceptive guide who helps people understand themselves.
You will receive data about ONE person from several systems: Western astrology,
Pythagorean numerology, Human Design, Destiny Matrix, Chinese astrology, and the Moon.
Write ONE blended reading, never one section per system.

Rules:
- Do not list the systems one after another. When two systems point to the same
  trait, say it once. When they disagree, say so honestly ("part of you ... while
  another part ...").
- Speak to the reader as "you". Warm, plain, specific. No jargon unless you explain it.
- Never predict or promise. Use wording like "you tend to" or "you may notice".
  Never write "you will", "you'll" or "you are going to".
- This is self-reflection, not fortune telling. Never give medical, legal or financial advice.
- Use ONLY the data provided. If a field is missing (for example the rising sign when
  the birth time is unknown), do not mention it and do not guess.
- Take meanings only from the glossary lines in the data. For Western astrology you may use
  widely known meanings. Never invent meanings for anything else.
- Plain text only. No markdown, no emojis, no bullet lists, no headings unless the format asks for them.`;

/** What we know about one person. Birth-time-dependent fields are simply absent when the time is unknown. */
export interface ReadingInput {
  firstName: string;
  natal: { sun: number; moon: number; ascendant?: number };
  numerology: { lifePath: number; expression: number; soulUrge: number; personality: number };
  matrix: { D: number };
  humanDesign: { type: string; authority: string; profile: string; definition: string } | null;
  chinese: { animal: string; element: string };
}

/** The data block for the model. Only first name is sent (data minimisation). */
export function buildFacts(i: ReadingInput): string {
  const n = i.numerology;
  const num = (label: string, v: number) => `${label} ${v} (${NUMEROLOGY[v] ?? 'no glossary entry'})`;
  const lines = [
    `First name: ${i.firstName}`,
    `Western astrology: Sun in ${signOf(i.natal.sun)}; Moon in ${signOf(i.natal.moon)}` +
      (i.natal.ascendant !== undefined ? `; Rising sign ${signOf(i.natal.ascendant)}` : ''),
    `Moon phase at birth: ${moonPhase(i.natal.sun, i.natal.moon).name}`,
    `Numerology (${NUMEROLOGY_ROLES}): ${num('Life Path', n.lifePath)}; ${num('Expression', n.expression)}; ${num('Soul Urge', n.soulUrge)}; ${num('Personality', n.personality)}`,
  ];
  if (i.humanDesign) {
    const t = HD_TYPES[i.humanDesign.type];
    lines.push(`Human Design: ${i.humanDesign.type}${t ? ` (strategy: ${t.strategy}; ${t.keywords})` : ''}; authority ${i.humanDesign.authority}; profile ${i.humanDesign.profile}`);
  }
  const kw = ARCANA_KEYWORDS[i.matrix.D - 1];
  const card = arcanaName(i.matrix.D);
  if (kw && card) lines.push(`Destiny Matrix core arcana: ${i.matrix.D} ${card} (${kw})`); // omitted for cards 8 and 11
  lines.push(`Chinese astrology: ${i.chinese.element} ${i.chinese.animal} (${CHINESE_ELEMENTS[i.chinese.element] ?? ''}; ${CHINESE_ANIMALS[i.chinese.animal] ?? ''})`);
  return lines.join('\n');
}

export function themePrompt(facts: string, theme: Theme): string {
  return `Data about the person:\n${facts}\n\nTask: write about the single theme "${theme}" only. Length: 50 to 70 words, one paragraph, no title.`;
}

export function storyPrompt(facts: string): string {
  return `Data about the person:\n${facts}\n\nTask: write the full reading. Length: 600 to 900 words in total. ` +
    `Format: exactly four parts in this order, each starting with its title alone on its own line (${THEMES.join(', ')}), ` +
    `followed by one or two paragraphs of plain text.`;
}
