// Free "sentence of the day": one template sentence from the Moon's phase and sign. No AI, same for everyone.
import { moonPhase, signOf } from './calc';
import type { Sky } from './sky';

const PHASE: Record<string, string> = {
  'New Moon': 'a quiet new Moon invites fresh intentions',
  'Waxing Crescent': 'the Moon is growing, a good time to begin',
  'First Quarter': 'a half-lit Moon asks for one small decision',
  'Waxing Gibbous': 'the Moon is nearly full, so refine what you have started',
  'Full Moon': 'a full Moon brings things into the light',
  'Waning Gibbous': 'the Moon is fading from full, a good time to share what you have learned',
  'Last Quarter': 'a last-quarter Moon favors letting go of what no longer fits',
  'Waning Crescent': 'a thin Moon asks for rest before the next cycle',
};

const SIGN: Record<string, string> = {
  Aries: 'act on what already feels clear',
  Taurus: 'keep things simple and steady',
  Gemini: 'talk things through and stay curious',
  Cancer: 'look after yourself and the people close to you',
  Leo: 'let yourself be seen and enjoy it',
  Virgo: 'small useful details matter today',
  Libra: 'look for balance and fair choices',
  Scorpio: 'go deeper instead of wider',
  Sagittarius: 'aim at something bigger than today\'s worries',
  Capricorn: 'build one solid step',
  Aquarius: 'try a fresh angle',
  Pisces: 'trust your quiet instincts and rest your mind',
};

export function dailySentence(sky: Pick<Sky, 'Sun' | 'Moon'>): string {
  const phase = moonPhase(sky.Sun, sky.Moon).name;
  const lead = PHASE[phase];
  return `${lead[0].toUpperCase()}${lead.slice(1)}; with the Moon in ${signOf(sky.Moon)}, ${SIGN[signOf(sky.Moon)]}.`;
}

export const DAILY_PHASES = Object.keys(PHASE);
export const DAILY_SIGNS = Object.keys(SIGN);
