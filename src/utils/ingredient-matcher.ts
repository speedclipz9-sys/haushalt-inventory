export type IngredientForMatching = {
  name: string;
  quantity: number;
  unit: string;
};

export type InventoryFoodForMatching = {
  name: string;
  brand?: string | null;
  quantity: number;
  unit: string;
};

type UnitDimension = 'volume' | 'mass' | 'count';
type StockAmount = { dimension: UnitDimension; baseQuantity: number; factor: number };

type IngredientAliasGroup = {
  key: string;
  aliases: string[];
};

const aliasGroups: IngredientAliasGroup[] = [
  { key: 'olive-oil', aliases: ['extra virgin olive oil', 'natives olivenoel', 'natives olivenöl', 'olive oil', 'olivenoel', 'olivenöl'] },
  { key: 'vegetable-oil', aliases: ['vegetable oil', 'pflanzenoel', 'pflanzenöl', 'salatoel', 'salatöl'] },
  { key: 'cooking-spray', aliases: ['cooking spray', 'cooking oil spray', 'oelspray', 'ölspray', 'koch-oel spray'] },
  { key: 'margarine', aliases: ['soft margarine', 'tub margarine', 'margarine'] },
  { key: 'butter', aliases: ['butter', 'butterschmalz'] },
  { key: 'tomato-paste', aliases: ['tomato paste', 'tomatenmark'] },
  { key: 'tomato-sauce', aliases: ['tomato sauce', 'tomatensauce', 'tomatensoße'] },
  { key: 'tomato-juice', aliases: ['tomato juice', 'tomatensaft'] },
  { key: 'green-onion', aliases: ['green onion', 'spring onion', 'scallion', 'fruehlingszwiebel', 'frühlingszwiebel', 'lauchzwiebel'] },
  { key: 'red-onion', aliases: ['red onion', 'rote zwiebel'] },
  { key: 'onion', aliases: ['yellow onion', 'white onion', 'onion', 'zwiebel'] },
  { key: 'green-pepper', aliases: ['green bell pepper', 'green pepper', 'bell pepper', 'grune paprika', 'grüne paprika', 'paprika'] },
  { key: 'pimiento', aliases: ['pimiento', 'pimento', 'pimientos', 'pimentos', 'pimiento pepper'] },
  { key: 'chili-pepper', aliases: ['jalapeno', 'jalapeno pepper', 'jalapeño', 'chili pepper', 'chilli pepper', 'chili', 'chili schote'] },
  { key: 'chili-sauce', aliases: ['chili sauce', 'chilli sauce', 'hot pepper sauce', 'hot sauce', 'chilisauce', 'scharfe sauce'] },
  { key: 'black-pepper', aliases: ['black pepper', 'schwarzer pfeffer', 'pfeffer'] },
  { key: 'sweet-potato', aliases: ['sweet potato', 'susskartoffel', 'süßkartoffel'] },
  { key: 'potato', aliases: ['white potato', 'red potato', 'new potato', 'potato', 'kartoffel'] },
  { key: 'green-bean', aliases: ['green bean', 'green beans', 'string bean', 'string beans', 'grune bohne', 'grüne bohne', 'grune bohnen', 'grüne bohnen'] },
  { key: 'kidney-bean', aliases: ['kidney bean', 'kidney beans', 'red bean', 'red beans', 'kidneybohne', 'kidneybohnen', 'rote bohne', 'rote bohnen'] },
  { key: 'black-bean', aliases: ['black bean', 'black beans', 'schwarze bohne', 'schwarze bohnen'] },
  { key: 'northern-bean', aliases: ['great northern bean', 'great northern beans', 'white bean', 'white beans', 'weisse bohne', 'weiße bohne', 'weisse bohnen', 'weiße bohnen'] },
  { key: 'bean', aliases: ['beans', 'bean', 'bohne', 'bohnen'] },
  { key: 'mushroom', aliases: ['mushroom', 'mushrooms', 'champignon', 'champignons', 'pilz', 'pilze'] },
  { key: 'carrot', aliases: ['carrot', 'carrots', 'karotte', 'karotten', 'mohre', 'möhre', 'möhren'] },
  { key: 'celery', aliases: ['celery', 'sellerie'] },
  { key: 'garlic', aliases: ['garlic', 'knoblauch'] },
  { key: 'tomato', aliases: ['tomato', 'tomatoes', 'tomate', 'tomaten'] },
  { key: 'cabbage', aliases: ['cabbage', 'kohl', 'weisskohl', 'weißkohl', 'rotkohl'] },
  { key: 'spinach', aliases: ['spinach', 'spinat'] },
  { key: 'zucchini', aliases: ['zucchini', 'courgette'] },
  { key: 'eggplant', aliases: ['eggplant', 'aubergine'] },
  { key: 'chayote', aliases: ['chayote', 'mirliton', 'christophine', 'choko'] },
  { key: 'okra', aliases: ['okra', 'lady finger', 'ladies finger', 'bamya', 'gumbo'] },
  { key: 'tomatillo', aliases: ['tomatillo', 'tomatillos', 'mexican husk tomato', 'mexikanische physalis'] },
  { key: 'squash', aliases: ['summer squash', 'winter squash', 'yellow squash', 'butternut squash', 'kuerbis', 'kürbis'] },
  { key: 'turnip-greens', aliases: ['turnip greens', 'turnip tops', 'speiseruebe blaetter', 'ruebenblaetter'] },
  { key: 'mustard-greens', aliases: ['mustard greens', 'senfkohl', 'senfblaetter', 'senfblätter'] },
  { key: 'collard-greens', aliases: ['collard greens', 'collards', 'blattkohl', 'gruenkohl', 'grünkohl'] },
  { key: 'fennel', aliases: ['fennel', 'fenchel'] },
  { key: 'corn-kernel', aliases: ['corn kernels', 'whole kernel corn', 'sweet corn', 'mais', 'maiskorner', 'maiskörner'] },
  { key: 'cornmeal', aliases: ['cornmeal', 'corn flour', 'masa harina', 'corn grits', 'maismehl'] },
  { key: 'corn-flakes', aliases: ['corn flakes', 'cornflake crumbs', 'cornflake', 'cornflakes', 'cornflakes panade'] },
  { key: 'breadcrumbs', aliases: ['bread crumbs', 'breadcrumbs', 'bread crumb', 'paniermehl', 'semmelbroesel', 'semmelbrösel'] },
  { key: 'hominy', aliases: ['hominy', 'nixtamalized corn', 'nixtamalmais', 'maiz pozolero', 'mais pozolero'] },
  { key: 'flour', aliases: ['all purpose flour', 'plain flour', 'flour', 'mehl'] },
  { key: 'oat', aliases: ['rolled oats', 'oatmeal', 'oats', 'haferflocken'] },
  { key: 'rice', aliases: ['long grain rice', 'brown rice', 'white rice', 'rice', 'reis'] },
  { key: 'pasta', aliases: ['elbow macaroni', 'macaroni', 'spaghetti', 'fusilli', 'vermicelli', 'seashell pasta', 'shell pasta', 'lasagna noodles', 'pasta', 'nudeln'] },
  { key: 'milk', aliases: ['evaporated skim milk', 'skim milk', 'lowfat milk', 'low fat milk', 'milk', 'magermilch', 'fettarme milch', 'milch'] },
  { key: 'yogurt', aliases: ['plain yogurt', 'lowfat yogurt', 'yogurt', 'joghurt'] },
  { key: 'sour-cream', aliases: ['sour cream', 'saure sahne', 'saure sahne'] },
  { key: 'cottage-cheese', aliases: ['cottage cheese', 'hüttenkäse', 'huettenkaese', 'körniger frischkäse', 'koerniger frischkaese'] },
  { key: 'cream-cheese', aliases: ['cream cheese', 'frischkaese', 'frischkäse'] },
  { key: 'mozzarella', aliases: ['mozzarella'] },
  { key: 'cheddar', aliases: ['cheddar'] },
  { key: 'parmesan', aliases: ['parmesan', 'parmigiano'] },
  { key: 'cheese', aliases: ['cheese', 'kaese', 'käse'] },
  { key: 'chicken', aliases: ['chicken breast', 'chicken', 'haehnchen', 'hähnchen', 'huhn', 'hühnchen', 'gefluegel', 'geflügel'] },
  { key: 'turkey', aliases: ['ground turkey', 'turkey breast', 'turkey', 'pute', 'truthahn'] },
  { key: 'beef', aliases: ['ground beef', 'beef stew meat', 'beef', 'rindfleisch', 'rind'] },
  { key: 'pork', aliases: ['pork chop', 'pork', 'schweinefleisch', 'schwein'] },
  { key: 'lamb', aliases: ['lamb', 'lammfleisch', 'lamm'] },
  { key: 'veal', aliases: ['veal', 'kalbfleisch', 'kalb'] },
  { key: 'salmon', aliases: ['salmon', 'lachs'] },
  { key: 'trout', aliases: ['trout', 'forelle'] },
  { key: 'cod', aliases: ['cod', 'kabeljau', 'dorsch'] },
  { key: 'haddock', aliases: ['haddock', 'schellfisch'] },
  { key: 'white-fish', aliases: ['white fish', 'sole', 'flounder', 'sea perch', 'whitefish', 'weissfisch', 'weißfisch'] },
  { key: 'fish', aliases: ['fish', 'fisch'] },
  { key: 'shrimp', aliases: ['shrimp', 'prawn', 'garnelen', 'garnele'] },
  { key: 'scallop', aliases: ['scallop', 'scallops', 'jakobsmuschel', 'jakobsmuscheln'] },
  { key: 'clam-juice', aliases: ['clam juice', 'clam broth', 'muschelsaft', 'venusmuschelsaft'] },
  { key: 'tuna', aliases: ['tuna', 'thunfisch'] },
  { key: 'banana', aliases: ['banana', 'bananas', 'banane', 'bananen'] },
  { key: 'mango', aliases: ['mango', 'mangos'] },
  { key: 'apple', aliases: ['apple', 'apples', 'apfel', 'aepfel', 'äpfel'] },
  { key: 'blueberry', aliases: ['blueberry', 'blueberries', 'heidelbeere', 'heidelbeeren', 'blaubeere', 'blaubeeren'] },
  { key: 'strawberry', aliases: ['strawberry', 'strawberries', 'erdbeere', 'erdbeeren'] },
  { key: 'grape', aliases: ['grape', 'grapes', 'weintraube', 'weintrauben', 'traube', 'trauben'] },
  { key: 'peach', aliases: ['peach', 'peaches', 'pfirsich', 'pfirsiche'] },
  { key: 'nectarine', aliases: ['nectarine', 'nectarines', 'nektarine', 'nektarinen'] },
  { key: 'kiwi', aliases: ['kiwi', 'kiwifrucht'] },
  { key: 'pineapple', aliases: ['pineapple', 'ananas'] },
  { key: 'lemon', aliases: ['lemon juice', 'lemon', 'zitrone', 'zitronensaft'] },
  { key: 'lime', aliases: ['lime juice', 'lime', 'limette', 'limettensaft'] },
  { key: 'orange', aliases: ['orange juice', 'orange', 'orange juice', 'orange', 'orange juice'] },
  { key: 'raisin', aliases: ['raisin', 'raisins', 'rosine', 'rosinen'] },
  { key: 'cranberry', aliases: ['cranberry', 'cranberries', 'cranberrys'] },
  { key: 'apricot', aliases: ['apricot', 'apricots', 'aprikose', 'aprikosen'] },
  { key: 'plantain', aliases: ['plantain', 'plantains', 'cooking banana', 'kochbanane', 'kochbananen'] },
  { key: 'mango-juice', aliases: ['mango juice', 'mangosaft'] },
  { key: 'pecan', aliases: ['pecan', 'pecans', 'pekannuss', 'pekannusse', 'pekannüsse'] },
  { key: 'almond', aliases: ['almond', 'almonds', 'mandel', 'mandeln'] },
  { key: 'parsley', aliases: ['parsley', 'petersilie'] },
  { key: 'cilantro', aliases: ['cilantro', 'coriander leaves', 'coriander', 'koriander'] },
  { key: 'basil', aliases: ['basil', 'basilikum'] },
  { key: 'oregano', aliases: ['oregano', 'oregano'] },
  { key: 'thyme', aliases: ['thyme', 'thymian'] },
  { key: 'rosemary', aliases: ['rosemary', 'rosmarin'] },
  { key: 'sage', aliases: ['sage', 'salbei'] },
  { key: 'dill', aliases: ['dill', 'dillkraut'] },
  { key: 'chives', aliases: ['chive', 'chives', 'schnittlauch'] },
  { key: 'mint', aliases: ['mint', 'spearmint', 'minze'] },
  { key: 'annatto', aliases: ['annatto', 'achiote', 'annato', 'annattosamen'] },
  { key: 'hominy-corn-flour', aliases: ['instant corn flour', 'corn masa flour', 'instant masa harina'] },
  { key: 'bay-leaf', aliases: ['bay leaf', 'bay leaves', 'lorbeerblatt', 'lorbeerblaetter', 'lorbeerblätter'] },
  { key: 'clove-spice', aliases: ['ground cloves', 'whole cloves', 'cloves', 'nelken', 'gewuerznelke', 'gewürznelke'] },
  { key: 'nutmeg', aliases: ['nutmeg', 'muskatnuss'] },
  { key: 'vanilla', aliases: ['vanilla extract', 'vanilla', 'vanilleextrakt', 'vanille'] },
  { key: 'wine', aliases: ['dry white wine', 'white wine', 'red wine', 'marsala wine', 'sherry', 'wein', 'marsala'] },
  { key: 'rum', aliases: ['rum', 'rum aroma'] },
  { key: 'vegetable-juice', aliases: ['vegetable juice', 'vegetable juice cocktail', 'gemuesesaft', 'gemüsesaft'] },
  { key: 'ginger', aliases: ['ginger', 'ingwer'] },
  { key: 'cinnamon', aliases: ['cinnamon', 'zimt'] },
  { key: 'sugar', aliases: ['brown sugar', 'white sugar', 'sugar', 'zucker'] },
  { key: 'honey', aliases: ['honey', 'honig'] },
  { key: 'vinegar', aliases: ['cider vinegar', 'white vinegar', 'wine vinegar', 'vinegar', 'essig'] },
  { key: 'salt', aliases: ['salt', 'salz'] },
  { key: 'egg', aliases: ['egg white', 'egg yolk', 'eggs', 'egg', 'ei', 'eier'] },
  { key: 'mayonnaise', aliases: ['mayonnaise', 'mayo'] },
  { key: 'tomato-product', aliases: ['tomato ketchup', 'ketchup'] },
  { key: 'broth', aliases: ['chicken broth', 'chicken stock', 'beef broth', 'vegetable broth', 'broth', 'bruehe', 'brühe', 'fond'] },
  { key: 'water', aliases: ['water', 'wasser'] },
];

