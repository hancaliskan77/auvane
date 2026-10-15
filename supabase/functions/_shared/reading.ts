// Shared server helpers for the AI functions (story, unlock-theme). Everything with rules lives in packages/ai.
import { createClient, type SupabaseClient } from 'npm:@supabase/supabase-js@2';
import Anthropic from 'npm:@anthropic-ai/sdk@0.134.0';
import { MODEL, DEFAULT_DAILY_CAP_USD, type Complete, type ReadingInput } from '../../../packages/ai/src/index.ts';

export const cors = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'authorization, x-client-info, apikey, content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};
export const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'content-type': 'application/json' } });

export const today = () => new Date().toISOString().slice(0, 10);
export const dailyCap = () => Number(Deno.env.get('DAILY_AI_CAP_USD') ?? DEFAULT_DAILY_CAP_USD);

export function clients(req: Request) {
  const url = Deno.env.get('SUPABASE_URL')!;
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } });
  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  return { asUser, admin };
}

export async function spentToday(admin: SupabaseClient): Promise<number> {
  const { data } = await admin.from('llm_spend').select('usd').eq('day', today()).maybeSingle();
  return Number(data?.usd ?? 0);
}
// Read-then-write: a very small race under heavy parallel use can under-count slightly; the nightly batch runs one at a time.
export async function addSpend(admin: SupabaseClient, usd: number) {
  if (usd <= 0) return;
  const now = await spentToday(admin);
  await admin.from('llm_spend').upsert({ day: today(), usd: Math.round((now + usd) * 1e4) / 1e4 }, { onConflict: 'day' });
}

export async function isPremium(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await admin.from('entitlements').select('active, expires_at').eq('user_id', userId).maybeSingle();
  if (!data?.active) return false;
  return !data.expires_at || new Date(data.expires_at).getTime() > Date.now();
}

export async function loadInput(admin: SupabaseClient, userId: string): Promise<{ input: ReadingInput; timeKnown: boolean } | null> {
  const [{ data: chart }, { data: birth }] = await Promise.all([
    admin.from('charts').select('*').eq('user_id', userId).maybeSingle(),
    admin.from('birth_inputs').select('name, time_known').eq('user_id', userId).maybeSingle(),
  ]);
  if (!chart || !birth) return null;
  const timeKnown = !!birth.time_known;
  const hd = timeKnown ? chart.human_design : null;
  return {
    timeKnown,
    input: {
      firstName: String(birth.name).trim().split(/\s+/)[0],
      natal: timeKnown ? chart.natal : { sun: chart.natal.sun, moon: chart.natal.moon },
      numerology: chart.numerology,
      matrix: { D: chart.matrix.D },
      humanDesign: hd ? { type: hd.type, authority: hd.authority, profile: hd.profile, definition: hd.definition } : null,
      chinese: { animal: chart.chinese.animal, element: chart.chinese.element },
    },
  };
}

/** The one place that talks to the model. Returns null when the key is not configured. */
export function anthropicComplete(): Complete | null {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) return null;
  const client = new Anthropic({ apiKey });
  return async (system, user, maxTokens) => {
    // No temperature/top_p (rejected on this model); no prefill. Low effort: this is short, plain writing.
    const msg = await client.messages.create({
      model: MODEL, max_tokens: maxTokens, system,
      messages: [{ role: 'user', content: user }],
      output_config: { effort: 'low' },
    } as any);
    const text = msg.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    return { text, usage: msg.usage as any, refused: msg.stop_reason === 'refusal' };
  };
}
