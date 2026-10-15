import type { City } from '../data/cities';

// In-memory form state shared between onboarding and confirm screens.
export interface Draft {
  name: string;
  year: number; month: number; day: number;
  time: { hour: number; minute: number } | null; // 24h, local; null = unknown
  city: City;
  aiConsent: boolean;
  ageConfirmed: boolean;
}
let draft: Draft | null = null;
export const getDraft = () => draft;
export const setDraft = (d: Draft) => { draft = d; };
