import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { NHLBI_RECIPES, type Recipe } from '../data/nhlbi-recipes';
import { inventoryCoverage, type InventoryFoodForMatching, type IngredientForMatching } from '../utils/ingredient-matcher';

type RecipeScreenProps = {
  favoriteIds: Record<string, boolean>;
  nutritionEnabled: boolean;
  inventory: Record<string, InventoryFoodForMatching>;
  addToShoppingList: (...args: any[]) => Promise<void>;
  toggleFavorite: (recipeId: string) => Promise<void>;
  logNutrition: (entry: any) => Promise<void>;
};

const filters = ['Alle', 'Vegetarisch', 'Fisch', 'Favoriten'];

type StockConfirmation = {
  ingredient: IngredientForMatching;
  itemName: string;
  availableDescription: string;
  hasComparableUnits: boolean;
  enough: boolean;
  quantityToAdd: number;
};

export default function RecipeScreen({ favoriteIds, nutritionEnabled, inventory, addToShoppingList, toggleFavorite, logNutrition }: RecipeScreenProps) {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Alle');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [portions, setPortions] = useState('1');
  const [working, setWorking] = useState(false);
  const [stockConfirmations, setStockConfirmations] = useState<StockConfirmation[]>([]);
  const [stockConfirmationIndex, setStockConfirmationIndex] = useState(0);

  const visibleRecipes = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return NHLBI_RECIPES.filter((recipe) => {
      const matchesSearch = !search || `${recipe.name} ${recipe.category} ${recipe.ingredients.map((item) => `${item.name} ${item.amount}`).join(' ')}`.toLocaleLowerCase().includes(search);
      const matchesFilter = activeFilter === 'Alle'
        || recipe.category === activeFilter
        || (activeFilter === 'Favoriten' && Boolean(favoriteIds[recipe.id]));
      return matchesSearch && matchesFilter;
    });
  }, [activeFilter, favoriteIds, query]);

  const plannedPortions = Math.min(48, Math.max(1, Number.parseFloat(portions.replace(',', '.')) || 1));
  const quantityFactor = selectedRecipe?.scalable === false
    ? 1
    : plannedPortions / Math.max(selectedRecipe?.servings || 1, 1);

  const handleAddIngredients = async () => {
    if (!selectedRecipe || working) return;
    setWorking(true);
    try {
      const pantryItems = Object.values(inventory || {});
      const unstockedIngredients: IngredientForMatching[] = [];
      const matchedIngredients: StockConfirmation[] = [];

      for (const ingredient of selectedRecipe.ingredients) {
        const requestedIngredient = {
          name: ingredient.name,
          quantity: ingredient.quantity * quantityFactor,
          unit: ingredient.unit,
        };
        const coverage = inventoryCoverage(requestedIngredient, pantryItems);
        if (!coverage) {
          unstockedIngredients.push(requestedIngredient);
          continue;
        }

        matchedIngredients.push({
          ingredient: requestedIngredient,
          itemName: coverage.matches[0].name,
          availableDescription: coverage.availableDescription,
          hasComparableUnits: coverage.hasComparableUnits,
          enough: coverage.enough,
          quantityToAdd: coverage.enough || !coverage.hasComparableUnits
            ? requestedIngredient.quantity
            : coverage.missingQuantity,
        });
      }

      await Promise.all(unstockedIngredients.map((ingredient) => (
        addToShoppingList(ingredient.name, ingredient.quantity, 0, ingredient.unit, '', null)
      )));

      if (matchedIngredients.length) {
        setStockConfirmations(matchedIngredients);
        setStockConfirmationIndex(0);
      } else {
        Alert.alert('Einkaufsliste', 'Die benötigten Rezeptzutaten wurden hinzugefügt.');
      }
    } catch {
      Alert.alert('Fehler', 'Die Zutaten konnten nicht vollständig verarbeitet werden.');
    } finally {
      setWorking(false);
    }
  };

  const decideStockConfirmation = async (addAnyway: boolean) => {
    const confirmation = stockConfirmations[stockConfirmationIndex];
    if (!confirmation || working) return;

    setWorking(true);
    try {
      if (addAnyway) {
        await addToShoppingList(
          confirmation.ingredient.name,
          confirmation.quantityToAdd,
          0,
          confirmation.ingredient.unit,
          '',
          null
        );
      }

      if (stockConfirmationIndex + 1 < stockConfirmations.length) {
        setStockConfirmationIndex(stockConfirmationIndex + 1);
      } else {
        setStockConfirmations([]);
        setStockConfirmationIndex(0);
      }
    } catch {
      Alert.alert('Fehler', 'Der Artikel konnte nicht zur Einkaufsliste hinzugefügt werden.');
    } finally {
      setWorking(false);
    }
  };

  const handleLogServing = async () => {
    if (!selectedRecipe || working) return;
    setWorking(true);
    try {
      await logNutrition({
        name: selectedRecipe.name,
        servings: 1,
        source: 'NHLBI',
        nutrients: {
          calories: selectedRecipe.calories,
          protein: selectedRecipe.protein,
          carbohydrates: selectedRecipe.carbohydrates,
          fat: selectedRecipe.fat,
        },
      });
      Alert.alert('Ernährung', '1 Portion im Tagesprotokoll gespeichert.');
    } catch {
      Alert.alert('Fehler', 'Die Portion konnte nicht protokolliert werden.');
    } finally {
      setWorking(false);
    }
  };

  if (selectedRecipe) {
    const favorite = Boolean(favoriteIds[selectedRecipe.id]);
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.detailContent} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => setSelectedRecipe(null)}>
          <Text style={styles.backText}>Zurück zu Rezepten</Text>
        </TouchableOpacity>
        <View style={styles.detailHeading}>
          <View style={styles.headingText}>
            <Text style={styles.title}>{selectedRecipe.name}</Text>
            <Text style={styles.category}>{selectedRecipe.category} · {yieldLabel(selectedRecipe)}</Text>
          </View>
          <TouchableOpacity onPress={() => toggleFavorite(selectedRecipe.id)} accessibilityLabel={favorite ? 'Favorit entfernen' : 'Als Favorit speichern'}>
            <Text style={styles.favoriteButton}>{favorite ? '★' : '☆'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.macroPanel}>
          <Text style={styles.sectionTitle}>Nährwerte pro Portion</Text>
          <View style={styles.macroGrid}>
            <Macro label="Kalorien" value={`${selectedRecipe.calories} kcal`} />
            <Macro label="Protein" value={`${selectedRecipe.protein} g`} />
            <Macro label="Kohlenhydrate" value={`${selectedRecipe.carbohydrates} g`} />
            <Macro label="Fett" value={`${selectedRecipe.fat} g`} />
          </View>
        </View>

        {selectedRecipe.scalable === false ? null : (
          <View style={styles.portionRow}>
            <Text style={styles.sectionTitle}>Portionen</Text>
            <TextInput style={styles.portionInput} value={portions} onChangeText={setPortions} keyboardType="decimal-pad" accessibilityLabel="Geplante Portionen zum Kochen" />
            <Text style={styles.mutedText}>zum Kochen</Text>
          </View>
        )}

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Zutaten</Text>
          {selectedRecipe.ingredients.map((ingredient, index) => (
            <View key={`${selectedRecipe.id}-${index}`} style={styles.ingredientRow}>
              <Text style={styles.ingredientAmount}>{selectedRecipe.scalable === false ? ingredient.amount : `${formatQuantity(ingredient.quantity * quantityFactor)} ${ingredient.unit}`}</Text>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
            </View>
          ))}
          <TouchableOpacity style={styles.primaryButton} onPress={handleAddIngredients} disabled={working}>
            <Text style={styles.primaryButtonText}>Zutaten zur Einkaufsliste</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.detailSection}>
          <Text style={styles.sectionTitle}>Zubereitung</Text>
          {selectedRecipe.instructions.map((instruction, index) => (
            <View key={`${selectedRecipe.id}-step-${index}`} style={styles.instructionRow}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>

        {nutritionEnabled ? (
          <TouchableOpacity style={styles.logButton} onPress={handleLogServing} disabled={working}>
            <Text style={styles.logButtonText}>Portion in Makros protokollieren</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.sourceNote}>Recipe source: National Heart, Lung, and Blood Institute (NHLBI).</Text>
      </ScrollView>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.listHeader}>
        <Text style={styles.title}>Rezepte</Text>
        <Text style={styles.intro}>Suche nach Rezept oder Zutat.</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rezept oder Zutat suchen"
          value={query}
          onChangeText={setQuery}
          accessibilityLabel="Rezepte durchsuchen"
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {filters.map((filter) => (
            <TouchableOpacity key={filter} style={[styles.filterButton, activeFilter === filter && styles.filterButtonActive]} onPress={() => setActiveFilter(filter)}>
              <Text style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <FlatList
        data={visibleRecipes}
        keyExtractor={(recipe) => recipe.id}
        contentContainerStyle={styles.recipeList}
        ListEmptyComponent={<Text style={styles.emptyText}>Keine passenden Rezepte gefunden.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.recipeCard} onPress={() => { setSelectedRecipe(item); setPortions(String(item.scalable === false ? 1 : item.servings)); }}>
            <View style={styles.recipeCardHeading}>
              <View style={styles.recipeCardText}>
                <Text style={styles.recipeName}>{item.name}</Text>
                <Text style={styles.category}>{item.category} · {yieldLabel(item)}</Text>
              </View>
              {favoriteIds[item.id] ? <Text style={styles.favoriteMark}>★</Text> : null}
            </View>
            <View style={styles.recipeMacros}>
              <Text style={styles.recipeMacro}>{item.calories} kcal</Text>
              <Text style={styles.recipeMacro}>{item.protein} g Protein</Text>
              <Text style={styles.recipeMacro}>{item.carbohydrates} g KH</Text>
              <Text style={styles.recipeMacro}>{item.fat} g Fett</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      <Text style={styles.listSource}>Recipes courtesy of the National Heart, Lung, and Blood Institute (NHLBI).</Text>
      <Modal
        visible={Boolean(stockConfirmations[stockConfirmationIndex])}
        transparent
        animationType="fade"
        onRequestClose={() => decideStockConfirmation(false)}
      >
        <View style={styles.confirmBackdrop}>
          <View style={styles.confirmCard}>
            <Text style={styles.confirmTitle}>Dieses Lebensmittel ist im Vorrat vorhanden.</Text>
            {stockConfirmations[stockConfirmationIndex] ? (
              <Text style={styles.confirmText}>
                {stockConfirmations[stockConfirmationIndex].itemName}: {stockConfirmations[stockConfirmationIndex].availableDescription} im Vorrat.
                {!stockConfirmations[stockConfirmationIndex].enough && stockConfirmations[stockConfirmationIndex].hasComparableUnits
                  ? ` Es fehlen noch ${formatQuantity(stockConfirmations[stockConfirmationIndex].quantityToAdd)} ${stockConfirmations[stockConfirmationIndex].ingredient.unit}.`
                  : !stockConfirmations[stockConfirmationIndex].hasComparableUnits
                    ? ' Die Einheiten lassen sich nicht sicher umrechnen.'
                    : ''}
                {'\n'}Trotzdem auf die Einkaufsliste packen?
              </Text>
            ) : null}
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.skipButton} onPress={() => decideStockConfirmation(false)}>
                <Text style={styles.skipButtonText}>Überspringen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={() => decideStockConfirmation(true)}>
                <Text style={styles.confirmButtonText}>
                  {stockConfirmations[stockConfirmationIndex]?.hasComparableUnits && !stockConfirmations[stockConfirmationIndex]?.enough
                    ? 'Fehlmenge hinzufügen'
                    : 'Trotzdem hinzufügen'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{value}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function formatQuantity(quantity: number) {
  return String(Math.round(quantity * 10) / 10);
}

function yieldLabel(recipe: Recipe) {
  return recipe.yieldDescription || `${recipe.servings} Portionen`;
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#ede8D0', flex: 1 },
  listHeader: { paddingHorizontal: 18, paddingTop: 18 },
  title: { color: '#263238', fontSize: 26, fontWeight: '800' },
  intro: { color: '#687579', fontSize: 13, marginTop: 5 },
  searchInput: { backgroundColor: '#fff', borderColor: '#d9dfdc', borderRadius: 7, borderWidth: 1, color: '#263238', marginTop: 14, paddingHorizontal: 12, paddingVertical: 11 },
  filterRow: { gap: 8, paddingVertical: 12 },
  filterButton: { backgroundColor: '#fff', borderColor: '#d9dfdc', borderRadius: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 8 },
  filterButtonActive: { backgroundColor: '#e1f2f0', borderColor: '#06837d' },
  filterText: { color: '#536165', fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: '#006b65' },
  recipeList: { gap: 10, paddingHorizontal: 18, paddingBottom: 14 },
  recipeCard: { backgroundColor: '#fff', borderRadius: 8, padding: 15 },
  recipeCardHeading: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  recipeCardText: { flex: 1 },
  recipeName: { color: '#263238', fontSize: 16, fontWeight: '700' },
  category: { color: '#687579', fontSize: 12, marginTop: 4 },
  favoriteMark: { color: '#b27a13', fontSize: 20 },
  recipeMacros: { borderTopColor: '#edf0ed', borderTopWidth: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12, paddingTop: 10 },
  recipeMacro: { color: '#46575a', fontSize: 11, fontWeight: '600' },
  emptyText: { color: '#687579', fontSize: 14, padding: 20, textAlign: 'center' },
  listSource: { color: '#687579', fontSize: 10, paddingBottom: 8, paddingHorizontal: 18, textAlign: 'center' },
  detailContent: { padding: 18, paddingBottom: 30 },
  backButton: { alignSelf: 'flex-start', paddingBottom: 12, paddingRight: 8, paddingTop: 4 },
  backText: { color: '#06837d', fontSize: 13, fontWeight: '700' },
  detailHeading: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  headingText: { flex: 1 },
  favoriteButton: { color: '#b27a13', fontSize: 28, lineHeight: 32, paddingHorizontal: 4 },
  macroPanel: { backgroundColor: '#fff', borderRadius: 8, marginTop: 16, padding: 15 },
  sectionTitle: { color: '#263238', fontSize: 17, fontWeight: '700' },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  macroItem: { backgroundColor: '#f4f6f3', borderRadius: 6, flexBasis: '47%', flexGrow: 1, minWidth: 0, padding: 10 },
  macroValue: { color: '#06837d', fontSize: 16, fontWeight: '800' },
  macroLabel: { color: '#687579', fontSize: 11, marginTop: 3 },
  portionRow: { alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 16 },
  portionInput: { backgroundColor: '#fff', borderColor: '#d9dfdc', borderRadius: 6, borderWidth: 1, color: '#263238', minWidth: 64, paddingHorizontal: 10, paddingVertical: 8, textAlign: 'center' },
  mutedText: { color: '#687579', fontSize: 12 },
  detailSection: { backgroundColor: '#fff', borderRadius: 8, marginTop: 14, padding: 15 },
  ingredientRow: { borderBottomColor: '#edf0ed', borderBottomWidth: 1, flexDirection: 'row', gap: 10, paddingVertical: 9 },
  ingredientAmount: { color: '#536165', fontSize: 12, fontWeight: '700', minWidth: 92 },
  ingredientName: { color: '#263238', flex: 1, fontSize: 13, lineHeight: 19 },
  primaryButton: { alignItems: 'center', backgroundColor: '#06837d', borderRadius: 7, marginTop: 13, padding: 12 },
  primaryButtonText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  instructionRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  stepNumber: { color: '#06837d', fontSize: 14, fontWeight: '800', width: 20 },
  instructionText: { color: '#36474b', flex: 1, fontSize: 13, lineHeight: 20 },
  logButton: { alignItems: 'center', backgroundColor: '#405b9b', borderRadius: 7, marginTop: 14, padding: 13 },
  logButtonText: { color: '#fff', fontSize: 13, fontWeight: '700', textAlign: 'center' },
  sourceNote: { color: '#687579', fontSize: 11, lineHeight: 16, marginTop: 18, textAlign: 'center' },
  confirmBackdrop: { alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.48)', flex: 1, justifyContent: 'center', padding: 20 },
  confirmCard: { backgroundColor: '#fff', borderRadius: 8, maxWidth: 440, padding: 20, width: '100%' },
  confirmTitle: { color: '#263238', fontSize: 18, fontWeight: '800', lineHeight: 24 },
  confirmText: { color: '#536165', fontSize: 14, lineHeight: 21, marginTop: 10 },
  confirmActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'flex-end', marginTop: 18 },
  skipButton: { alignItems: 'center', borderColor: '#cfd8d3', borderRadius: 6, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  skipButtonText: { color: '#536165', fontSize: 13, fontWeight: '700' },
  confirmButton: { alignItems: 'center', backgroundColor: '#06837d', borderRadius: 6, paddingHorizontal: 14, paddingVertical: 10 },
  confirmButtonText: { color: '#fff', fontSize: 13, fontWeight: '700' },
});