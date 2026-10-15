import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { City, searchCities } from '../data/cities';
import { getDraft, setDraft } from '../lib/draft';
import { supabase } from '../lib/supabase';
import { c, fonts } from '../lib/theme';
import { Button, Check, Muted } from '../lib/ui';

const input = { height: 48, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.input, color: c.text, fontSize: 16 } as const;
const label = { fontSize: 13, color: c.muted, marginBottom: 6 } as const;

function parseDate(mm: string, dd: string, yyyy: string) {
  const m = Number(mm), d = Number(dd), y = Number(yyyy);
  if (!Number.isInteger(m) || !Number.isInteger(d) || !Number.isInteger(y) || yyyy.length !== 4) return null;
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  if (y < 1900 || dt.getTime() > Date.now()) return null;
  return { year: y, month: m, day: d };
}

export default function Onboarding() {
  const prev = getDraft();
  const [checking, setChecking] = useState(true);
  const [name, setName] = useState(prev?.name ?? '');
  const [mm, setMm] = useState(prev ? String(prev.month) : '');
  const [dd, setDd] = useState(prev ? String(prev.day) : '');
  const [yyyy, setYyyy] = useState(prev ? String(prev.year) : '');
  const [hh, setHh] = useState(prev?.time ? String(prev.time.hour % 12 || 12) : '');
  const [mi, setMi] = useState(prev?.time ? String(prev.time.minute).padStart(2, '0') : '');
  const [pm, setPm] = useState(prev?.time ? prev.time.hour >= 12 : false);
  const [timeUnknown, setTimeUnknown] = useState(prev ? prev.time === null : false);
  const [query, setQuery] = useState(prev?.city.name ?? '');
  const [city, setCity] = useState<City | null>(prev?.city ?? null);
  const [age, setAge] = useState(prev?.ageConfirmed ?? false);
  const [consent, setConsent] = useState(prev?.aiConsent ?? false);
  const [error, setError] = useState('');

  // Returning user: the chart is already stored, so open it straight away.
  useEffect(() => {
    (async () => {
      try {
        const { data: s } = await supabase.auth.getSession();
        if (s.session) {
          const { data } = await supabase.from('charts').select('user_id').maybeSingle();
          if (data) { router.replace('/chart'); return; }
        }
      } catch { /* offline: show the form */ }
      setChecking(false);
    })();
  }, []);

  if (checking) return <View style={{ flex: 1, backgroundColor: c.bg, justifyContent: 'center' }}><ActivityIndicator color={c.gold} /></View>;

  const options = city ? [] : searchCities(query);

  function next() {
    const date = parseDate(mm, dd, yyyy);
    if (name.trim().length < 2) return setError('Please enter your full name.');
    if (!date) return setError('Please enter a valid birth date (MM / DD / YYYY).');
    let time: { hour: number; minute: number } | null = null;
    if (!timeUnknown && (hh || mi)) {
      const h = Number(hh), m = Number(mi === '' ? '0' : mi);
      if (!Number.isInteger(h) || h < 1 || h > 12 || !Number.isInteger(m) || m < 0 || m > 59) return setError('Please enter a valid birth time, or tick "I don\'t know my birth time".');
      time = { hour: (h % 12) + (pm ? 12 : 0), minute: m };
    } else if (!timeUnknown) {
      return setError('Please enter your birth time, or tick "I don\'t know my birth time".');
    }
    if (!city) return setError('Please pick your birth place from the list.');
    if (!age) return setError('You must be 13 or older to use Auvane.');
    if (!consent) return setError('Please agree to the data use to continue.');
    setError('');
    setDraft({ name: name.trim(), ...date, time, city, aiConsent: consent, ageConfirmed: age });
    router.push('/confirm');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView contentContainerStyle={{ padding: 24, gap: 18, maxWidth: 480, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 30, fontWeight: '500', color: c.text }}>Auvane</Text>
          <Text style={{ fontSize: 14, color: c.muted }}>Seven systems. One story. Yours.</Text>
        </View>

        <View>
          <Text style={label}>Full name</Text>
          <TextInput style={input} value={name} onChangeText={setName} placeholder="Alex Morgan" placeholderTextColor={c.muted} autoCapitalize="words" />
        </View>

        <View>
          <Text style={label}>Birth date</Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput style={[input, { flex: 1 }]} value={mm} onChangeText={setMm} placeholder="MM" placeholderTextColor={c.muted} keyboardType="number-pad" maxLength={2} />
            <TextInput style={[input, { flex: 1 }]} value={dd} onChangeText={setDd} placeholder="DD" placeholderTextColor={c.muted} keyboardType="number-pad" maxLength={2} />
            <TextInput style={[input, { flex: 1.6 }]} value={yyyy} onChangeText={setYyyy} placeholder="YYYY" placeholderTextColor={c.muted} keyboardType="number-pad" maxLength={4} />
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={[label, { marginBottom: 0 }]}>Birth time (optional)</Text>
          <View style={{ flexDirection: 'row', gap: 10, opacity: timeUnknown ? 0.4 : 1 }}>
            <TextInput style={[input, { flex: 1 }]} editable={!timeUnknown} value={hh} onChangeText={setHh} placeholder="H" placeholderTextColor={c.muted} keyboardType="number-pad" maxLength={2} />
            <TextInput style={[input, { flex: 1 }]} editable={!timeUnknown} value={mi} onChangeText={setMi} placeholder="MM" placeholderTextColor={c.muted} keyboardType="number-pad" maxLength={2} />
            <View style={{ flex: 1.6, flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
              {(['AM', 'PM'] as const).map((v) => (
                <Pressable key={v} disabled={timeUnknown} onPress={() => setPm(v === 'PM')}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: (v === 'PM') === pm ? c.accent : c.input }}>
                  <Text style={{ color: c.text, fontWeight: '600' }}>{v}</Text>
                </Pressable>
              ))}
            </View>
          </View>
          <Muted style={{ fontSize: 12 }}>Adds your rising sign and Human Design.</Muted>
          <Check checked={timeUnknown} onToggle={() => setTimeUnknown(!timeUnknown)}>I don't know my birth time</Check>
        </View>

        <View>
          <Text style={label}>Birth place</Text>
          <TextInput style={input} value={query} placeholder="Start typing a city" placeholderTextColor={c.muted}
            onChangeText={(t) => { setQuery(t); setCity(null); }} autoCorrect={false} />
          {options.length > 0 && (
            <View style={{ marginTop: 6, borderRadius: 10, borderWidth: 1, borderColor: c.border, backgroundColor: c.input, overflow: 'hidden' }}>
              {options.map((o, i) => (
                <Pressable key={`${o.name}-${o.region}`} onPress={() => { setCity(o); setQuery(o.name); }}
                  style={{ paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: i ? 1 : 0, borderTopColor: c.border }}>
                  <Text style={{ color: c.text, fontSize: 14 }}>{o.name}</Text>
                  <Text style={{ color: c.muted, fontSize: 12 }}>{o.region}, {o.country}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {!city && query.trim().length >= 2 && options.length === 0 && (
            <Muted style={{ marginTop: 6 }}>No match. Pick the nearest larger city instead.</Muted>
          )}
          <Muted style={{ marginTop: 6, fontSize: 12 }}>Pick your place from the list so we get the right time zone.</Muted>
        </View>

        <View style={{ gap: 12 }}>
          <Check checked={age} onToggle={() => setAge(!age)}>I am 13 years old or older.</Check>
          <Check checked={consent} onToggle={() => setConsent(!consent)}>
            I agree that Auvane may process my name and birth details, including with AI providers, to create my readings. We never sell or share your personal information.
          </Check>
        </View>

        {error ? <Text accessibilityRole="alert" style={{ color: c.error, fontSize: 14 }}>{error}</Text> : null}
        <Button label="Continue" onPress={next} />
      </ScrollView>
    </SafeAreaView>
  );
}
