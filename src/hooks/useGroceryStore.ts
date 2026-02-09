import { useState, useEffect, useCallback } from 'react';
import { Category, Product, Recipient, Supplier } from '@/types/grocery';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_SUPPLIERS, CAT_OTHER_ID } from '@/data/seedData';

const STORAGE_KEYS = {
  categories: 'categories',
  products: 'products',
  quantities: 'quantities',
  favorites: 'favorites',
  waRecipients: 'waRecipients',
  emailRecipients: 'emailRecipients',
  suppliers: 'suppliers',
};

// Ensure cat_other exists
const ensureCatOther = (categories: Category[]): Category[] => {
  const hasOther = categories.some(c => c.id === CAT_OTHER_ID);
  if (!hasOther) {
    return [...categories, { id: CAT_OTHER_ID, name: 'Autres', sortOrder: 999 }];
  }
  return categories;
};

// Load from localStorage with fallback
const loadFromStorage = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
  }
  return fallback;
};

// Save to localStorage
const saveToStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key}:`, e);
  }
};

export const useGroceryStore = () => {
  // Categories
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = loadFromStorage<Category[]>(STORAGE_KEYS.categories, []);
    return stored.length > 0 ? ensureCatOther(stored) : SEED_CATEGORIES;
  });

  // Suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const stored = loadFromStorage<Supplier[]>(STORAGE_KEYS.suppliers, []);
    return stored.length > 0 ? stored : SEED_SUPPLIERS;
  });

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const stored = loadFromStorage<Product[]>(STORAGE_KEYS.products, []);
    return stored.length > 0 ? stored : SEED_PRODUCTS;
  });

  // Quantities
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    return loadFromStorage<Record<string, number>>(STORAGE_KEYS.quantities, {});
  });

  // Favorites
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const stored = loadFromStorage<string[]>(STORAGE_KEYS.favorites, []);
    return new Set(stored);
  });

  // WhatsApp Recipients
  const [waRecipients, setWaRecipients] = useState<Recipient[]>(() => {
    return loadFromStorage<Recipient[]>(STORAGE_KEYS.waRecipients, []);
  });

  // Email Recipients
  const [emailRecipients, setEmailRecipients] = useState<Recipient[]>(() => {
    return loadFromStorage<Recipient[]>(STORAGE_KEYS.emailRecipients, []);
  });

  // Persist on change
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.categories, categories);
  }, [categories]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.suppliers, suppliers);
  }, [suppliers]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.products, products);
  }, [products]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.quantities, quantities);
  }, [quantities]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.favorites, Array.from(favorites));
  }, [favorites]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.waRecipients, waRecipients);
  }, [waRecipients]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.emailRecipients, emailRecipients);
  }, [emailRecipients]);

  // Quantity actions
  const setQuantity = useCallback((productId: string, qty: number) => {
    setQuantities(prev => {
      const newQty = Math.max(0, qty);
      if (newQty === 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  }, []);

  const incrementQuantity = useCallback((productId: string) => {
    setQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  }, []);

  const decrementQuantity = useCallback((productId: string) => {
    setQuantities(prev => {
      const current = prev[productId] || 0;
      if (current <= 1) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: current - 1 };
    });
  }, []);

  const resetQuantities = useCallback(() => {
    setQuantities({});
  }, []);

  // Favorites actions
  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  // Catalog actions
  const updateCategories = useCallback((newCategories: Category[], mode: 'merge' | 'replace') => {
    let result: Category[];
    
    if (mode === 'replace') {
      result = ensureCatOther(newCategories);
    } else {
      // Merge: update existing, add new
      const categoryMap = new Map(categories.map(c => [c.id, c]));
      newCategories.forEach(c => categoryMap.set(c.id, c));
      result = ensureCatOther(Array.from(categoryMap.values()));
    }
    
    setCategories(result);
    
    // Remap orphaned products to cat_other
    const validCategoryIds = new Set(result.map(c => c.id));
    setProducts(prev => prev.map(p => 
      validCategoryIds.has(p.categoryId) ? p : { ...p, categoryId: CAT_OTHER_ID }
    ));
  }, [categories]);

  const updateProducts = useCallback((newProducts: Product[], mode: 'merge' | 'replace') => {
    const validCategoryIds = new Set(categories.map(c => c.id));
    
    // Ensure all products have valid categoryId
    const sanitizedProducts = newProducts.map(p => 
      validCategoryIds.has(p.categoryId) ? p : { ...p, categoryId: CAT_OTHER_ID }
    );
    
    if (mode === 'replace') {
      // Remove quantities/favorites for removed products
      const newProductIds = new Set(sanitizedProducts.map(p => p.id));
      setQuantities(prev => {
        const filtered: Record<string, number> = {};
        Object.entries(prev).forEach(([id, qty]) => {
          if (newProductIds.has(id)) {
            filtered[id] = qty;
          }
        });
        return filtered;
      });
      setFavorites(prev => {
        const newSet = new Set<string>();
        prev.forEach(id => {
          if (newProductIds.has(id)) {
            newSet.add(id);
          }
        });
        return newSet;
      });
      setProducts(sanitizedProducts);
    } else {
      // Merge: update existing, add new
      const productMap = new Map(products.map(p => [p.id, p]));
      sanitizedProducts.forEach(p => productMap.set(p.id, p));
      setProducts(Array.from(productMap.values()));
    }
  }, [categories, products]);

  // Recipients actions
  const addWaRecipient = useCallback((recipient: Recipient) => {
    setWaRecipients(prev => [...prev, recipient]);
  }, []);

  const updateWaRecipient = useCallback((id: string, updates: Partial<Recipient>) => {
    setWaRecipients(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteWaRecipient = useCallback((id: string) => {
    setWaRecipients(prev => prev.filter(r => r.id !== id));
  }, []);

  const addEmailRecipient = useCallback((recipient: Recipient) => {
    setEmailRecipients(prev => [...prev, recipient]);
  }, []);

  const updateEmailRecipient = useCallback((id: string, updates: Partial<Recipient>) => {
    setEmailRecipients(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteEmailRecipient = useCallback((id: string) => {
    setEmailRecipients(prev => prev.filter(r => r.id !== id));
  }, []);

  // Supplier actions
  const addSupplier = useCallback((supplier: Supplier) => {
    setSuppliers(prev => [...prev, supplier]);
  }, []);

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSuppliers(prev => prev.filter(s => s.id !== id));
    // Remove supplierId from products that used this supplier
    setProducts(prev => prev.map(p => p.supplierId === id ? { ...p, supplierId: undefined } : p));
  }, []);

  // Add product manually
  const addProduct = useCallback((product: Product) => {
    const validCategoryIds = new Set(categories.map(c => c.id));
    const sanitized = validCategoryIds.has(product.categoryId)
      ? product
      : { ...product, categoryId: CAT_OTHER_ID };
    setProducts(prev => [...prev, sanitized]);
  }, [categories]);

  // Delete product
  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setQuantities(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  // Get items with quantity > 0
  const getListItems = useCallback(() => {
    return products
      .filter(p => (quantities[p.id] || 0) > 0)
      .map(p => ({
        product: p,
        quantity: quantities[p.id],
        category: categories.find(c => c.id === p.categoryId),
        supplier: suppliers.find(s => s.id === p.supplierId),
      }));
  }, [products, quantities, categories, suppliers]);

  // Generate export text grouped by supplier
  const generateExportText = useCallback(() => {
    const items = getListItems();
    const grouped = new Map<string, typeof items>();

    items.forEach(item => {
      const supplierName = item.supplier?.name || 'Sans fournisseur';
      if (!grouped.has(supplierName)) {
        grouped.set(supplierName, []);
      }
      grouped.get(supplierName)!.push(item);
    });

    const sections: string[] = [];
    grouped.forEach((groupItems, supplierName) => {
      sections.push(`📦 ${supplierName}`);
      groupItems.forEach(item => {
        sections.push(`${item.product.supplierRef} x${item.quantity}`);
      });
      sections.push('');
    });

    return sections.join('\n').trim();
  }, [getListItems]);

  // Generate grouped export for PDF (by supplier)
  const generateGroupedExport = useCallback(() => {
    const items = getListItems();
    const grouped = new Map<string, typeof items>();

    items.forEach(item => {
      const supplierName = item.supplier?.name || 'Sans fournisseur';
      if (!grouped.has(supplierName)) {
        grouped.set(supplierName, []);
      }
      grouped.get(supplierName)!.push(item);
    });

    return Array.from(grouped.entries())
      .map(([supplierName, groupItems]) => ({
        category: supplierName,
        items: groupItems.map(i => ({ ref: i.product.supplierRef, qty: i.quantity })),
      }));
  }, [getListItems]);

  return {
    categories: categories.sort((a, b) => a.sortOrder - b.sortOrder),
    products,
    quantities,
    favorites,
    suppliers,
    waRecipients,
    emailRecipients,
    setQuantity,
    incrementQuantity,
    decrementQuantity,
    resetQuantities,
    toggleFavorite,
    updateCategories,
    updateProducts,
    addWaRecipient,
    updateWaRecipient,
    deleteWaRecipient,
    addEmailRecipient,
    updateEmailRecipient,
    deleteEmailRecipient,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addProduct,
    deleteProduct,
    getListItems,
    generateExportText,
    generateGroupedExport,
  };
};
