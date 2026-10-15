-- Nightly sky job: calls the `sky` edge function every day at 00:05 UTC.
-- The function only fills missing days, so no secret is needed (the publishable key is public by design).
-- NOT YET APPLIED on auvane-dev: the SQL tool timed out on schema changes. Apply when it works,
-- or create the schedule from the Supabase dashboard (Integrations > Cron).
create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'sky-nightly',
  '5 0 * * *',
  $$
  select net.http_post(
    url := 'https://drzepkwblzgwyogiddzi.supabase.co/functions/v1/sky',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_yEe1wK_AP4GBeQkpebXL2g_gb0sktWX'
    )
  );
  $$
);
