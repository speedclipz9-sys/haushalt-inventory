import { NHLBI_RECIPES_FULL } from './nhlbi-recipes-full';

export type RecipeIngredient = {
  name: string;
  amount: string;
  quantity: number;
  unit: string;
};

export type Recipe = {
  id: string;
  name: string;
  category: string;
  servings: number;
  servingSize: string;
  yieldDescription?: string;
  scalable?: boolean;
  sourcePage?: number;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
};

const CURATED_NHLBI_RECIPES: Recipe[] = [
  {
    id: 'corn-chowder',
    name: 'Corn Chowder',
    category: 'Suppen',
    servings: 4,
    servingSize: '1 Tasse',
    calories: 186,
    protein: 7,
    carbohydrates: 31,
    fat: 5,
    ingredients: [
      { name: 'Pflanzenöl', amount: '1 EL', quantity: 1, unit: 'EL' },
      { name: 'Sellerie', amount: '2 EL, fein gewürfelt', quantity: 2, unit: 'EL' },
      { name: 'Zwiebel', amount: '2 EL, fein gewürfelt', quantity: 2, unit: 'EL' },
      { name: 'Grüne Paprika', amount: '2 EL, fein gewürfelt', quantity: 2, unit: 'EL' },
      { name: 'Mais, tiefgekühlt', amount: '1 Packung (ca. 280 g)', quantity: 1, unit: 'Packung' },
      { name: 'Kartoffel', amount: '1 Tasse, gewürfelt', quantity: 1, unit: 'Tasse' },
      { name: 'Petersilie', amount: '2 EL, frisch gehackt', quantity: 2, unit: 'EL' },
      { name: 'Wasser', amount: '1 Tasse', quantity: 1, unit: 'Tasse' },
      { name: 'Salz', amount: '1/4 TL', quantity: 0.25, unit: 'TL' },
      { name: 'Schwarzer Pfeffer', amount: 'nach Geschmack', quantity: 1, unit: 'Portion' },
      { name: 'Paprikapulver', amount: '1/4 TL', quantity: 0.25, unit: 'TL' },
      { name: 'Mehl', amount: '2 EL', quantity: 2, unit: 'EL' },
      { name: 'Milch, fettarm oder Magermilch', amount: '2 Tassen', quantity: 2, unit: 'Tassen' },
    ],
    instructions: [
      'Öl in einem mittelgroßen Topf erhitzen. Sellerie, Zwiebel und Paprika 2 Minuten anschwitzen.',
      'Mais, Kartoffel, Wasser, Salz, Pfeffer und Paprikapulver zugeben. Aufkochen, abdecken und etwa 10 Minuten köcheln lassen, bis die Kartoffel weich ist.',
      'Eine halbe Tasse Milch mit dem Mehl glatt verrühren. Zur Gemüsemischung geben und die restliche Milch einrühren.',
      'Unter ständigem Rühren erhitzen, bis die Suppe andickt und aufkocht. Mit Petersilie servieren.',
    ],
  },
  {
    id: 'chicken-marsala',
    name: 'Chicken Marsala',
    category: 'Hauptgerichte',
    servings: 4,
    servingSize: '1 Hähnchenbrust mit Sauce',
    calories: 285,
    protein: 33,
    carbohydrates: 11,
    fat: 8,
    ingredients: [
      { name: 'Hähnchenbrust', amount: '4 Stück (insgesamt ca. 570 g), ohne Haut und Knochen', quantity: 4, unit: 'Stück' },
      { name: 'Olivenöl', amount: '1 EL', quantity: 1, unit: 'EL' },
      { name: 'Marsala-Wein', amount: '1/2 Tasse', quantity: 0.5, unit: 'Tasse' },
      { name: 'Hühnerbrühe', amount: '1/2 Tasse, entfettet', quantity: 0.5, unit: 'Tasse' },
      { name: 'Zitrone', amount: '1/2 Stück, Saft', quantity: 0.5, unit: 'Stück' },
      { name: 'Champignons', amount: '1/2 Tasse, in Scheiben', quantity: 0.5, unit: 'Tasse' },
      { name: 'Petersilie', amount: '1 EL, frisch gehackt', quantity: 1, unit: 'EL' },
      { name: 'Mehl', amount: '1/4 Tasse', quantity: 0.25, unit: 'Tasse' },
      { name: 'Salz', amount: '1/4 TL', quantity: 0.25, unit: 'TL' },
      { name: 'Schwarzer Pfeffer', amount: '1/8 TL', quantity: 0.125, unit: 'TL' },
    ],
    instructions: [
      'Pfeffer, Salz und Mehl mischen und das Hähnchen darin wenden.',
      'Öl in einer schweren Pfanne erhitzen. Hähnchen von beiden Seiten anbraten und herausnehmen.',
      'Wein, Brühe, Zitronensaft und Champignons in die Pfanne geben. Etwa 10 Minuten köcheln lassen, bis die Sauce etwas reduziert ist.',
      'Hähnchen zurück in die Pfanne legen, Sauce darüberlöffeln und zugedeckt 5 bis 10 Minuten garen. Mit Petersilie servieren.',
    ],
  },
  {
    id: 'baked-salmon-dijon',
    name: 'Baked Salmon Dijon',
    category: 'Fisch',
    servings: 6,
    servingSize: '1 Stück (ca. 115 g)',
    calories: 196,
    protein: 27,
    carbohydrates: 5,
    fat: 7,
    ingredients: [
      { name: 'Lachsfilet', amount: 'ca. 680 g, in 6 Stücke geteilt', quantity: 6, unit: 'Stück' },
      { name: 'Saure Sahne, fettfrei', amount: '1 Tasse', quantity: 1, unit: 'Tasse' },
      { name: 'Dill, getrocknet', amount: '2 TL', quantity: 2, unit: 'TL' },
      { name: 'Frühlingszwiebeln', amount: '3 EL, fein gehackt', quantity: 3, unit: 'EL' },
      { name: 'Dijon-Senf', amount: '2 EL', quantity: 2, unit: 'EL' },
      { name: 'Zitronensaft', amount: '2 EL', quantity: 2, unit: 'EL' },
      { name: 'Knoblauchpulver', amount: '1/2 TL', quantity: 0.5, unit: 'TL' },
      { name: 'Schwarzer Pfeffer', amount: '1/2 TL', quantity: 0.5, unit: 'TL' },
    ],
    instructions: [
      'Saure Sahne, Dill, Frühlingszwiebeln, Senf und Zitronensaft in einer kleinen Schüssel verrühren.',
      'Backofen auf 200 °C vorheizen und ein Backblech leicht einfetten.',
      'Lachs mit der Hautseite nach unten aufs Blech legen. Mit Knoblauchpulver und Pfeffer würzen und die Sauce darauf verteilen.',
      'Etwa 20 Minuten backen, bis der Lachs gerade durchgegart ist.',
    ],
  },
  {
    id: 'black-beans-rice',
    name: 'Black Beans With Rice',
    category: 'Vegetarisch',
    servings: 6,
    servingSize: 'ca. 225 g',
    calories: 508,
    protein: 21,
    carbohydrates: 98,
    fat: 4,
    ingredients: [
      { name: 'Schwarze Bohnen, getrocknet', amount: 'ca. 450 g', quantity: 450, unit: 'g' },
      { name: 'Grüne Paprika', amount: '1 Stück, grob gehackt', quantity: 1, unit: 'Stück' },
      { name: 'Zwiebel', amount: '1 1/2 Tassen, gehackt', quantity: 1.5, unit: 'Tassen' },
      { name: 'Pflanzenöl', amount: '1 EL', quantity: 1, unit: 'EL' },
      { name: 'Lorbeerblätter', amount: '2 Stück', quantity: 2, unit: 'Stück' },
      { name: 'Knoblauch', amount: '1 Zehe, gehackt', quantity: 1, unit: 'Zehe' },
      { name: 'Salz', amount: '1/2 TL', quantity: 0.5, unit: 'TL' },
      { name: 'Essig oder Zitronensaft', amount: '1 EL', quantity: 1, unit: 'EL' },
      { name: 'Reis, gekocht', amount: '6 Tassen', quantity: 6, unit: 'Tassen' },
      { name: 'Pimiento/Paprika aus dem Glas', amount: '1 kleines Glas, optional', quantity: 1, unit: 'Glas' },
    ],
    instructions: [
      'Bohnen verlesen, über Nacht in kaltem Wasser einweichen. Abgießen und abspülen.',
      'Bohnen mit Wasser, Paprika, Zwiebel, Öl, Lorbeer, Knoblauch und Salz in einen großen Topf geben. Zugedeckt etwa eine Stunde kochen, dann bei niedriger Hitze 3 bis 4 Stunden köcheln lassen, bis sie weich sind.',
      'Etwa ein Drittel der Bohnen zerdrücken und wieder einrühren. Essig oder Zitronensaft zugeben und erhitzen.',
      'Über gekochtem Reis servieren.',
    ],
  },
  {
    id: 'turkey-meat-loaf',
    name: 'Turkey Meat Loaf',
    category: 'Hauptgerichte',
    servings: 5,
    servingSize: '1 Scheibe (ca. 85 g)',
    calories: 192,
    protein: 21,
    carbohydrates: 23,
    fat: 7,
    ingredients: [
      { name: 'Putenhackfleisch, mager', amount: 'ca. 450 g', quantity: 450, unit: 'g' },
      { name: 'Haferflocken, trocken', amount: '1/2 Tasse', quantity: 0.5, unit: 'Tasse' },
      { name: 'Ei', amount: '1 Stück', quantity: 1, unit: 'Stück' },
      { name: 'Zwiebelpulver', amount: '1 EL', quantity: 1, unit: 'EL' },
      { name: 'Ketchup', amount: '1/4 Tasse', quantity: 0.25, unit: 'Tasse' },
    ],
    instructions: [
      'Alle Zutaten gut vermischen.',
      'In eine kleine Kastenform geben und bei 175 °C etwa 25 Minuten backen, bis eine Kerntemperatur von 74 °C erreicht ist.',
      'In fünf Scheiben schneiden und servieren.',
    ],
  },
  {
    id: 'summer-vegetable-spaghetti',
    name: 'Summer Vegetable Spaghetti',
    category: 'Vegetarisch',
    servings: 9,
    servingSize: '1 Tasse Pasta mit Sauce',
    calories: 271,
    protein: 11,
    carbohydrates: 51,
    fat: 3,
    ingredients: [
      { name: 'Kleine gelbe Zwiebeln', amount: '2 Tassen, geachtelt', quantity: 2, unit: 'Tassen' },
      { name: 'Tomaten, reif', amount: 'ca. 450 g, geschält und gehackt', quantity: 450, unit: 'g' },
      { name: 'Zucchini und Sommerkürbis', amount: 'ca. 450 g, dünn geschnitten', quantity: 450, unit: 'g' },
      { name: 'Grüne Bohnen', amount: '1 1/2 Tassen, geschnitten', quantity: 1.5, unit: 'Tassen' },
      { name: 'Wasser', amount: '2/3 Tasse', quantity: 0.67, unit: 'Tasse' },
      { name: 'Petersilie, frisch', amount: '2 EL, gehackt', quantity: 2, unit: 'EL' },
      { name: 'Knoblauch', amount: '1 Zehe, gehackt', quantity: 1, unit: 'Zehe' },
      { name: 'Chilipulver', amount: '1/2 TL', quantity: 0.5, unit: 'TL' },
      { name: 'Tomatenmark', amount: '1 Dose (ca. 170 g)', quantity: 1, unit: 'Dose' },
      { name: 'Spaghetti, trocken', amount: 'ca. 450 g', quantity: 450, unit: 'g' },
      { name: 'Parmesan', amount: '1/2 Tasse, gerieben', quantity: 0.5, unit: 'Tasse' },
    ],
    instructions: [
      'Zwiebeln, Tomaten, Kürbis, grüne Bohnen, Wasser, Petersilie, Knoblauch und Gewürze in einem großen Topf 10 Minuten kochen. Tomatenmark einrühren, abdecken und weitere 15 Minuten köcheln lassen.',
      'Spaghetti ohne zusätzliches Salz nach Packungsangabe kochen.',
      'Sauce über die abgetropften Spaghetti geben und mit Parmesan bestreuen.',
    ],
  },
  {
    id: 'rainbow-fruit-salad',
    name: 'Rainbow Fruit Salad',
    category: 'Desserts',
    servings: 12,
    servingSize: 'ca. 115 g',
    calories: 96,
    protein: 1,
    carbohydrates: 24,
    fat: 1,
    ingredients: [
      { name: 'Mango', amount: '1 große, geschält und gewürfelt', quantity: 1, unit: 'Stück' },
      { name: 'Heidelbeeren', amount: '2 Tassen', quantity: 2, unit: 'Tassen' },
      { name: 'Bananen', amount: '2 Stück, in Scheiben', quantity: 2, unit: 'Stück' },
      { name: 'Erdbeeren', amount: '2 Tassen, halbiert', quantity: 2, unit: 'Tassen' },
      { name: 'Weintrauben, kernlos', amount: '2 Tassen', quantity: 2, unit: 'Tassen' },
      { name: 'Nektarinen', amount: '2 Stück, in Scheiben', quantity: 2, unit: 'Stück' },
      { name: 'Kiwi', amount: '1 Stück, geschält und geschnitten', quantity: 1, unit: 'Stück' },
      { name: 'Orangensaft, ungesüßt', amount: '1/3 Tasse', quantity: 0.33, unit: 'Tasse' },
      { name: 'Zitronensaft', amount: '2 EL', quantity: 2, unit: 'EL' },
      { name: 'Honig', amount: '1 1/2 EL', quantity: 1.5, unit: 'EL' },
      { name: 'Ingwer, gemahlen', amount: '1/4 TL', quantity: 0.25, unit: 'TL' },
    ],
    instructions: [
      'Obst vorbereiten und in eine große Schüssel geben.',
      'Orangensaft, Zitronensaft, Honig, Ingwer und eine Prise Muskatnuss verrühren.',
      'Sauce kurz vor dem Servieren über das Obst geben und vermischen.',
    ],
  },
  {
    id: 'mango-shake',
    name: 'Mango Shake',
    category: 'Getränke',
    servings: 4,
    servingSize: '3/4 Tasse',
    calories: 106,
    protein: 5,
    carbohydrates: 20,
    fat: 2,
    ingredients: [
      { name: 'Milch, fettarm', amount: '2 Tassen', quantity: 2, unit: 'Tassen' },
      { name: 'Mangosaft, tiefgekühlt', amount: '4 EL (oder 1 frische Mango)', quantity: 4, unit: 'EL' },
      { name: 'Banane', amount: '1 kleine', quantity: 1, unit: 'Stück' },
      { name: 'Eiswürfel', amount: '2 Stück', quantity: 2, unit: 'Stück' },
    ],
    instructions: [
      'Alle Zutaten in einen Mixer geben und schaumig mixen.',
      'Sofort servieren.',
    ],
  },
];

const curatedRecipeNames = new Set(CURATED_NHLBI_RECIPES.map((recipe) => recipe.name.toLocaleLowerCase()));

export const NHLBI_RECIPES: Recipe[] = [
  ...CURATED_NHLBI_RECIPES,
  ...(NHLBI_RECIPES_FULL as Recipe[]).filter((recipe) => !curatedRecipeNames.has(recipe.name.toLocaleLowerCase())),
];