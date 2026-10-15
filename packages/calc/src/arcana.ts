// Major arcana names for Destiny Matrix. Cards 8 and 11 are deliberately null:
// the Justice/Strength order is unconfirmed (spec: not coded until a Matrix source confirms it).
export const ARCANA_NAMES: (string | null)[] = [
  'Magician', 'High Priestess', 'Empress', 'Emperor', 'Hierophant', 'Lovers', 'Chariot',
  null, 'Hermit', 'Wheel of Fortune', null, 'Hanged Man', 'Death', 'Temperance', 'Devil',
  'Tower', 'Star', 'Moon', 'Sun', 'Judgement', 'World', 'Fool',
];

/** Name for card 1..22, or null when unknown/unconfirmed. */
export const arcanaName = (n: number): string | null => ARCANA_NAMES[n - 1] ?? null;
