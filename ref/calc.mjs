// Reference implementation. Pure functions, no dependencies.

// ---------- Pythagorean numerology ----------
const VALUES = {};
'ABCDEFGHI'.split('').forEach((c, i) => (VALUES[c] = i + 1));
'JKLMNOPQR'.split('').forEach((c, i) => (VALUES[c] = i + 1));
'STUVWXYZ'.split('').forEach((c, i) => (VALUES[c] = i + 1));
const VOWELS = new Set(['A', 'E', 'I', 'O', 'U']); // Y is a consonant (documented simplification)

const MASTER = new Set([11, 22]); // 33 is reduced to 6 (decision: only 11 and 22 are master numbers)
const digitSum = (n) => String(n).split('').reduce((a, d) => a + Number(d), 0);

export function reduceKeepMaster(n) {
  while (n > 9 && !MASTER.has(n)) n = digitSum(n);
  return n;
}

function letters(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .split('');
}

export function nameNumbers(name) {
  const ls = letters(name);
  const sum = (arr) => arr.reduce((a, c) => a + VALUES[c], 0);
  return {
    expression: reduceKeepMaster(sum(ls)),
    soulUrge: reduceKeepMaster(sum(ls.filter((c) => VOWELS.has(c)))),
    personality: reduceKeepMaster(sum(ls.filter((c) => !VOWELS.has(c)))),
  };
}

export function lifePath(year, month, day) {
  return reduceKeepMaster(
    reduceKeepMaster(month) + reduceKeepMaster(day) + reduceKeepMaster(digitSum(year)),
  );
}

// ---------- Destiny Matrix ----------
export function arcana(n) {
  while (n > 22) n -= 22;
  return n;
}

export function destinyMatrix(year, month, day) {
  const A = arcana(day);
  const B = arcana(month);
  const C = arcana(digitSum(year));
  const D = arcana(A + B + C);
  return { A, B, C, D, E: arcana(A + D), F: arcana(B + D), G: arcana(C + D) };
}

// ---------- Moon phase ----------
const norm360 = (x) => ((x % 360) + 360) % 360;

export function moonPhase(sunLon, moonLon) {
  const elong = norm360(moonLon - sunLon);
  const names = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous',
    'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const name = names[Math.floor(norm360(elong + 22.5) / 45) % 8];
  const illumination = (1 - Math.cos((elong * Math.PI) / 180)) / 2;
  return { elongation: elong, name, illumination };
}

// ---------- Transit-to-natal aspects ----------
const ASPECTS = [
  ['conjunction', 0], ['sextile', 60], ['square', 90], ['trine', 120], ['opposition', 180],
];

export function aspectBetween(lonA, lonB, orb = 5) {
  let d = Math.abs(norm360(lonA) - norm360(lonB));
  if (d > 180) d = 360 - d;
  let best = null;
  for (const [name, angle] of ASPECTS) {
    const off = Math.abs(d - angle);
    if (off <= orb && (!best || off < best.off)) best = { aspect: name, off: Math.round(off * 100) / 100 };
  }
  return best; // null when nothing within orb
}

export const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra',
  'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
export const signOf = (lon) => SIGNS[Math.floor(norm360(lon) / 30)];
