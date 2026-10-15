// Meaning glossary handed to the model so every user gets the same meaning for the same number (spec: "Anlam sözlüğü").
// Western astrology is left to the model's general knowledge (spec). Destiny Matrix cards 8 and 11 are
// deliberately absent: their order (Justice/Strength) is unconfirmed, so no meaning is given for them.

export const NUMEROLOGY: Record<number, string> = {
  1: 'independence, leadership, initiative', 2: 'cooperation, sensitivity, harmony', 3: 'expression, creativity, sociability',
  4: 'stability, hard work, order', 5: 'freedom, change, curiosity', 6: 'care, responsibility, home',
  7: 'analysis, solitude, inward research', 8: 'ambition, power, material mastery', 9: 'compassion, completion, idealism',
  11: 'master number: intuition, inspiration, high sensitivity', 22: 'master number: building big things, practical vision',
};

export const NUMEROLOGY_ROLES = 'Life Path = main life lesson, Expression = talents, Soul Urge = inner drive, Personality = the face shown to others.';

export const HD_TYPES: Record<string, { strategy: string; keywords: string }> = {
  Manifestor: { strategy: 'inform before acting', keywords: 'initiator, independent' },
  Generator: { strategy: 'respond', keywords: 'sustainable energy, productivity' },
  'Manifesting Generator': { strategy: 'respond, then inform', keywords: 'multi-passionate, fast' },
  Projector: { strategy: 'wait for the invitation', keywords: 'guide, observer' },
  Reflector: { strategy: 'wait a lunar cycle', keywords: 'mirror, sensitive to surroundings' },
};

export const CHINESE_ANIMALS: Record<string, string> = {
  Rat: 'resourceful, quick', Ox: 'solid, hard-working', Tiger: 'brave, independent', Rabbit: 'gentle, diplomatic',
  Dragon: 'confident, charismatic', Snake: 'thoughtful, intuitive', Horse: 'energetic, freedom-loving', Goat: 'creative, empathic',
  Monkey: 'clever, playful', Rooster: 'meticulous, outspoken, hard-working', Dog: 'loyal, honest', Pig: 'generous, easygoing',
};
export const CHINESE_ELEMENTS: Record<string, string> = {
  Wood: 'growth', Fire: 'passion', Earth: 'steadiness', Metal: 'discipline', Water: 'adaptability, depth',
};

/** Destiny Matrix cards 1..22 -> keywords. 8 and 11 are null on purpose (unconfirmed order). */
export const ARCANA_KEYWORDS: (string | null)[] = [
  'initiative, skill, will', 'intuition, inner knowing', 'care, creativity, abundance', 'structure, authority, stability', 'tradition, teaching, values',
  'choice, connection, values', 'ambition, direction, discipline', null, 'solitude, wisdom, turning inward', 'cycles, change, luck',
  null, 'surrender, a new view, pause', 'endings, transformation, letting go', 'balance, moderation, healing', 'attachment, desire, binding habits',
  'upheaval, sudden change, breakthrough', 'hope, renewal, inspiration', 'intuition, uncertainty, imagination', 'joy, vitality, clarity', 'evaluation, calling, reckoning',
  'completion, wholeness', 'new beginnings, freedom, trust',
];
