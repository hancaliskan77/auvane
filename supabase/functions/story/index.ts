// story: premium full reading (4 themes, 600-900 words). Premium is checked here on the server, never trusted from the app.
// Returns the stored text when it exists; a refresh is allowed at most once per 7 days (spec).
import {
  SYSTEM_PROMPT, buildFacts, storyPrompt, generate, canRegenerateStory, MODEL,
} from '../../../packages/ai/src/index.ts';
import { addSpend, anthropicComplete, clients, cors, dailyCap, isPremium, json, loadInput, spentToday, today } from '../_shared/reading.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const { asUser, admin } = clients(req);
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: 'unauthenticated' }, 401);
  if (!(await isPremium(admin, user.id))) return json({ error: 'premium_required' }, 403);

  const body = await req.json().catch(() => ({}));
  const { data: last } = await admin.from('readings').select('day, body').eq('user_id', user.id).eq('kind', 'story').eq('theme', '')
    .order('day', { ascending: false }).limit(1).maybeSingle();
  if (last && !(body.regenerate && canRegenerateStory(last.day, today()))) return json({ text: last.body, cached: true });

  const loaded = await loadInput(admin, user.id);
  if (!loaded) return json({ error: 'no_chart' }, 404);
  const complete = anthropicComplete();
  if (!complete) return json({ error: 'ai_not_configured', text: last?.body ?? null }, 503);

  const out = await generate({
    kind: 'story', system: SYSTEM_PROMPT, user: storyPrompt(buildFacts(loaded.input)), timeKnown: loaded.timeKnown,
    complete, spentTodayUsd: await spentToday(admin), capUsd: dailyCap(),
  });
  await addSpend(admin, out.costUsd);
  if (!out.ok) {
    // Spec: when generation is stopped, show the last stored text.
    return json({ error: out.reason === 'daily_cap_reached' ? 'paused' : 'unavailable', text: last?.body ?? null }, out.reason === 'daily_cap_reached' ? 503 : 502);
  }
  await admin.from('readings').upsert({
    user_id: user.id, kind: 'story', theme: '', day: today(), body: out.text,
    model: MODEL, tokens_in: out.tokensIn, tokens_out: out.tokensOut, cost_usd: out.costUsd,
  }, { onConflict: 'user_id,kind,theme,day' });
  return json({ text: out.text, cached: false });
});
