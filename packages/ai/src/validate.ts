import { THEMES } from './prompt';

export type Kind = 'theme' | 'story';
export const LIMITS: Record<Kind, [number, number]> = { theme: [50, 70], story: [600, 900] };

export const wordCount = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

const CERTAIN = /\byou will\b|\byou'll\b|\byou are going to\b|\byou're going to\b|\bwill definitely\b|\bguarantee[ds]?\b/i;
const ADVICE = /\b(diagnos\w*|prescri\w*|medicat\w*|dosage|medical advice|legal advice|financial advice|invest(?:ing|ment|ments)?|stocks?|lawsuit)\b/i;
const MARKDOWN = /(\*\*|__|^#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s|`|^>\s|\[[^\]]+\]\([^)]+\)|\|.*\|)/m;
const EMOJI = /\p{Extended_Pictographic}/u;
// Words that betray birth-time-dependent data; must never appear when the birth time is unknown.
const TIME_DEPENDENT = /\b(rising|ascendant|human design|manifestor|projector|generator|reflector|authority|profile)\b/i;

export interface Check { ok: boolean; problems: string[] }

export function validate(text: string, kind: Kind, opts: { timeKnown: boolean }): Check {
  const problems: string[] = [];
  const [min, max] = LIMITS[kind];
  const words = wordCount(text);
  if (words < min || words > max) problems.push(`word count ${words} outside ${min}-${max}`);
  if (MARKDOWN.test(text)) problems.push('contains markdown');
  if (EMOJI.test(text)) problems.push('contains emoji');
  if (CERTAIN.test(text)) problems.push('contains a certain-prediction phrase');
  if (ADVICE.test(text)) problems.push('contains medical/legal/financial advice wording');
  if (!opts.timeKnown && TIME_DEPENDENT.test(text)) problems.push('mentions birth-time-dependent data that was not provided');
  if (kind === 'theme' && /\n\s*\n/.test(text.trim())) problems.push('theme must be one paragraph');
  if (kind === 'story') {
    const lines = text.split('\n').map((l) => l.trim());
    let at = -1;
    for (const title of THEMES) {
      const idx = lines.findIndex((l, i) => i > at && l.toLowerCase() === title.toLowerCase());
      if (idx < 0) { problems.push(`missing or misplaced title "${title}"`); break; }
      at = idx;
    }
  }
  return { ok: problems.length === 0, problems };
}
