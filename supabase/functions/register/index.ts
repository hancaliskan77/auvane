// register: consent-gated, idempotent. Stores birth input, computes our own chart, saves it.
// Everything is computed in-house (packages/calc); no external astrology API is called.
import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  resolveBirth, natalPoints, lifePath, nameNumbers, destinyMatrix, humanDesign, chineseZodiac,
} from '../../../packages/calc/src/index.ts';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async (req) => {
  const url = Deno.env.get('SUPABASE_URL')!;
  const auth = req.headers.get('Authorization') ?? '';
  const asUser = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: { user } } = await asUser.auth.getUser();
  if (!user) return json({ error: 'unauthenticated' }, 401);

  const b = await req.json();
  if (!b.aiConsent || !b.ageConfirmed) return json({ error: 'consent_required' }, 400);

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Idempotent: a second call returns the stored chart instead of regenerating.
  const { data: existing } = await admin.from('charts').select('*').eq('user_id', user.id).maybeSingle();
  if (existing) return json({ chart: existing, cached: true });

  const [y, m, d] = String(b.birthDate).split('-').map(Number);
  const timeKnown = !!b.birthTime;
  const [hh, mm] = timeKnown ? String(b.birthTime).split(':').map(Number) : [12, 0];
  const res = resolveBirth({ year: y, month: m, day: d, hour: hh, minute: mm, zone: b.tz }, b.dstChoice);
  if (res.status === 'nonexistent') return json({ error: 'nonexistent_time' }, 422);
  if (res.status === 'ambiguous') return json({ error: 'ambiguous_time', options: res.options }, 409);

  const natal = natalPoints(res.utc, b.lat, b.lon);
  const chart = {
    natal: { sun: natal.sun, moon: natal.moon, ...(timeKnown ? { ascendant: natal.ascendant } : {}) },
    numerology: { lifePath: lifePath(y, m, d), ...nameNumbers(b.name) },
    matrix: destinyMatrix(y, m, d),
    chinese: chineseZodiac(y, m, d),
    human_design: timeKnown ? humanDesign(res.utc) : null, // hidden when birth time unknown
  };

  await admin.from('profiles').upsert({
    id: user.id, device_tz: b.deviceTz ?? null,
    ai_consent_at: new Date().toISOString(), age_confirmed_at: new Date().toISOString(),
  });
  await admin.from('birth_inputs').upsert({
    user_id: user.id, name: b.name, birth_date: b.birthDate, birth_time: timeKnown ? b.birthTime : null,
    time_known: timeKnown, place_name: b.placeName, lat: b.lat, lon: b.lon, tz: b.tz,
    utc_offset_minutes: res.offsetMinutes, birth_utc: timeKnown ? res.utc.toISOString() : null,
  });
  const { data: saved } = await admin.from('charts')
    .insert({ user_id: user.id, ...chart }).select().single();
  return json({ chart: saved, cached: false });
});
