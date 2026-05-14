import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

export function Field({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | null | undefined;
  hint?: string | null;
}) {
  const t = useTheme();
  return (
    <View style={[styles.row, { borderBottomColor: t.border }]}>
      <Text style={[styles.label, { color: t.textMuted }]}>{label}</Text>
      <Text style={[styles.value, { color: t.text }]}>{value || '—'}</Text>
      {hint ? <Text style={[styles.hint, { color: t.textMuted }]}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  value: { fontSize: 16, fontWeight: '500', marginTop: 4 },
  hint: { fontSize: 13, marginTop: 4, lineHeight: 18 },
});
