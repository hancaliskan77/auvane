// Chinese zodiac animal + element, by Chinese New Year (not Jan 1, not Li Chun).
// Input is the LOCAL birth calendar date. BaZi is intentionally not included (spec: API-only; dropped in v1).
import { Solar } from 'lunar-javascript';

const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const ELEMENTS = ['Wood', 'Wood', 'Fire', 'Fire', 'Earth', 'Earth', 'Metal', 'Metal', 'Water', 'Water'];
const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
const ANIMALS = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];

export function chineseZodiac(year: number, month: number, day: number) {
  const gz = Solar.fromYmd(year, month, day).getLunar().getYearInGanZhi(); // year pillar by lunar year
  const stem = STEMS.indexOf(gz[0]), branch = BRANCHES.indexOf(gz[1]);
  if (stem < 0 || branch < 0) throw new Error(`Unexpected stem-branch: ${gz}`);
  return {
    animal: ANIMALS[branch],
    element: ELEMENTS[stem],
    polarity: stem % 2 === 0 ? 'Yang' : 'Yin',
    label: `${ELEMENTS[stem]} ${ANIMALS[branch]}`,
  };
}
