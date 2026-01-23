// Emoji icon mapping for products
export const ICON_MAP: Record<string, string> = {
  // Fruits & Légumes
  banana: '🍌',
  apple: '🍎',
  tomato: '🍅',
  onion: '🧅',
  garlic: '🧄',
  lemon: '🍋',
  // Épicerie
  rice: '🍚',
  pasta: '🍝',
  'olive-oil': '🫒',
  flour: '🌾',
  sugar: '🧂',
  coffee: '☕',
  // Produits frais
  milk: '🥛',
  eggs: '🥚',
  butter: '🧈',
  yogurt: '🥣',
  cheese: '🧀',
  ham: '🥓',
  // Viandes & Poissons
  chicken: '🍗',
  beef: '🥩',
  salmon: '🐟',
  tuna: '🐠',
  sausage: '🌭',
  shrimp: '🦐',
  // Maison & Hygiène
  'toilet-paper': '🧻',
  'paper-towel': '🧻',
  'dish-soap': '🧴',
  laundry: '🧺',
  'trash-bag': '🗑️',
  toothpaste: '🪥',
};

export const getProductIcon = (imageKey: string): string => {
  return ICON_MAP[imageKey] || '📦';
};
