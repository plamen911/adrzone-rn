import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import {
  getDistances,
  getInstruction,
  getSubstanceDetails,
} from '../../src/db/queries';
import type {
  DistanceRow,
  Instruction,
  SubstanceDetails,
} from '../../src/db/types';
import { Field } from '../../src/components/Field';
import { HtmlView } from '../../src/components/HtmlView';
import { DANGER_LABEL_IMAGES, parseDangerLabels } from '../../src/lib/dangerLabels';
import { useTheme } from '../../src/theme/useTheme';
import { bg } from '../../src/i18n/bg';

export default function SubstanceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const t = useTheme();
  const numericId = Number(id);

  const [details, setDetails] = useState<SubstanceDetails | null>(null);
  const [instr, setInstr] = useState<Instruction | null>(null);
  const [distances, setDistances] = useState<DistanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(numericId)) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      getSubstanceDetails(numericId),
      getInstruction(numericId),
      getDistances(numericId),
    ])
      .then(([d, i, dist]) => {
        if (cancelled) return;
        setDetails(d);
        setInstr(i);
        setDistances(dist);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [numericId]);

  const sections = useMemo<string[]>(() => {
    const arr: string[] = [bg.details.sections.basic, bg.details.sections.instruction];
    if (distances.length > 0) arr.push(bg.details.sections.distances);
    return arr;
  }, [distances.length]);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }]}>
        <Stack.Screen options={{ title: '' }} />
        <ActivityIndicator color={t.accent} />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={[styles.center, { backgroundColor: t.background }]}>
        <Stack.Screen options={{ title: '' }} />
        <Text style={{ color: t.textMuted }}>{bg.details.notFound}</Text>
      </View>
    );
  }

  const labels = parseDangerLabels(details.danger_labels);

  return (
    <View style={{ flex: 1, backgroundColor: t.background }}>
      <Stack.Screen options={{ title: details.un_number ? `ОН ${details.un_number}` : '' }} />

      <View style={[styles.header, { backgroundColor: t.surface, borderBottomColor: t.border }]}>
        <Text style={[styles.title, { color: t.text }]} numberOfLines={3}>
          {details.substance}
        </Text>
        <View style={styles.metaRow}>
          <View style={[styles.plate, { backgroundColor: '#F5A623' }]}>
            <Text style={styles.plateText}>{details.hin || '–'}</Text>
            <View style={styles.plateDivider} />
            <Text style={styles.plateText}>{details.un_number || '–'}</Text>
          </View>
          {labels.length > 0 ? (
            <View style={styles.labelsRow}>
              {labels.map((lf) =>
                DANGER_LABEL_IMAGES[lf] ? (
                  <Image
                    key={lf}
                    source={DANGER_LABEL_IMAGES[lf]}
                    style={styles.labelImg}
                    resizeMode="contain"
                  />
                ) : null
              )}
            </View>
          ) : null}
        </View>
        <View style={styles.segmentWrap}>
          <SegmentedControl
            values={sections}
            selectedIndex={section}
            onChange={(e) => setSection(e.nativeEvent.selectedSegmentIndex)}
            tintColor={t.accent}
            backgroundColor={t.surfaceAlt}
            fontStyle={{ color: t.text, fontSize: 13 }}
            activeFontStyle={{ color: t.accentText, fontWeight: '700', fontSize: 13 }}
          />
        </View>
      </View>

      {section === 0 ? <BasicSection details={details} /> : null}
      {section === 1 ? <InstructionSection instr={instr} /> : null}
      {section === 2 ? <DistancesSection rows={distances} /> : null}
    </View>
  );
}

function BasicSection({ details }: { details: SubstanceDetails }) {
  const t = useTheme();
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.border }]}>
        <Field label={bg.details.fields.un_number} value={details.un_number} />
        <Field
          label={bg.details.fields.hin}
          value={details.hin}
          hint={details.hin_descr}
        />
        <Field label={bg.details.fields.adr_label} value={details.adr_label} />
        <Field
          label={bg.details.fields.adr_class}
          value={details.adr_class}
          hint={details.class_descr}
        />
        <Field
          label={bg.details.fields.classify_code}
          value={details.classify_code}
          hint={details.code_descr}
        />
        <Field
          label={bg.details.fields.packing_group}
          value={details.packing_group}
          hint={details.group_descr}
        />
        <Field label={bg.details.fields.eric} value={details.eric} />
      </View>
    </ScrollView>
  );
}

