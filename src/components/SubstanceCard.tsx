import { memo } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import type { SubstanceListRow } from '../db/types';
import { useTheme } from '../theme/useTheme';

type Props = { item: SubstanceListRow };

function SubstanceCardImpl({ item }: Props) {
  const t = useTheme();
  const router = useRouter();

  const onPress = () => router.push(`/substance/${item.id}`);
  const onLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push(`/substance/${item.id}`);
  };

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: t.surface,
          borderColor: t.border,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <View style={[styles.plate, { backgroundColor: '#F5A623' }]}>
        <Text style={styles.plateHin}>{item.hin || '–'}</Text>
        <View style={[styles.plateDivider, { backgroundColor: '#0E1116' }]} />
        <Text style={styles.plateUn}>{item.un_number || '–'}</Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: t.text }]} numberOfLines={2}>
          {item.substance}
        </Text>
        <Text style={[styles.meta, { color: t.textMuted }]} numberOfLines={1}>
          ОН {item.un_number} · ИНО {item.hin || '–'} · ERI {item.eric || '–'}
        </Text>
        {item.has_distance ? (
          <View style={[styles.badge, { backgroundColor: t.warning }]}>
            <Text style={styles.badgeText}>Дистанции</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export const SubstanceCard = memo(SubstanceCardImpl);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginVertical: 4,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  plate: {
    width: 64,
    height: 48,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#0E1116',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  plateDivider: { width: '90%', height: 2 },
  plateHin: { fontSize: 13, fontWeight: '700', color: '#0E1116' },
  plateUn: { fontSize: 13, fontWeight: '700', color: '#0E1116' },
  body: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  meta: { fontSize: 12 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#0E1116' },
});
