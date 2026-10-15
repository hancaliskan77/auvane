import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, router } from 'expo-router';
import { resolveBirth } from '@auvane/calc';
import { placeLabel } from '../data/cities';
import { getDraft } from '../lib/draft';
import { fmtDate, fmtOffset, fmtTime, fmtUtc, zoneName } from '../lib/format';
import { ensureSession, supabase } from '../lib/supabase';
import { c } from '../lib/theme';
import { Button, Muted, Title } from '../lib/ui';

function Row({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ paddingVertical: 12, paddingHorizontal: 16, backgroundColor: c.card }}>
      <Text style={{ fontSize: 12, color: c.muted }}>{k}</Text>
      <Text style={{ fontSize: 15, color: c.text, marginTop: 2 }}>{v}</Text>
    </View>
  );
}

export default function Confirm() {
  const d = getDraft();
  const [pick, setPick] = useState<'first' | 'second' | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const base = useMemo(() => {
    if (!d) return null;
    const t = d.time ?? { hour: 12, minute: 0 };
    return resolveBirth({ year: d.year, month: d.month, day: d.day, hour: t.hour, minute: t.minute, zone: d.city.tz });
  }, [d]);
  const res = useMemo(() => {
    if (!d || !base) return null;
    if (base.status !== 'ambiguous' || !pick) return base;
    const t = d.time!;
    return resolveBirth({ year: d.year, month: d.month, day: d.day, hour: t.hour, minute: t.minute, zone: d.city.tz }, pick);
  }, [d, base, pick]);

  if (!d || !res || !base) return <Redirect href="/" />;

  const known = d.time !== null;
  const placeLine = placeLabel(d.city);
  const ok = res.status === 'ok';

  async function confirm() {
    if (!d || !res || res.status !== 'ok') return;
    setBusy(true); setError('');
    try {
      await ensureSession();
      const { data, error: err } = await supabase.functions.invoke('register', {
        body: {
          name: d.name,
          birthDate: `${d.year}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`,
          birthTime: known ? `${String(d.time!.hour).padStart(2, '0')}:${String(d.time!.minute).padStart(2, '0')}` : null,
          tz: d.city.tz, lat: d.city.lat, lon: d.city.lon,
          placeName: placeLine, aiConsent: d.aiConsent, ageConfirmed: d.ageConfirmed,
          dstChoice: pick ?? undefined,
        },
      });
      if (err || !data?.chart) throw err ?? new Error('No chart returned');
      router.replace('/chart');
    } catch {
      setError('We could not prepare your chart. Please check your connection and try again.');
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
        <View>
          <Title>Check your birth details</Title>
          <Muted style={{ marginTop: 6, fontSize: 14 }}>A small mistake here changes your whole chart, so please look closely.</Muted>
        </View>

        {base.status === 'nonexistent' ? (
          <View style={{ padding: 16, borderRadius: 12, borderWidth: 1, borderColor: c.error }}>
            <Text style={{ color: c.error, fontSize: 15, lineHeight: 22 }}>
              That time did not exist on that day, because clocks skipped ahead. Please check your birth time.
            </Text>
          </View>
        ) : (
          <View style={{ gap: 1, backgroundColor: c.border, borderRadius: 14, overflow: 'hidden' }}>
            <Row k="Name" v={d.name} />
            <Row k="Born" v={`${fmtDate(d.year, d.month, d.day)}${known ? ` · ${fmtTime(d.time!.hour, d.time!.minute)} local time` : ' · time not given'}`} />
            <Row k="Place" v={placeLine} />
            {res.status === 'ok' && known && (
              <>
                <Row k="Time zone on that date" v={`${zoneName(res.utc, d.city.tz)} (${fmtOffset(res.offsetMinutes)})`} />
                <Row k="Universal time (UTC)" v={fmtUtc(res.utc)} />
              </>
            )}
            {res.status === 'ok' && !known && <Row k="Time zone" v={d.city.tz} />}
          </View>
        )}

        {base.status === 'ambiguous' && (
          <View style={{ gap: 10 }}>
            <Text style={{ color: c.text, fontSize: 15, lineHeight: 22 }}>
              This time happened twice that day, because clocks were turned back. Which one is yours?
            </Text>
            {base.options.map((o, i) => (
              <Pressable key={i} onPress={() => setPick(i === 0 ? 'first' : 'second')} accessibilityRole="radio"
                style={{ padding: 14, borderRadius: 12, borderWidth: 1, borderColor: pick === (i === 0 ? 'first' : 'second') ? c.accent : c.border, backgroundColor: c.card }}>
                <Text style={{ color: c.text, fontSize: 15 }}>
                  {fmtTime(d.time!.hour, d.time!.minute)} {zoneName(o.utc, d.city.tz)} ({fmtOffset(o.offsetMinutes)})
                </Text>
                <Muted style={{ fontSize: 12 }}>{i === 0 ? 'The first time the clock showed this hour' : 'The second time, after clocks were turned back'}</Muted>
              </Pressable>
            ))}
          </View>
        )}

        {res.status === 'ok' && res.isDst && known && (
          <Muted style={{ fontSize: 12 }}>
            Daylight saving time was in effect on this date, so we used {fmtOffset(res.offsetMinutes)}. This is the moment your chart is calculated for.
          </Muted>
        )}
        {res.status === 'ok' && !known && (
          <Muted style={{ fontSize: 12 }}>Without a birth time, your rising sign and Human Design stay hidden. You can add it later.</Muted>
        )}

        {error ? <Text accessibilityRole="alert" style={{ color: c.error }}>{error}</Text> : null}
        <View style={{ gap: 10, marginTop: 8 }}>
          {busy ? <ActivityIndicator color={c.gold} /> : (
            <Button label="Looks right, reveal my chart" onPress={confirm} disabled={!ok} />
          )}
          <Button label="Edit details" secondary onPress={() => router.back()} disabled={busy} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
