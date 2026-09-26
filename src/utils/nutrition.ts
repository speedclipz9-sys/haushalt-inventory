export type NutritionFacts = {
  calories: number | null;
  protein: number | null;
  carbohydrates: number | null;
  fat: number | null;
  fiber: number | null;
  sugars: number | null;
  salt: number | null;
  servingSize: string | null;
  source: string;
};

export type NutritionGoal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'low' | 'light' | 'moderate' | 'high';
export type FormulaBasis = 'female' | 'male' | 'average';

export type NutritionProfile = {
  age: number;
  heightCm: number;
  weightKg: number;
  goal: NutritionGoal;
  activity: ActivityLevel;
  formulaBasis: FormulaBasis;
};

export type MacroTargets = {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
};

const numberFrom = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
};

export function normalizeNutrition(product: any): NutritionFacts | null {
  const values = product?.nutriments || {};
  const energyKcal = numberFrom(values['energy-kcal_100g']);
  const energyKj = numberFrom(values['energy-kj_100g'] ?? values['energy_100g']);
  const facts = {
    calories: energyKcal ?? (energyKj === null ? null : Math.round(energyKj / 4.184)),
    protein: numberFrom(values.proteins_100g),
    carbohydrates: numberFrom(values.carbohydrates_100g),
    fat: numberFrom(values.fat_100g),
    fiber: numberFrom(values.fiber_100g),
    sugars: numberFrom(values.sugars_100g),
    salt: numberFrom(values.salt_100g),
    servingSize: product?.serving_size || null,
    source: 'Open Food Facts',
  };

  return Object.values(facts).some((value) => typeof value === 'number') ? facts : null;
}

export function scaleNutrition(facts: NutritionFacts, grams: number) {
  const factor = grams / 100;
  return {
    calories: facts.calories === null ? null : facts.calories * factor,
    protein: facts.protein === null ? null : facts.protein * factor,
    carbohydrates: facts.carbohydrates === null ? null : facts.carbohydrates * factor,
    fat: facts.fat === null ? null : facts.fat * factor,
  };
}

export function calculateMacroTargets(profile: NutritionProfile): MacroTargets {
  const basisOffset = profile.formulaBasis === 'male' ? 5 : profile.formulaBasis === 'female' ? -161 : -78;
  const basalCalories = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + basisOffset;
  const activityMultipliers: Record<ActivityLevel, number> = {
    low: 1.2,
    light: 1.375,
    moderate: 1.55,
    high: 1.725,
  };
  const goalMultipliers: Record<NutritionGoal, number> = { lose: 0.9, maintain: 1, gain: 1.05 };
  const calories = Math.round(basalCalories * activityMultipliers[profile.activity] * goalMultipliers[profile.goal]);
  const protein = Math.round(profile.weightKg * (profile.goal === 'gain' ? 1.8 : 1.6));
  const fat = Math.round(profile.weightKg * 0.8);
  const carbohydrates = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));

  return { calories, protein, carbohydrates, fat };
}

export function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}