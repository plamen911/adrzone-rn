import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { countSubstances, getSubstancesByIds, searchSubstances } from '@/src/db/queries';
import type { SubstanceListRow } from '@/src/db/types';
import { SubstanceCard } from '@/src/components/SubstanceCard';
import { useDebounced } from '@/src/lib/useDebounced';
import { clearRecents, useUserPrefs } from '@/src/lib/userPrefs';
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
  const prefs = useUserPrefs();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SubstanceListRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [favoriteRows, setFavoriteRows] = useState<SubstanceListRow[]>([]);
  const [recentRows, setRecentRows] = useState<SubstanceListRow[]>([]);
  const [substanceCount, setSubstanceCount] = useState(0);

  useEffect(() => {
    countSubstances().then(setSubstanceCount);
  }, []);

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

  useEffect(() => {
    let cancelled = false;
    const ids = Array.from(new Set([...prefs.favorites, ...prefs.recents]));
    if (ids.length === 0) {
      setFavoriteRows([]);
      setRecentRows([]);
      return;
    }
    getSubstancesByIds(ids).then((rows) => {
      if (cancelled) return;
      const byId = new Map(rows.map((r) => [r.id, r]));
      const pick = (list: number[]) =>
        list.map((id) => byId.get(id)).filter((r): r is SubstanceListRow => !!r);
      setFavoriteRows(pick(prefs.favorites));
      setRecentRows(pick(prefs.recents));
    });
    return () => {
      cancelled = true;
    };
  }, [prefs]);

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
    if (!hasFilter) {
      if (favoriteRows.length === 0 && recentRows.length === 0) {
        return (
          <View style={styles.center}>
            <Text style={{ color: t.textMuted, textAlign: 'center', paddingHorizontal: 24 }}>
              {substanceCount > 0 ? bg.search.emptyHint(substanceCount) : ''}
            </Text>
          </View>
        );
      }
      return (
        <ScrollView
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {favoriteRows.length > 0 ? (
            <>
              <Text style={[styles.sectionHeader, { color: t.textMuted }]}>
                {bg.search.favoritesTitle}
              </Text>
              {favoriteRows.map((item) => (
                <SubstanceCard key={item.id} item={item} />
              ))}
            </>
          ) : null}
          {recentRows.length > 0 ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionHeader, { color: t.textMuted }]}>
                  {bg.search.recentsTitle}
                </Text>
                <Pressable
                  onPress={() => clearRecents()}
                  hitSlop={10}
                  accessibilityLabel={bg.search.clearRecents}
                  accessibilityRole="button"
                >
                  <Ionicons name="trash-outline" size={16} color={t.textMuted} />
                </Pressable>
              </View>
              {recentRows.map((item) => (
                <SubstanceCard key={`r-${item.id}`} item={item} />
              ))}
            </>
          ) : null}
        </ScrollView>
      );
    }
    if (results.length === 0) {
      return (
        <View style={styles.center}>
          <Text style={{ color: t.textMuted, textAlign: 'center', paddingHorizontal: 24 }}>
            {bg.search.noResults}
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
          <Pressable
            onPress={() => setQuery('')}
            hitSlop={10}
            accessibilityLabel={bg.search.clearQuery}
            accessibilityRole="button"
          >
            <Ionicons name="close-circle" color={t.textMuted} size={18} />
          </Pressable>
        ) : null}
      </View>

      {adrClass ? (
        <View style={styles.chipRow}>
          <Pressable
            onPress={clearAdrClass}
            style={[styles.chip, { backgroundColor: t.surfaceAlt, borderColor: t.border }]}
            accessibilityLabel={bg.search.clearClassFilter}
            accessibilityRole="button"
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
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 4,
  },
  list: { paddingHorizontal: 12, paddingBottom: 24 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
});
