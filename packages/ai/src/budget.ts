// Spend tracking and the daily cap (spec: starts at $10/day; once reached, generation stops).

// claude-sonnet-5-5: $2 / $10 per million tokens, cache reads $0.20 (verified 6 Oct 2026 via the Claude API reference).
export const MODEL = 'claude-sonnet-5-5';
export const PRICE = { inputPerMTok: 2, outputPerMTok: 10, cacheReadPerMTok: 0.2 } as const;
export const DEFAULT_DAILY_CAP_USD = 10;

export interface Usage { input_tokens: number; output_tokens: number; cache_read_input_tokens?: number }

export function costUsd(u: Usage): number {
  const cached = u.cache_read_input_tokens ?? 0;
  return (u.input_tokens * PRICE.inputPerMTok + u.output_tokens * PRICE.outputPerMTok + cached * PRICE.cacheReadPerMTok) / 1e6;
}

/** Worst-case cost of one request, used to refuse a call that could push the day over the cap. */
export function worstCaseUsd(inputTokens: number, maxOutputTokens: number): number {
  return costUsd({ input_tokens: inputTokens, output_tokens: maxOutputTokens });
}

export type BudgetDecision = { allowed: true } | { allowed: false; reason: 'daily_cap_reached' };

export function checkBudget(spentTodayUsd: number, capUsd: number, nextWorstCaseUsd = 0): BudgetDecision {
  return spentTodayUsd + nextWorstCaseUsd > capUsd ? { allowed: false, reason: 'daily_cap_reached' } : { allowed: true };
}

// Per-user limits (spec): a rewarded theme once per day, story regeneration at most once per week.
export const STORY_REGEN_DAYS = 7;
export function canRegenerateStory(lastStoryDay: string | null, today: string): boolean {
  if (!lastStoryDay) return true;
  const ms = Date.parse(`${today}T00:00:00Z`) - Date.parse(`${lastStoryDay}T00:00:00Z`);
  return ms >= STORY_REGEN_DAYS * 86400000;
}
