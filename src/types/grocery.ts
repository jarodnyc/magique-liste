export interface Category {
  id: string;
  name: string;
  sortOrder: number;
}

export interface Supplier {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  categoryId: string;
  supplierId?: string;
  displayName: string;
  supplierRef: string;
  imageKey: string;
}

export interface Recipient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

export interface GroceryState {
  quantities: Record<string, number>;
  favorites: Set<string>;
}

export interface CSVImportResult {
  valid: number;
  updated: number;
  invalid: number;
  invalidRows: { row: number; reason: string; data: string }[];
  data: Category[] | Product[];
}
