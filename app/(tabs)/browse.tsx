import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { listAdrClasses } from '@/src/db/queries';
import type { AdrClass } from '@/src/db/types';
import { DANGER_LABEL_IMAGES, parseDangerLabels } from '@/src/lib/dangerLabels';
import { useTheme } from '@/src/theme/useTheme';
import { bg } from '@/src/i18n/bg';

export default function BrowseScreen() {
  const t = useTheme();
  const router = useRouter();
  const [classes, setClasses] = useState<AdrClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAdrClasses()
      .then(setClasses)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }]}>
        <ActivityIndicator color={t.accent} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ backgroundColor: t.background }}
      data={classes}
      keyExtractor={(c) => String(c.id)}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => {
        const labels = parseDangerLabels(item.danger_labels);
        return (
          <Pressable
            onPress={() => router.push(`/?adrClass=${encodeURIComponent(item.class_code)}`)}
            style={[
              styles.card,
              { backgroundColor: t.surface, borderColor: t.border },
            ]}
          >
            <View style={styles.row}>
              {labels.length > 0 && DANGER_LABEL_IMAGES[labels[0]] ? (
                <Image
                  source={DANGER_LABEL_IMAGES[labels[0]]}
                  style={styles.thumb}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.thumb, { backgroundColor: t.surfaceAlt }]} />
              )}
              <View style={{ flex: 1 }}>
                <Text style={[styles.code, { color: t.text }]}>
                  {bg.browse.classLabel(item.class_code)}
                </Text>
                <Text style={[styles.descr, { color: t.textMuted }]} numberOfLines={3}>
                  {item.class_descr}
                </Text>
              </View>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 12 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  thumb: { width: 56, height: 56 },
  code: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  descr: { fontSize: 13 },
});
