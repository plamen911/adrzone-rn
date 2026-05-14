import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { searchSubstances } from '@/src/db/queries';
import type { SubstanceListRow } from '@/src/db/types';
import { SubstanceCard } from '@/src/components/SubstanceCard';
import { useDebounced } from '@/src/lib/useDebounced';
import { useTheme } from '@/src/theme/useTheme';
import { bg } from '@/src/i18n/bg';

export default function SearchScreen() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ adrClass?: string }>();
  const adrClass =
    typeof params.adrClass === 'string' && params.adrClass.length > 0
      ? params.adrClass
      : undefined;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubstanceListRow[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounced(query, 220);

  useEffect(() => {
    let cancelled = false;
    if (!debouncedQuery.trim() && !adrClass) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchSubstances({ query: debouncedQuery, adrClass })
      .then((rows) => {
        if (!cancelled) setResults(rows);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, adrClass]);

  const hasQuery = query.trim().length > 0;
  const hasFilter = hasQuery || !!adrClass;
  const clearAdrClass = () => router.setParams({ adrClass: '' });

  const renderBody = () => {
    if (loading && results.length === 0) {
      return (
        <View style={styles.center}>
          <ActivityIndicator color={t.accent} />
        </View>
      );
    }
    if (results.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={{ color: t.textMuted, textAlign: 'center', paddingHorizontal: 24 }}>
            {hasFilter ? bg.search.noResults : bg.search.emptyHint}
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={results}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <SubstanceCard item={item} />}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />
    );
  };

  return (
    <Pressable
      style={[styles.root, { backgroundColor: t.background }]}
      onPress={Keyboard.dismiss}
      accessible={false}
    >
      <View style={[styles.searchWrap, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Ionicons name="search" color={t.textMuted} size={18} style={{ marginRight: 8 }} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={bg.search.placeholderName}
          placeholderTextColor={t.textMuted}
          style={[styles.input, { color: t.text }]}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={Keyboard.dismiss}
        />
        {query.length > 0 ? (
          <Ionicons
            name="close-circle"
            color={t.textMuted}
            size={18}
            onPress={() => setQuery('')}
          />
        ) : null}
      </View>

      {adrClass ? (
        <View style={styles.chipRow}>
          <Pressable
            onPress={clearAdrClass}
            style={[styles.chip, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
          >
            <Text style={[styles.chipText, { color: t.text }]}>
              {bg.browse.classLabel(adrClass)}
            </Text>
            <Ionicons name="close" color={t.textMuted} size={14} style={{ marginLeft: 6 }} />
          </Pressable>
        </View>
      ) : null}

      {hasFilter ? (
        <View style={styles.metaRow}>
          <Text style={{ color: t.textMuted, fontSize: 12 }}>
            {loading ? '...' : bg.search.resultsCount(results.length)}
          </Text>
        </View>
      ) : null}

      {renderBody()}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: 0 },
  chipRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 4 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipText: { fontSize: 12, fontWeight: '600' },
  metaRow: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 6 },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