function InstructionSection({ instr }: { instr: Instruction | null }) {
  const t = useTheme();
  if (!instr || !instr.instruction) {
    return (
      <View style={styles.center}>
        <Text style={{ color: t.textMuted }}>{bg.details.notFound}</Text>
      </View>
    );
  }
  return <HtmlView html={`<h2>${bg.details.instructionTitle}</h2>${instr.instruction}`} />;
}

function DistancesSection({ rows }: { rows: DistanceRow[] }) {
  const t = useTheme();
  if (rows.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: t.textMuted }}>{bg.details.noDistances}</Text>
      </View>
    );
  }
  return (
    <ScrollView contentContainerStyle={styles.body}>
      <Text style={[styles.distancesTitle, { color: t.text }]}>
        {bg.details.distancesTitle}
      </Text>
      {rows.map((r, idx) => (
        <View
          key={r.id ?? idx}
          style={[styles.card, { backgroundColor: t.surface, borderColor: t.border, marginTop: 8 }]}
        >
          <SpillBlock
            heading={bg.details.smallSpill}
            note={bg.details.smallSpillNote}
            fence={`${r.small_spill_fence_m} m / ${r.small_spill_fence_ft} ft`}
            day={`${r.small_spill_guard_day_km} km / ${r.small_spill_guard_day_mi} mi`}
            night={`${r.small_spill_guard_night_km} km / ${r.small_spill_guard_night_mi} mi`}
          />
          <View style={[styles.divider, { backgroundColor: t.border }]} />
          <SpillBlock
            heading={bg.details.largeSpill}
            note={bg.details.largeSpillNote}
            fence={`${r.large_spill_fence_m} m / ${r.large_spill_fence_ft} ft`}
            day={`${r.large_spill_guard_day_km} km / ${r.large_spill_guard_day_mi} mi`}
            night={`${r.large_spill_guard_night_km} km / ${r.large_spill_guard_night_mi} mi`}
          />
        </View>
      ))}
    </ScrollView>
  );
}

function SpillBlock({
  heading,
  note,
  fence,
  day,
  night,
}: {
  heading: string;
  note: string;
  fence: string;
  day: string;
  night: string;
}) {
  const t = useTheme();
  return (
    <View>
      <Text style={[styles.spillHeading, { color: t.danger }]}>{heading}</Text>
      <Text style={[styles.spillNote, { color: t.textMuted }]}>{note}</Text>
      <View style={styles.spillRow}>
        <Text style={[styles.spillLabel, { color: t.text }]}>{bg.details.isolate}</Text>
        <Text style={[styles.spillVal, { color: t.text }]}>{fence}</Text>
      </View>
      <Text style={[styles.spillLabel, { color: t.text, marginTop: 8 }]}>
        {bg.details.protect}
      </Text>
      <View style={styles.spillRow}>
        <Text style={[styles.spillSub, { color: t.warning }]}>{bg.details.day}</Text>
        <Text style={[styles.spillVal, { color: t.text }]}>{day}</Text>
      </View>
      <View style={styles.spillRow}>
        <Text style={[styles.spillSub, { color: t.accent }]}>{bg.details.night}</Text>
        <Text style={[styles.spillVal, { color: t.text }]}>{night}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
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
  plateDivider: { width: '90%', height: 2, backgroundColor: '#0E1116' },
  plateText: { fontSize: 13, fontWeight: '700', color: '#0E1116' },
  labelsRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  labelImg: { width: 44, height: 44 },
  segmentWrap: { marginTop: 4 },
  body: { padding: 12 },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  distancesTitle: { fontSize: 14, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
  spillHeading: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  spillNote: { fontSize: 12, marginTop: 2, marginBottom: 6 },
  spillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  spillLabel: { fontSize: 13, fontWeight: '600', flex: 1, marginRight: 8 },
  spillSub: { fontSize: 12, fontWeight: '700', width: 60 },
  spillVal: { fontSize: 13, fontWeight: '500' },
});
