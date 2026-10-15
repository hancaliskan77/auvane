-- No external astrology API: nothing to cross-check against at runtime.
alter table charts drop column if exists verification_status, drop column if exists verification_diff;
