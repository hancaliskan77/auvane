// sky: nightly job. Makes sure the shared sky (12:00 UTC) exists for yesterday..+3 days, one row per day.
// Yesterday is included because users west of UTC can still be on the previous calendar day.
// Safe to call by anyone: it only fills missing days from the clock (nothing a caller sends is used),
// and does nothing when every day is already stored. So no secret is needed.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { skyAt, daysFrom } from '../../../packages/calc/src/index.ts';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { 'content-type': 'application/json' } });

Deno.serve(async () => {
  const now = new Date();
  const yesterday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1)).toISOString().slice(0, 10);
  const days = daysFrom(yesterday, 5); // yesterday, today, +1, +2, +3

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: have, error: readErr } = await admin.from('sky_daily').select('day').in('day', days);
  if (readErr) return json({ error: readErr.message }, 500);

  const stored = new Set((have ?? []).map((r: { day: string }) => r.day));
  const missing = days.filter((d) => !stored.has(d));
  if (missing.length === 0) return json({ ok: true, days, created: [] });

  const { error } = await admin.from('sky_daily').upsert(missing.map((day) => ({ day, longitudes: skyAt(day) })), { onConflict: 'day' });
  if (error) return json({ error: error.message }, 500);
  return json({ ok: true, days, created: missing });
});