const descriptorWords = new Set([
  'fresh', 'dried', 'ground', 'minced', 'chopped', 'sliced', 'diced', 'peeled', 'seeded',
  'cooked', 'uncooked', 'raw', 'frozen', 'canned', 'lean', 'skinless', 'boneless', 'lowfat',
  'low', 'fat', 'free', 'plain', 'small', 'medium', 'large', 'whole', 'grated', 'crushed',
  'coarsely', 'finely', 'soft', 'sweet', 'red', 'green', 'white', 'yellow', 'black', 'dry',
  'unsweetened', 'nonfat', 'part', 'skim', 'packed', 'optional', 'taste', 'each',
]);

const aliasLookup = aliasGroups.flatMap((group) => group.aliases.map((alias) => ({ key: group.key, alias: normalizeFoodName(alias) })))
  .sort((first, second) => second.alias.length - first.alias.length);

export function normalizeFoodName(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function canonicalIngredient(value: string) {
  const normalized = normalizeFoodName(value);
  const alias = aliasLookup.find(({ alias }) => ` ${normalized} `.includes(` ${alias} `));
  if (alias) return { key: alias.key, specificity: 2 };

  const tokens = normalized.split(' ')
    .filter((token) => token && !descriptorWords.has(token) && !/^\d+$/.test(token))
    .map((token) => token.length > 4 && token.endsWith('s') ? token.slice(0, -1) : token);
  return tokens.length ? { key: tokens.join(' '), specificity: 1 } : null;
}

export function ingredientsMatch(recipeName: string, inventoryFood: InventoryFoodForMatching) {
  const recipeKey = canonicalIngredient(recipeName);
  if (!recipeKey) return false;
  const inventoryName = `${inventoryFood.name || ''} ${inventoryFood.brand || ''}`;
  const inventoryKey = canonicalIngredient(inventoryName);
  if (!inventoryKey) return false;
  if (recipeKey.specificity === 2 || inventoryKey.specificity === 2) {
    return recipeKey.specificity === 2 && inventoryKey.specificity === 2 && recipeKey.key === inventoryKey.key;
  }

  const recipeTokens = new Set(recipeKey.key.split(' '));
  const inventoryTokens = new Set(inventoryKey.key.split(' '));
  const shared = [...recipeTokens].filter((token) => inventoryTokens.has(token));
  return shared.length > 0 && (shared.length / recipeTokens.size >= 0.6 || shared.length / inventoryTokens.size >= 0.6);
}

function unitKey(unit: string): string {
  return normalizeFoodName(unit).replace(/s$/, '');
}

export function toBaseStockAmount(quantity: number, unit: string): StockAmount | null {
  const key = unitKey(unit);
  const volumeFactors: Record<string, number> = {
    l: 1000,
    liter: 1000,
    litre: 1000,
    ml: 1,
    milliliter: 1,
    millilitre: 1,
    el: 15,
    tablespoon: 15,
    tbsp: 15,
    tl: 5,
    teaspoon: 5,
    tsp: 5,
    tasse: 240,
    cup: 240,
    pint: 473.176,
    quart: 946.353,
  };
  const massFactors: Record<string, number> = {
    g: 1,
    gram: 1,
    kg: 1000,
    kilogram: 1000,
    lb: 453.592,
    lbs: 453.592,
    oz: 28.3495,
    ounce: 28.3495,
  };
  const countUnits = new Set(['stuck', 'piece', 'each', 'dose', 'packung', 'glas', 'zehe', 'kopf', 'stange', 'bund', 'scheibe', 'pack', 'pride']);

  if (volumeFactors[key]) return { dimension: 'volume', baseQuantity: quantity * volumeFactors[key], factor: volumeFactors[key] };
  if (massFactors[key]) return { dimension: 'mass', baseQuantity: quantity * massFactors[key], factor: massFactors[key] };
  if (countUnits.has(key)) return { dimension: 'count', baseQuantity: quantity, factor: 1 };
  return null;
}

export function inventoryCoverage(ingredient: IngredientForMatching, inventory: InventoryFoodForMatching[]) {
  const matches = inventory.filter((item) => ingredientsMatch(ingredient.name, item));
  if (!matches.length) return null;

  const requested = toBaseStockAmount(ingredient.quantity, ingredient.unit);
  const comparable = requested
    ? matches.map((item) => toBaseStockAmount(Number(item.quantity), item.unit)).filter((amount) => amount?.dimension === requested.dimension)
    : [];
  const availableBase = comparable.reduce((total, amount) => total + (amount?.baseQuantity || 0), 0);

  if (!requested || !comparable.length) {
    return {
      matches,
      hasComparableUnits: false,
      availableDescription: matches.map((item) => `${item.quantity} ${item.unit}`).join(', '),
      missingQuantity: ingredient.quantity,
      enough: false,
    };
  }

  const missingBase = Math.max(0, requested.baseQuantity - availableBase);
  return {
    matches,
    hasComparableUnits: true,
    availableDescription: `${Math.round(availableBase * 10) / 10} ${baseUnitLabel(requested.dimension)}`,
    missingQuantity: Math.round((missingBase / requested.factor) * 10) / 10,
    enough: missingBase <= 0.0001,
  };
}

function baseUnitLabel(dimension: UnitDimension) {
  if (dimension === 'volume') return 'ml';
  if (dimension === 'mass') return 'g';
  return 'Stück';
}