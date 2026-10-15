import { ReactNode } from 'react';
import { Pressable, Text, View, ViewStyle } from 'react-native';
import { c, fonts } from './theme';

export function Button({ label, onPress, disabled, secondary }: { label: string; onPress: () => void; disabled?: boolean; secondary?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button" onPress={onPress} disabled={disabled}
      style={{ height: 52, borderRadius: 12, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.5 : 1,
        backgroundColor: secondary ? 'transparent' : c.accent, borderWidth: secondary ? 1 : 0, borderColor: c.border }}>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>{label}</Text>
    </Pressable>
  );
}

export function Check({ checked, onToggle, children }: { checked: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onToggle}
      style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
      <View style={{ width: 20, height: 20, borderRadius: 5, borderWidth: 1, borderColor: c.border, marginTop: 1,
        backgroundColor: checked ? c.accent : c.input, alignItems: 'center', justifyContent: 'center' }}>
        {checked ? <Text style={{ color: c.text, fontSize: 13, lineHeight: 16 }}>✓</Text> : null}
      </View>
      <Text style={{ flex: 1, color: c.muted, fontSize: 13, lineHeight: 19 }}>{children}</Text>
    </Pressable>
  );
}

export const Title = ({ children, style }: { children: ReactNode; style?: object }) => (
  <Text style={[{ fontFamily: fonts.serif, color: c.text, fontSize: 26, fontWeight: '500' }, style]}>{children}</Text>
);
export const Muted = ({ children, style }: { children: ReactNode; style?: object }) => (
  <Text style={[{ color: c.muted, fontSize: 13, lineHeight: 19 }, style]}>{children}</Text>
);
export const screen: ViewStyle = { flex: 1, backgroundColor: c.bg };
