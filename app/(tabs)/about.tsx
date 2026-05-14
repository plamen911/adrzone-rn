import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../src/theme/useTheme';
import { bg } from '../../src/i18n/bg';

export default function AboutScreen() {
  const t = useTheme();
  return (
    <ScrollView
      style={{ backgroundColor: t.background }}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={[styles.h1, { color: t.text }]}>{bg.appName}</Text>
        <Text style={[styles.body, { color: t.textMuted }]}>{bg.about.description}</Text>
        <View style={styles.spacer} />
        <Text style={[styles.meta, { color: t.text }]}>{bg.about.author}</Text>
        <Text
          style={[styles.meta, { color: t.accent }]}
          onPress={() => Linking.openURL(`mailto:${bg.about.email}`)}
          selectable
        >
          {bg.about.email}
        </Text>
        <Text style={[styles.meta, { color: t.textMuted }]}>{bg.about.version}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={[styles.h2, { color: t.danger }]}>⚠ Важно</Text>
        <Text style={[styles.body, { color: t.text }]}>{bg.about.disclaimer}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 12 },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  h1: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  h2: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 13, marginTop: 2 },
  spacer: { height: 12 },
});
