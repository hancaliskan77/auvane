// unlock-theme: writes the short summary of ONE theme the user unlocked with a rewarded ad (50-70 words, once).
// The unlock itself (a row in `unlocks`, max 1 per day) is created only by the AdMob server-side verification
// (step 6). This function never trusts the app: no unlock row for today and this theme means no text.
import {
  SYSTEM_PROMPT, THEMES, buildFacts, themePrompt, generate, MODEL, type Theme,
} from '../../../packages/ai/src/index.ts';
import { addSpend, anthropicComplete, clients, cors, dailyCap, json, loadInput, spentToday, today } from '../_shared/reading.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const { asUser, admin } = clients(req);
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: 'unauthenticated' }, 401);

  const { theme } = await req.json().catch(() => ({}));
  if (!THEMES.includes(theme)) return json({ error: 'bad_theme' }, 400);

  const { data: unlock } = await admin.from('unlocks').select('theme').eq('user_id', user.id).eq('day', today()).maybeSingle();
  if (!unlock || unlock.theme !== theme) return json({ error: 'not_unlocked' }, 403);

  const { data: have } = await admin.from('readings').select('body').eq('user_id', user.id).eq('kind', 'theme').eq('theme', theme).eq('day', today()).maybeSingle();
  if (have) return json({ text: have.body, cached: true });

  const loaded = await loadInput(admin, user.id);
  if (!loaded) return json({ error: 'no_chart' }, 404);
  const complete = anthropicComplete();
  if (!complete) return json({ error: 'ai_not_configured' }, 503);

  const out = await generate({
    kind: 'theme', system: SYSTEM_PROMPT, user: themePrompt(buildFacts(loaded.input), theme as Theme), timeKnown: loaded.timeKnown,
    complete, spentTodayUsd: await spentToday(admin), capUsd: dailyCap(),
  });
  await addSpend(admin, out.costUsd);
  if (!out.ok) return json({ error: out.reason === 'daily_cap_reached' ? 'paused' : 'unavailable' }, out.reason === 'daily_cap_reached' ? 503 : 502);

  await admin.from('readings').upsert({
    user_id: user.id, kind: 'theme', theme, day: today(), body: out.text,
    model: MODEL, tokens_in: out.tokensIn, tokens_out: out.tokensOut, cost_usd: out.costUsd,
  }, { onConflict: 'user_id,kind,theme,day' });
  return json({ text: out.text, cached: false });
});
