import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { arcanaName, moonPhase, nearSignBoundary, signOf } from '@auvane/calc';
import { fmtDate, fmtTime, monthName } from '../lib/format';
import { supabase } from '../lib/supabase';
import { c, fonts } from '../lib/theme';
import { Muted } from '../lib/ui';

const THEMES = ['Personality', 'Relationships', 'Career', 'Spiritual path'];

function Line({ k, v }: { k: string; v: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 13, paddingHorizontal: 16, backgroundColor: c.card }}>
      <Text style={{ color: c.muted, fontSize: 13 }}>{k}</Text>
      <Text style={{ color: c.text, fontSize: 14, flex: 1, textAlign: 'right' }}>{v}</Text>
    </View>
  );
}

export default function Chart() {
  const [state, setState] = useState<{ chart: any; birth: any } | 'loading' | 'missing' | 'error'>('loading');

  useEffect(() => {
    (async () => {
      try {
        const [{ data: chart, error: e1 }, { data: birth, error: e2 }] = await Promise.all([
          supabase.from('charts').select('*').maybeSingle(),
          supabase.from('birth_inputs').select('*').maybeSingle(),
        ]);
        if (e1 || e2) throw e1 ?? e2;
        setState(chart && birth ? { chart, birth } : 'missing');
      } catch { setState('error'); }
    })();
  }, []);

  if (state === 'loading') return <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}><ActivityIndicator color={c.gold} /></View>;
  if (state === 'missing' || state === 'error') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.bg, padding: 24, justifyContent: 'center', gap: 16 }}>
        <Text style={{ color: c.text, fontSize: 16, textAlign: 'center' }}>
          {state === 'error' ? 'We could not load your chart. Please check your connection.' : 'We could not find your chart yet.'}
        </Text>
        <Pressable onPress={() => router.replace('/')}><Text style={{ color: c.gold, textAlign: 'center', fontSize: 15 }}>Start over</Text></Pressable>
      </SafeAreaView>
    );
  }

  const { chart, birth } = state;
  const n = chart.natal, num = chart.numerology, hd = chart.human_design, mx = chart.matrix;
  const first = String(birth.name).split(' ')[0];
  const [y, m, d] = String(birth.birth_date).split('-').map(Number);
  const [hh, mi] = birth.time_known ? String(birth.birth_time).split(':').map(Number) : [0, 0];
  const place = String(birth.place_name).split(',').slice(0, 2).join(',');

  const western = [`${signOf(n.sun)} Sun`, `${signOf(n.moon)} Moon`];
  if (n.ascendant !== undefined) western.push(`${signOf(n.ascendant)} Rising${nearSignBoundary(n.ascendant, 2) ? ' (not certain)' : ''}`);
  const core = mx.D as number;
  const cardName = arcanaName(core);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16, maxWidth: 480, width: '100%', alignSelf: 'center' }}>
        <View>
          <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 26, fontWeight: '500' }}>Your chart, {first}</Text>
          <Muted style={{ marginTop: 6 }}>
            Born {monthName(m).slice(0, 3)} {d}, {y}{birth.time_known ? ` · ${fmtTime(hh, mi)}` : ''} · {place}
          </Muted>
        </View>

        <View style={{ gap: 1, backgroundColor: c.border, borderRadius: 14, overflow: 'hidden' }}>
          <Line k="Western" v={western.join(' · ')} />
          <Line k="Life path" v={`Life Path ${num.lifePath}`} />
          <Line k="Name numbers" v={`Expression ${num.expression} · Soul Urge ${num.soulUrge}`} />
          <Line k="Human Design" v={hd ? `${hd.type} · ${hd.profile}` : 'Add your birth time to unlock'} />
          <Line k="Destiny Matrix" v={`Core arcana ${core}${cardName ? ` · ${cardName}` : ''}`} />
          <Line k="Chinese" v={chart.chinese.label} />
          <Line k="Moon" v={`${moonPhase(n.sun, n.moon).name} at birth`} />
        </View>
        {!birth.time_known && <Muted style={{ fontSize: 12 }}>Your rising sign and Human Design appear once you add your birth time.</Muted>}

        <Text style={{ fontFamily: fonts.serif, color: c.text, fontSize: 20, marginTop: 8 }}>Your story, in four themes</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {THEMES.map((t) => (
            // Rewarded ads do not run on web; this is a placeholder button until step 6.
            <View key={t} style={{ width: '48%', flexGrow: 1, padding: 14, borderRadius: 12, backgroundColor: c.card, borderWidth: 1, borderColor: c.border }}>
              <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>{t}</Text>
              <Text style={{ color: c.gold, fontSize: 12, marginTop: 6 }}>▶ Watch an ad to unlock</Text>
            </View>
          ))}
        </View>
        <Muted style={{ textAlign: 'center', fontSize: 12 }}>One free unlock per day</Muted>
      </ScrollView>
    </SafeAreaView>
  );
}
