import { checkBudget, costUsd, worstCaseUsd, type Usage } from './budget';
import { validate, type Check, type Kind } from './validate';

/** One model call. Injected so the pipeline is testable without the network. */
export type Complete = (system: string, user: string, maxTokens: number) => Promise<{ text: string; usage: Usage; refused?: boolean }>;

export const MAX_TOKENS: Record<Kind, number> = { theme: 1500, story: 4500 };

export type Outcome =
  | { ok: true; text: string; attempts: number; costUsd: number; tokensIn: number; tokensOut: number }
  | { ok: false; reason: 'daily_cap_reached' | 'failed_validation' | 'refused'; attempts: number; costUsd: number; tokensIn: number; tokensOut: number; problems?: string[] };

/**
 * Generate, check, and retry once (spec). The caller supplies today's spend and the cap;
 * the budget is re-checked before the retry so one user cannot run the day over the cap.
 */
export async function generate(args: {
  kind: Kind; system: string; user: string; timeKnown: boolean; complete: Complete;
  spentTodayUsd: number; capUsd: number; approxInputTokens?: number;
}): Promise<Outcome> {
  const { kind, system, user, timeKnown, complete, capUsd } = args;
  const maxTokens = MAX_TOKENS[kind];
  const worst = worstCaseUsd(args.approxInputTokens ?? Math.ceil((system.length + user.length) / 3), maxTokens);
  let spent = args.spentTodayUsd, cost = 0, tokensIn = 0, tokensOut = 0, last: Check | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    if (!checkBudget(spent, capUsd, worst).allowed) return { ok: false, reason: 'daily_cap_reached', attempts: attempt - 1, costUsd: cost, tokensIn, tokensOut };
    const r = await complete(system, user, maxTokens);
    const c = costUsd(r.usage);
    cost += c; spent += c; tokensIn += r.usage.input_tokens; tokensOut += r.usage.output_tokens;
    if (r.refused) return { ok: false, reason: 'refused', attempts: attempt, costUsd: cost, tokensIn, tokensOut };
    last = validate(r.text, kind, { timeKnown });
    if (last.ok) return { ok: true, text: r.text.trim(), attempts: attempt, costUsd: cost, tokensIn, tokensOut };
  }
  return { ok: false, reason: 'failed_validation', attempts: 2, costUsd: cost, tokensIn, tokensOut, problems: last?.problems };
}
