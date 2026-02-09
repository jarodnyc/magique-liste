import { Category, Product, Supplier } from '@/types/grocery';

export const SEED_SUPPLIERS: Supplier[] = [
  { id: 'sup_default', name: 'Fournisseur par défaut' },
];

export const SEED_CATEGORIES: Category[] = [
  { id: 'cat_fl', name: 'Fruits & Légumes', sortOrder: 1 },
  { id: 'cat_ep', name: 'Épicerie', sortOrder: 2 },
  { id: 'cat_pf', name: 'Produits frais', sortOrder: 3 },
  { id: 'cat_vp', name: 'Viandes & Poissons', sortOrder: 4 },
  { id: 'cat_mh', name: 'Maison & Hygiène', sortOrder: 5 },
  { id: 'cat_other', name: 'Autres', sortOrder: 999 },
];

export const SEED_PRODUCTS: Product[] = [
  // Fruits & Légumes
  { id: 'FL-001', categoryId: 'cat_fl', displayName: 'Bananes', supplierRef: 'FL-001', imageKey: 'IMG/banane.png' },
  { id: 'FL-002', categoryId: 'cat_fl', displayName: 'Pommes', supplierRef: 'FL-002', imageKey: 'IMG/pomme.png' },
  { id: 'FL-003', categoryId: 'cat_fl', displayName: 'Tomates', supplierRef: 'FL-003', imageKey: 'IMG/tomate.png' },
  { id: 'FL-004', categoryId: 'cat_fl', displayName: 'Oignons', supplierRef: 'FL-004', imageKey: 'onion' },
  { id: 'FL-005', categoryId: 'cat_fl', displayName: 'Ail', supplierRef: 'FL-005', imageKey: 'garlic' },
  { id: 'FL-006', categoryId: 'cat_fl', displayName: 'Citron', supplierRef: 'FL-006', imageKey: 'lemon' },
  // Épicerie
  { id: 'EP-001', categoryId: 'cat_ep', displayName: 'Riz', supplierRef: 'EP-001', imageKey: 'IMG/riz.png' },
  { id: 'EP-002', categoryId: 'cat_ep', displayName: 'Pâtes', supplierRef: 'EP-002', imageKey: 'pasta' },
  { id: 'EP-003', categoryId: 'cat_ep', displayName: "Huile d'olive", supplierRef: 'OIL-001', imageKey: 'olive-oil' },
  { id: 'EP-004', categoryId: 'cat_ep', displayName: 'Farine', supplierRef: 'EP-004', imageKey: 'flour' },
  { id: 'EP-005', categoryId: 'cat_ep', displayName: 'Sucre', supplierRef: 'EP-005', imageKey: 'sugar' },
  { id: 'EP-006', categoryId: 'cat_ep', displayName: 'Café', supplierRef: 'EP-006', imageKey: 'coffee' },
  // Produits frais
  { id: 'PF-001', categoryId: 'cat_pf', displayName: 'Lait demi-écrémé', supplierRef: 'PF-001', imageKey: 'IMG/lait.png' },
  { id: 'PF-002', categoryId: 'cat_pf', displayName: 'Oeufs', supplierRef: 'PF-002', imageKey: 'eggs' },
  { id: 'PF-003', categoryId: 'cat_pf', displayName: 'Beurre', supplierRef: 'PF-003', imageKey: 'butter' },
  { id: 'PF-004', categoryId: 'cat_pf', displayName: 'Yaourts nature', supplierRef: 'PF-004', imageKey: 'yogurt' },
  { id: 'PF-005', categoryId: 'cat_pf', displayName: 'Fromage râpé', supplierRef: 'PF-005', imageKey: 'cheese' },
  { id: 'PF-006', categoryId: 'cat_pf', displayName: 'Jambon', supplierRef: 'PF-006', imageKey: 'ham' },
  // Viandes & Poissons
  { id: 'VP-001', categoryId: 'cat_vp', displayName: 'Poulet', supplierRef: 'VP-001', imageKey: 'chicken' },
  { id: 'VP-002', categoryId: 'cat_vp', displayName: 'Steak haché', supplierRef: 'VP-002', imageKey: 'beef' },
  { id: 'VP-003', categoryId: 'cat_vp', displayName: 'Saumon', supplierRef: 'VP-003', imageKey: 'salmon' },
  { id: 'VP-004', categoryId: 'cat_vp', displayName: 'Thon', supplierRef: 'VP-004', imageKey: 'tuna' },
  { id: 'VP-005', categoryId: 'cat_vp', displayName: 'Merguez', supplierRef: 'VP-005', imageKey: 'sausage' },
  { id: 'VP-006', categoryId: 'cat_vp', displayName: 'Crevettes', supplierRef: 'VP-006', imageKey: 'shrimp' },
  // Maison & Hygiène
  { id: 'MH-001', categoryId: 'cat_mh', displayName: 'Papier toilette', supplierRef: 'MH-001', imageKey: 'toilet-paper' },
  { id: 'MH-002', categoryId: 'cat_mh', displayName: 'Essuie-tout', supplierRef: 'MH-002', imageKey: 'paper-towel' },
  { id: 'MH-003', categoryId: 'cat_mh', displayName: 'Liquide vaisselle', supplierRef: 'MH-003', imageKey: 'dish-soap' },
  { id: 'MH-004', categoryId: 'cat_mh', displayName: 'Lessive', supplierRef: 'MH-004', imageKey: 'laundry' },
  { id: 'MH-005', categoryId: 'cat_mh', displayName: 'Sacs poubelle', supplierRef: 'MH-005', imageKey: 'trash-bag' },
  { id: 'MH-006', categoryId: 'cat_mh', displayName: 'Dentifrice', supplierRef: 'MH-006', imageKey: 'toothpaste' },
];

export const CAT_OTHER_ID = 'cat_other';
