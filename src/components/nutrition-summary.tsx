import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { calculateMacroTargets, type MacroTargets, type NutritionProfile } from '../utils/nutrition';

type NutritionSummaryProps = {
  profile: NutritionProfile & { targets?: MacroTargets };
  logs: Record<string, any>;
  onPress: () => void;
  compact?: boolean;
};

export default function NutritionSummary({ profile, logs, onPress, compact = false }: NutritionSummaryProps) {
  const targets = profile.targets || calculateMacroTargets(profile);
  const totals = {
    calories: totalFor(logs, 'calories'),
    protein: totalFor(logs, 'protein'),
    carbohydrates: totalFor(logs, 'carbohydrates'),
    fat: totalFor(logs, 'fat'),
  };

  return (
    <View style={[styles.container, compact && styles.compact]}>
      <View style={styles.heading}>
        <View>
          <Text style={styles.title}>Tages-Makros</Text>
          <Text style={styles.caption}>Bisher gegessen · {goalLabel(profile.goal)}</Text>
        </View>
        <TouchableOpacity onPress={onPress} accessibilityLabel="Ernährungsprotokoll öffnen">
          <Text style={styles.action}>Details</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.metrics}>
        <Macro label="kcal" current={totals.calories} target={targets.calories} />
        <Macro label="Protein" current={totals.protein} target={targets.protein} />
        <Macro label="Kohlenhydrate" current={totals.carbohydrates} target={targets.carbohydrates} />
        <Macro label="Fett" current={totals.fat} target={targets.fat} />
      </View>
    </View>
  );
}

function Macro({ label, current, target }: { label: string; current: number | null; target: number }) {
  const value = current === null ? 0 : current;
  const percent = Math.min(100, Math.round((value / target) * 100));
  return (
    <View style={styles.metric}>
      <Text numberOfLines={1} style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metricValue}>{formatNumber(current)}<Text style={styles.metricTarget}> / {target}</Text></Text>
      <View style={styles.track}><View style={[styles.fill, { width: `${percent}%` }]} /></View>
    </View>
  );
}

function totalFor(logs: Record<string, any>, key: keyof MacroTargets): number | null {
  const values = Object.values(logs || {}).map((entry) => entry?.nutrients?.[key]).filter((value) => Number.isFinite(value));
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

function formatNumber(value: number | null) {
  return value === null ? '–' : String(Math.round(value));
}

function goalLabel(goal: NutritionProfile['goal']) {
  if (goal === 'lose') return 'Fett verlieren';
  if (goal === 'gain') return 'Muskelaufbau';
  return 'Gewicht halten';
}

const styles = StyleSheet.create({
  container: { backgroundColor: '#fff', borderRadius: 8, marginTop: 16, padding: 16 },
  compact: { marginBottom: 6, marginTop: 0 },
  heading: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: '#263238', fontSize: 17, fontWeight: '700' },
  caption: { color: '#687579', fontSize: 12, marginTop: 3 },
  action: { color: '#06837d', fontSize: 13, fontWeight: '700', padding: 5 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metric: { flexBasis: '44%', flexGrow: 1, minWidth: 0 },
  metricLabel: { color: '#536165', fontSize: 11, fontWeight: '600' },
  metricValue: { color: '#263238', fontSize: 14, fontWeight: '700', marginTop: 5 },
  metricTarget: { color: '#687579', fontSize: 11, fontWeight: '400' },
  track: { backgroundColor: '#e7ece8', borderRadius: 4, height: 5, marginTop: 7, overflow: 'hidden' },
  fill: { backgroundColor: '#06837d', borderRadius: 4, height: 5 },
});