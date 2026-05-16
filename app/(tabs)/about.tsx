import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/theme/useTheme';
import { bg } from '@/src/i18n/bg';
import { APP_STORE_REVIEW_URL } from '@/src/lib/constants';

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
        <Text style={[styles.meta, { color: t.textMuted }]}>
          {bg.about.version(Constants.expoConfig?.version ?? '?')}
        </Text>
      </View>

      <Pressable
        onPress={() => Linking.openURL(APP_STORE_REVIEW_URL)}
        style={({ pressed }) => [
          styles.card,
          styles.rateRow,
          {
            backgroundColor: pressed ? t.surfaceAlt : t.surface,
            borderColor: t.border,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={bg.about.rate}
      >
        <Ionicons name="star-outline" size={18} color={t.accent} />
        <Text style={[styles.rateText, { color: t.text }]}>{bg.about.rate}</Text>
        <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
      </Pressable>

      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Text style={[styles.h2, { color: t.danger }]}>{bg.about.importantHeading}</Text>
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
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rateText: { flex: 1, fontSize: 15, fontWeight: '600' },
  h1: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  h2: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 13, marginTop: 2 },
  spacer: { height: 12 },
});
