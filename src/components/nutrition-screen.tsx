import { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import {
  calculateMacroTargets,
  scaleNutrition,
  type ActivityLevel,
  type FormulaBasis,
  type MacroTargets,
  type NutritionGoal,
  type NutritionProfile,
} from '../utils/nutrition';

const FoodSearchInput = require('../SMART Vorrat/components/FoodSearchInput').default;
const { lookupProductByBarcode } = require('../SMART Vorrat/components/FoodSearchInput');
const BarcodeScannerModal = require('../SMART Vorrat/components/BarcodeScannerModal').default;

type NutritionScreenProps = {
  profile: (NutritionProfile & { enabled?: boolean; targets?: MacroTargets }) | null;
  logs: Record<string, any>;
  inventory: Record<string, any>;
  onSaveProfile: (profile: any) => Promise<void>;
  onDisable: () => Promise<void>;
  onAddLog: (entry: any) => Promise<void>;
  onDeleteLog: (id: string) => Promise<void>;
};

const goalOptions: { value: NutritionGoal; label: string }[] = [
  { value: 'lose', label: 'Fett verlieren' },
  { value: 'maintain', label: 'Gewicht halten' },
  { value: 'gain', label: 'Muskeln aufbauen' },
];

const activityOptions: { value: ActivityLevel; label: string }[] = [
  { value: 'low', label: 'Wenig aktiv' },
  { value: 'light', label: 'Leicht aktiv' },
  { value: 'moderate', label: 'Aktiv' },
  { value: 'high', label: 'Sehr aktiv' },
];

const basisOptions: { value: FormulaBasis; label: string }[] = [
  { value: 'female', label: 'Weiblich' },
  { value: 'male', label: 'Männlich' },
  { value: 'average', label: 'Durchschnitt' },
];

export default function NutritionScreen({ profile, logs, inventory, onSaveProfile, onDisable, onAddLog, onDeleteLog }: NutritionScreenProps) {
  const [editingProfile, setEditingProfile] = useState(!profile?.enabled);
  const [age, setAge] = useState(profile?.age ? String(profile.age) : '');
  const [heightCm, setHeightCm] = useState(profile?.heightCm ? String(profile.heightCm) : '');
  const [weightKg, setWeightKg] = useState(profile?.weightKg ? String(profile.weightKg) : '');
  const [goal, setGoal] = useState<NutritionGoal>(profile?.goal || 'maintain');
  const [activity, setActivity] = useState<ActivityLevel>(profile?.activity || 'light');
  const [formulaBasis, setFormulaBasis] = useState<FormulaBasis>(profile?.formulaBasis || 'average');
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [foodName, setFoodName] = useState('');
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState('100');
  const [manualNutrition, setManualNutrition] = useState({ calories: '', protein: '', carbohydrates: '', fat: '' });
  const [scannerVisible, setScannerVisible] = useState(false);
  const [logError, setLogError] = useState('');

  const handleSaveProfile = async () => {
    const values = {
      age: Number.parseInt(age, 10),
      heightCm: Number.parseFloat(heightCm.replace(',', '.')),
      weightKg: Number.parseFloat(weightKg.replace(',', '.')),
      goal,
      activity,
      formulaBasis,
    };
    if (!Number.isFinite(values.age) || values.age < 18 || values.age > 99) {
      setFormError('Die Berechnung ist für Erwachsene ab 18 Jahren vorgesehen.');
      return;
    }
    if (!Number.isFinite(values.heightCm) || values.heightCm < 130 || values.heightCm > 230) {
      setFormError('Bitte gib eine Körpergröße zwischen 130 und 230 cm ein.');
      return;
    }
    if (!Number.isFinite(values.weightKg) || values.weightKg < 35 || values.weightKg > 300) {
      setFormError('Bitte gib ein Gewicht zwischen 35 und 300 kg ein.');
      return;
    }

    setSaving(true);
    setFormError('');
    try {
      await onSaveProfile({ ...values, targets: calculateMacroTargets(values) });
      setEditingProfile(false);
    } catch {
      setFormError('Dein Profil konnte nicht gespeichert werden. Bitte versuche es erneut.');
    } finally {
      setSaving(false);
    }
  };

  const selectFood = (food: any, source: string) => {
    setSelectedFood({ ...food, source });
    setFoodName(food.name);
    setManualNutrition({ calories: '', protein: '', carbohydrates: '', fat: '' });
    setLogError('');
  };

  const handleBarcode = async (barcode: string) => {
    try {
      const product = await lookupProductByBarcode(barcode);
      if (!product.name) throw new Error('Produktname fehlt');
      selectFood(product, 'Open Food Facts');
    } catch {
      setLogError('Für diesen Barcode konnten keine Produktdaten geladen werden.');
    }
  };

  const handleAddLog = async () => {
    const amount = Number.parseFloat(grams.replace(',', '.'));
    if (!selectedFood?.nutrition) {
      setLogError('Wähle ein Produkt mit verfügbaren Nährwerten aus.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) {
      setLogError('Bitte gib eine Menge zwischen 1 und 5000 g ein.');
      return;
    }

    try {
      await onAddLog({
        name: selectedFood.name,
        barcode: selectedFood.barcode || null,
        grams: amount,
        source: selectedFood.source,
        nutritionPer100g: selectedFood.nutrition,
        nutrients: scaleNutrition(selectedFood.nutrition, amount),
      });
      setFoodName('');
      setSelectedFood(null);
      setGrams('100');
      setLogError('');
    } catch {
      setLogError('Der Eintrag konnte nicht gespeichert werden.');
    }
  };

  const handleAddManualLog = async () => {
    const amount = Number.parseFloat(grams.replace(',', '.'));
    const per100g = Object.fromEntries(
      Object.entries(manualNutrition).map(([key, value]) => [
        key,
        value.trim() ? Number.parseFloat(value.replace(',', '.')) : null,
      ])
    ) as Record<string, number | null>;
    const providedValues = Object.values(per100g);
    if (!selectedFood?.name || !providedValues.some((value) => value !== null)) {
      setLogError('Gib mindestens einen Nährwert je 100 g ein.');
      return;
    }
    if (providedValues.some((value) => value !== null && (!Number.isFinite(value) || value < 0))) {
      setLogError('Nährwerte müssen gültige, nicht-negative Zahlen sein.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5000) {
      setLogError('Bitte gib eine Menge zwischen 1 und 5000 g ein.');
      return;
    }

    const facts = { ...per100g, fiber: null, sugars: null, salt: null, servingSize: null, source: 'Manuell' } as any;
    try {
      await onAddLog({
        name: selectedFood.name,
        barcode: selectedFood.barcode || null,
        grams: amount,
        source: 'Manuell',
        nutritionPer100g: facts,
        nutrients: scaleNutrition(facts, amount),
      });
      setFoodName('');
      setSelectedFood(null);
      setGrams('100');
      setManualNutrition({ calories: '', protein: '', carbohydrates: '', fat: '' });
      setLogError('');
    } catch {
      setLogError('Der Eintrag konnte nicht gespeichert werden.');
    }
  };

  if (editingProfile || !profile?.enabled) {
    return (
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Ernährungsziele</Text>
        <Text style={styles.intro}>Ein paar Angaben helfen, einen ungefähren Tagesbedarf zu berechnen. Sie werden getrennt vom geteilten Vorrat in deinem Nutzerkonto gespeichert.</Text>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deine Angaben</Text>
          <View style={styles.inputRow}>
            <NumberField label="Alter" value={age} onChange={setAge} suffix="Jahre" />
            <NumberField label="Größe" value={heightCm} onChange={setHeightCm} suffix="cm" />
            <NumberField label="Gewicht" value={weightKg} onChange={setWeightKg} suffix="kg" />
          </View>

          <OptionGroup title="Formelbasis für den Grundumsatz" options={basisOptions} value={formulaBasis} onChange={setFormulaBasis} />
          <OptionGroup title="Aktivitätslevel" options={activityOptions} value={activity} onChange={setActivity} />
          <OptionGroup title="Dein Ziel" options={goalOptions} value={goal} onChange={setGoal} />

          <Text style={styles.disclaimer}>Die Werte sind grobe Schätzungen für Erwachsene, keine medizinische Empfehlung. Bei Erkrankungen, Schwangerschaft oder besonderen Ernährungsbedürfnissen bitte fachlichen Rat einholen.</Text>
          {formError ? <Text style={styles.errorText}>{formError}</Text> : null}
          <TouchableOpacity style={styles.primaryButton} onPress={handleSaveProfile} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Ziele berechnen und aktivieren</Text>}
          </TouchableOpacity>
          {profile?.enabled ? (
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setEditingProfile(false)}>
              <Text style={styles.secondaryButtonText}>Abbrechen</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    );
  }

  const targets = profile.targets || calculateMacroTargets(profile);
  const totals = {
    calories: totalFor(logs, 'calories'),
    protein: totalFor(logs, 'protein'),
    carbohydrates: totalFor(logs, 'carbohydrates'),
    fat: totalFor(logs, 'fat'),
  };
  const inventoryFoods = Object.entries(inventory || {})
    .map(([id, item]) => ({ ...item, id }))
    .filter((item: any) => item.nutrition)
    .slice(0, 24) as any[];
  const selectedFacts = selectedFood?.nutrition;
  const amount = Number.parseFloat(grams.replace(',', '.'));
  const preview = selectedFacts && Number.isFinite(amount) && amount > 0 ? scaleNutrition(selectedFacts, amount) : null;
  const entries = Object.values(logs || {}).sort((first: any, second: any) => second.createdAt.localeCompare(first.createdAt)) as any[];

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.headingRow}>
        <View>
          <Text style={styles.title}>Ernährung</Text>
          <Text style={styles.intro}>Tagesübersicht · Ziel: {goalLabel(profile.goal)}</Text>
        </View>
        <TouchableOpacity onPress={() => setEditingProfile(true)} accessibilityLabel="Ernährungsziele bearbeiten">
          <Text style={styles.textAction}>Ziele bearbeiten</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.targetsGrid}>
        <TargetProgress label="Kalorien" unit="kcal" current={totals.calories} target={targets.calories} />
        <TargetProgress label="Protein" unit="g" current={totals.protein} target={targets.protein} />
        <TargetProgress label="Kohlenhydrate" unit="g" current={totals.carbohydrates} target={targets.carbohydrates} />
        <TargetProgress label="Fett" unit="g" current={totals.fat} target={targets.fat} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Lebensmittel protokollieren</Text>
        <FoodSearchInput
          value={foodName}
          onChangeText={(value: string) => {
            setFoodName(value);
            setSelectedFood(null);
          }}
          onSelect={(food: any) => selectFood(food, 'Open Food Facts')}
        />
        <TouchableOpacity style={styles.scanButton} onPress={() => setScannerVisible(true)}>
          <Text style={styles.scanButtonText}>Barcode scannen</Text>
        </TouchableOpacity>

        <Text style={styles.subTitle}>Aus deinem Vorrat</Text>
        {inventoryFoods.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foodChips}>
            {inventoryFoods.map((food) => (
              <TouchableOpacity key={food.id} style={[styles.foodChip, selectedFood?.id === food.id && styles.foodChipActive]} onPress={() => selectFood(food, 'Vorrat')}>
                {food.imageUrl ? <Image source={{ uri: food.imageUrl }} style={styles.foodImage} /> : null}
                <Text numberOfLines={1} style={styles.foodChipText}>{food.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.mutedText}>Noch keine Vorratsartikel mit Nährwerten. Suche ein Produkt oder scanne seinen Barcode.</Text>
        )}

        {selectedFood ? (
          <View style={styles.selectedFood}>
            <Text style={styles.selectedFoodName}>{selectedFood.name}</Text>
            {selectedFacts ? (
              <>
                <Text style={styles.mutedText}>Angaben je 100 g · {selectedFacts.source}</Text>
                <View style={styles.amountRow}>
                  <TextInput style={styles.gramsInput} value={grams} onChangeText={setGrams} keyboardType="decimal-pad" accessibilityLabel="Verzehrte Menge in Gramm" />
                  <Text style={styles.unitLabel}>g gegessen</Text>
                </View>
                {preview ? <Text style={styles.previewText}>{formatNumber(preview.calories)} kcal · {formatNumber(preview.protein)} g Protein · {formatNumber(preview.carbohydrates)} g Kohlenhydrate · {formatNumber(preview.fat)} g Fett</Text> : null}
                <TouchableOpacity style={styles.primaryButton} onPress={handleAddLog}>
                  <Text style={styles.primaryButtonText}>Zum Tagesprotokoll hinzufügen</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.mutedText}>Keine Nährwerte gefunden. Du kannst die Angaben vom Etikett je 100 g eintragen.</Text>
                <View style={styles.manualFields}>
                  <NumberField label="Kalorien" value={manualNutrition.calories} onChange={(value) => setManualNutrition({ ...manualNutrition, calories: value })} suffix="kcal" />
                  <NumberField label="Protein" value={manualNutrition.protein} onChange={(value) => setManualNutrition({ ...manualNutrition, protein: value })} suffix="g" />
                  <NumberField label="Kohlenhydrate" value={manualNutrition.carbohydrates} onChange={(value) => setManualNutrition({ ...manualNutrition, carbohydrates: value })} suffix="g" />
                  <NumberField label="Fett" value={manualNutrition.fat} onChange={(value) => setManualNutrition({ ...manualNutrition, fat: value })} suffix="g" />
                </View>
                <View style={styles.amountRow}>
                  <TextInput style={styles.gramsInput} value={grams} onChangeText={setGrams} keyboardType="decimal-pad" accessibilityLabel="Verzehrte Menge in Gramm" />
                  <Text style={styles.unitLabel}>g gegessen</Text>
                </View>
                <TouchableOpacity style={styles.primaryButton} onPress={handleAddManualLog}>
                  <Text style={styles.primaryButtonText}>Manuell zum Tagesprotokoll hinzufügen</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : null}
        {logError ? <Text style={styles.errorText}>{logError}</Text> : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Heute protokolliert</Text>
        {entries.length ? entries.map((entry) => (
          <View key={entry.id} style={styles.logRow}>
            <View style={styles.logDetails}>
              <Text style={styles.logName}>{entry.name}</Text>
              <Text style={styles.mutedText}>{entry.servings ? `${formatNumber(entry.servings)} Portion(en)` : `${formatNumber(entry.grams)} g`} · {formatNumber(entry.nutrients?.calories)} kcal · {formatNumber(entry.nutrients?.protein)} g Protein</Text>
            </View>
            <TouchableOpacity onPress={() => onDeleteLog(entry.id)} accessibilityLabel={`${entry.name} aus dem Protokoll entfernen`}>
              <Text style={styles.deleteAction}>Entfernen</Text>
            </TouchableOpacity>
          </View>
        )) : <Text style={styles.mutedText}>Noch keine Lebensmittel für heute protokolliert.</Text>}
      </View>

      <TouchableOpacity style={styles.disableButton} onPress={onDisable}>
        <Text style={styles.disableText}>Ernährung deaktivieren</Text>
      </TouchableOpacity>
      <Text style={styles.disclaimer}>Nährwerte stammen aus Open Food Facts und können fehlen oder ungenau sein. Protokolleinträge ändern den Vorratsbestand nicht.</Text>
      <BarcodeScannerModal visible={scannerVisible} onClose={() => setScannerVisible(false)} onBarcode={handleBarcode} />
    </ScrollView>
  );
}

function NumberField({ label, value, onChange, suffix }: { label: string; value: string; onChange: (value: string) => void; suffix: string }) {
  return (
    <View style={styles.numberField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.numberInputRow}>
        <TextInput style={styles.numberInput} value={value} onChangeText={onChange} keyboardType="decimal-pad" />
        <Text style={styles.suffix}>{suffix}</Text>
      </View>
    </View>
  );
}

function OptionGroup<T extends string>({ title, options, value, onChange }: { title: string; options: { value: T; label: string }[]; value: T; onChange: (value: T) => void }) {
  return (
    <View style={styles.optionGroup}>
      <Text style={styles.fieldLabel}>{title}</Text>
      <View style={styles.optionsRow}>
        {options.map((option) => (
          <TouchableOpacity key={option.value} style={[styles.option, value === option.value && styles.optionActive]} onPress={() => onChange(option.value)}>
            <Text style={[styles.optionText, value === option.value && styles.optionTextActive]}>{option.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function TargetProgress({ label, unit, current, target }: { label: string; unit: string; current: number | null; target: number }) {
  const percent = current === null ? 0 : Math.min(100, Math.round((current / target) * 100));
  return (
    <View style={styles.targetItem}>
      <View style={styles.targetLabelRow}>
        <Text style={styles.targetLabel}>{label}</Text>
        <Text style={styles.targetAmount}>{formatNumber(current)} / {target} {unit}</Text>
      </View>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${percent}%` }]} /></View>
    </View>
  );
}

function totalFor(logs: Record<string, any>, key: keyof MacroTargets): number | null {
  const values = Object.values(logs).map((entry) => entry?.nutrients?.[key]).filter((value) => Number.isFinite(value));
  return values.length ? values.reduce((total, value) => total + value, 0) : null;
}

function formatNumber(value: number | null | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? String(Math.round(value * 10) / 10) : '–';
}

function goalLabel(goal: NutritionGoal) {
  return goalOptions.find((option) => option.value === goal)?.label.toLowerCase() || goalOptions[1].label.toLowerCase();
}

const styles = StyleSheet.create({
  content: { backgroundColor: '#ede8D0', flexGrow: 1, padding: 20, paddingBottom: 36 },
  title: { color: '#263238', fontSize: 27, fontWeight: 'bold', marginBottom: 8 },
  intro: { color: '#657176', fontSize: 14, lineHeight: 21, marginBottom: 16 },
  headingRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  textAction: { color: '#06837d', fontSize: 13, fontWeight: '700', paddingTop: 8 },
  section: { backgroundColor: '#fff', borderRadius: 8, marginTop: 14, padding: 16 },
  sectionTitle: { color: '#263238', fontSize: 19, fontWeight: '700', marginBottom: 12 },
  subTitle: { color: '#263238', fontSize: 14, fontWeight: '700', marginTop: 10 },
  inputRow: { flexDirection: 'row', gap: 8 },
  numberField: { flex: 1, minWidth: 80 },
  fieldLabel: { color: '#48565a', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  numberInputRow: { alignItems: 'center', backgroundColor: '#fbfbf8', borderColor: '#d9dfdc', borderRadius: 6, borderWidth: 1, flexDirection: 'row', paddingHorizontal: 8 },
  numberInput: { color: '#263238', flex: 1, minWidth: 0, paddingVertical: 10 },
  suffix: { color: '#657176', fontSize: 12 },
  optionGroup: { marginTop: 16 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  option: { backgroundColor: '#f6f7f4', borderColor: '#d9dfdc', borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 9 },
  optionActive: { backgroundColor: '#e1f2f0', borderColor: '#06837d' },
  optionText: { color: '#48565a', fontSize: 12, fontWeight: '600' },
  optionTextActive: { color: '#006b65' },
  disclaimer: { color: '#687579', fontSize: 12, lineHeight: 18, marginTop: 14 },
  errorText: { color: '#a52c2c', fontSize: 13, lineHeight: 19, marginTop: 9 },
  primaryButton: { alignItems: 'center', backgroundColor: '#06837d', borderRadius: 7, marginTop: 14, minHeight: 46, justifyContent: 'center', paddingHorizontal: 14, paddingVertical: 12 },
  primaryButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  secondaryButton: { alignItems: 'center', borderColor: '#06837d', borderRadius: 7, borderWidth: 1, marginTop: 9, padding: 12 },
  secondaryButtonText: { color: '#06837d', fontWeight: '700' },
  targetsGrid: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 16 },
  targetItem: { borderBottomColor: '#edf0ed', borderBottomWidth: 1, paddingVertical: 13 },
  targetLabelRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginBottom: 8 },
  targetLabel: { color: '#263238', fontSize: 14, fontWeight: '700' },
  targetAmount: { color: '#536165', fontSize: 12, textAlign: 'right' },
  progressTrack: { backgroundColor: '#e7ece8', borderRadius: 5, height: 7, overflow: 'hidden' },
  progressFill: { backgroundColor: '#06837d', borderRadius: 5, height: 7 },
  scanButton: { alignItems: 'center', borderColor: '#06837d', borderRadius: 6, borderWidth: 1, marginTop: 2, padding: 11 },
  scanButtonText: { color: '#06837d', fontSize: 14, fontWeight: '700' },
  foodChips: { gap: 8, paddingVertical: 9 },
  foodChip: { alignItems: 'center', backgroundColor: '#f6f7f4', borderColor: '#d9dfdc', borderRadius: 6, borderWidth: 1, flexDirection: 'row', gap: 7, maxWidth: 180, paddingHorizontal: 9, paddingVertical: 8 },
  foodChipActive: { backgroundColor: '#e1f2f0', borderColor: '#06837d' },
  foodImage: { borderRadius: 4, height: 26, width: 26 },
  foodChipText: { color: '#334247', fontSize: 12, fontWeight: '600', flexShrink: 1 },
  mutedText: { color: '#687579', fontSize: 13, lineHeight: 19, marginTop: 4 },
  selectedFood: { borderTopColor: '#edf0ed', borderTopWidth: 1, marginTop: 12, paddingTop: 12 },
  selectedFoodName: { color: '#263238', fontSize: 16, fontWeight: '700' },
  amountRow: { alignItems: 'center', flexDirection: 'row', gap: 9, marginTop: 10 },
  manualFields: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  gramsInput: { backgroundColor: '#fbfbf8', borderColor: '#d9dfdc', borderRadius: 6, borderWidth: 1, color: '#263238', minWidth: 90, paddingHorizontal: 11, paddingVertical: 9 },
  unitLabel: { color: '#536165', fontSize: 13 },
  previewText: { color: '#334247', fontSize: 13, lineHeight: 20, marginTop: 10 },
  logRow: { alignItems: 'center', borderBottomColor: '#edf0ed', borderBottomWidth: 1, flexDirection: 'row', gap: 12, paddingVertical: 11 },
  logDetails: { flex: 1 },
  logName: { color: '#263238', fontSize: 14, fontWeight: '700' },
  deleteAction: { color: '#a52c2c', fontSize: 12, fontWeight: '600', padding: 5 },
  disableButton: { alignSelf: 'flex-start', marginTop: 18, paddingVertical: 9 },
  disableText: { color: '#a52c2c', fontSize: 13, fontWeight: '700' },
});