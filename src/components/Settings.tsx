import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Download, 
  Upload, 
  AlertTriangle,
  MessageCircle,
  Mail,
  Database,
  Truck,
  Package,
  Tag,
  Pencil,
  Check,
  X
} from 'lucide-react';
import { Recipient, Category, Product, CSVImportResult, Supplier } from '@/types/grocery';
import { 
  exportCategoriesToCSV, 
  exportProductsToCSV, 
  parseCategoriesCSV, 
  parseProductsCSV,
  downloadCSV 
} from '@/utils/csvUtils';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ConfirmDialog } from './ConfirmDialog';

interface SettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waRecipients: Recipient[];
  emailRecipients: Recipient[];
  categories: Category[];
  products: Product[];
  suppliers: Supplier[];
  onAddWaRecipient: (recipient: Recipient) => void;
  onUpdateWaRecipient: (id: string, updates: Partial<Recipient>) => void;
  onDeleteWaRecipient: (id: string) => void;
  onAddEmailRecipient: (recipient: Recipient) => void;
  onUpdateEmailRecipient: (id: string, updates: Partial<Recipient>) => void;
  onDeleteEmailRecipient: (id: string) => void;
  onUpdateCategories: (categories: Category[], mode: 'merge' | 'replace') => void;
  onUpdateProducts: (products: Product[], mode: 'merge' | 'replace') => void;
  onAddSupplier: (supplier: Supplier) => void;
  onUpdateSupplier: (id: string, updates: Partial<Supplier>) => void;
  onDeleteSupplier: (id: string) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateProduct: (id: string, updates: Partial<Product>) => void;
}

type TabType = 'whatsapp' | 'email' | 'catalog' | 'suppliers';

export const Settings: React.FC<SettingsProps> = ({
  open,
  onOpenChange,
  waRecipients,
  emailRecipients,
  categories,
  products,
  suppliers,
  onAddWaRecipient,
  onUpdateWaRecipient,
  onDeleteWaRecipient,
  onAddEmailRecipient,
  onUpdateEmailRecipient,
  onDeleteEmailRecipient,
  onUpdateCategories,
  onUpdateProducts,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
  onAddProduct,
  onDeleteProduct,
  onDeleteCategory,
  onUpdateProduct,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('whatsapp');
  const [newWaName, setNewWaName] = useState('');
  const [newWaPhone, setNewWaPhone] = useState('');
  const [newEmailName, setNewEmailName] = useState('');
  const [newEmailAddress, setNewEmailAddress] = useState('');
  
  // Supplier form
  const [newSupplierName, setNewSupplierName] = useState('');
  
  // Product form
  const [newProductName, setNewProductName] = useState('');
  const [newProductRef, setNewProductRef] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductSupplier, setNewProductSupplier] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  
  // Category form
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySortOrder, setNewCategorySortOrder] = useState('');
  
  // CSV Import state
  const [importPreview, setImportPreview] = useState<CSVImportResult | null>(null);
  const [importType, setImportType] = useState<'categories' | 'products' | null>(null);
  const [showReplaceWarning, setShowReplaceWarning] = useState(false);
  const [pendingImportMode, setPendingImportMode] = useState<'merge' | 'replace' | null>(null);

  // Edit states
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategorySortOrder, setEditCategorySortOrder] = useState('');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductRef, setEditProductRef] = useState('');
  const [editProductCategory, setEditProductCategory] = useState('');
  const [editProductSupplier, setEditProductSupplier] = useState('');
  const [editingSupplier, setEditingSupplier] = useState<string | null>(null);
  const [editSupplierName, setEditSupplierName] = useState('');

  const categoriesFileRef = useRef<HTMLInputElement>(null);
  const productsFileRef = useRef<HTMLInputElement>(null);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const slugify = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

  // WhatsApp handlers
  const handleAddWaRecipient = () => {
    if (newWaName.trim() && newWaPhone.trim()) {
      onAddWaRecipient({
        id: generateId(),
        name: newWaName.trim(),
        phone: newWaPhone.trim(),
      });
      setNewWaName('');
      setNewWaPhone('');
    }
  };

  // Email handlers
  const handleAddEmailRecipient = () => {
    if (newEmailName.trim() && newEmailAddress.trim()) {
      onAddEmailRecipient({
        id: generateId(),
        name: newEmailName.trim(),
        email: newEmailAddress.trim(),
      });
      setNewEmailName('');
      setNewEmailAddress('');
    }
  };

  // Supplier handlers
  const handleAddSupplier = () => {
    if (newSupplierName.trim()) {
      onAddSupplier({
        id: `sup_${generateId()}`,
        name: newSupplierName.trim(),
      });
      setNewSupplierName('');
    }
  };

  // Category handlers
  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const sortOrder = parseInt(newCategorySortOrder, 10);
      onUpdateCategories([{
        id: `cat_${slugify(newCategoryName.trim())}`,
        name: newCategoryName.trim(),
        sortOrder: isNaN(sortOrder) ? categories.length + 1 : sortOrder,
      }], 'merge');
      setNewCategoryName('');
      setNewCategorySortOrder('');
    }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditCategoryName(cat.name);
    setEditCategorySortOrder(String(cat.sortOrder));
  };

  const saveEditCategory = () => {
    if (editingCategoryId && editCategoryName.trim()) {
      onUpdateCategories([{
        id: editingCategoryId,
        name: editCategoryName.trim(),
        sortOrder: parseInt(editCategorySortOrder, 10) || 0,
      }], 'merge');
      setEditingCategoryId(null);
    }
  };

  const startEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditProductName(prod.displayName);
    setEditProductRef(prod.supplierRef);
    setEditProductCategory(prod.categoryId);
    setEditProductSupplier(prod.supplierId || '');
  };

  const saveEditProduct = () => {
    if (editingProductId && editProductName.trim() && editProductRef.trim()) {
      onUpdateProduct(editingProductId, {
        displayName: editProductName.trim(),
        supplierRef: editProductRef.trim(),
        categoryId: editProductCategory || 'cat_other',
        supplierId: editProductSupplier || undefined,
      });
      setEditingProductId(null);
    }
  };

  const startEditSupplier = (sup: Supplier) => {
    setEditingSupplier(sup.id);
    setEditSupplierName(sup.name);
  };

  const saveEditSupplier = () => {
    if (editingSupplier && editSupplierName.trim()) {
      onUpdateSupplier(editingSupplier, { name: editSupplierName.trim() });
      setEditingSupplier(null);
    }
  };

  // Product handlers
  const handleAddProduct = () => {
    if (newProductName.trim() && newProductRef.trim()) {
      onAddProduct({
        id: `PROD_${generateId()}`,
        displayName: newProductName.trim(),
        supplierRef: newProductRef.trim(),
        categoryId: newProductCategory || 'cat_other',
        supplierId: newProductSupplier || undefined,
        imageKey: newProductImage.trim() || 'package',
      });
      setNewProductName('');
      setNewProductRef('');
      setNewProductCategory('');
      setNewProductSupplier('');
      setNewProductImage('');
    }
  };

  // CSV Export handlers
  const handleExportCategories = () => {
    const csv = exportCategoriesToCSV(categories);
    downloadCSV(csv, 'categories.csv');
  };

  const handleExportProducts = () => {
    const csv = exportProductsToCSV(products, suppliers);
    downloadCSV(csv, 'products.csv');
  };

  // CSV Import handlers
  const handleCategoriesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const result = parseCategoriesCSV(csv);
      setImportPreview(result);
      setImportType('categories');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProductsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const validCategoryIds = new Set(categories.map(c => c.id));
      const result = parseProductsCSV(csv, validCategoryIds);
      setImportPreview(result);
      setImportType('products');
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleApplyImport = (mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      setPendingImportMode('replace');
      setShowReplaceWarning(true);
      return;
    }
    applyImport(mode);
  };

  const applyImport = (mode: 'merge' | 'replace') => {
    if (!importPreview || !importType) return;
    if (importType === 'categories') {
      onUpdateCategories(importPreview.data as Category[], mode);
    } else {
      onUpdateProducts(importPreview.data as Product[], mode);
    }
    setImportPreview(null);
    setImportType(null);
    setPendingImportMode(null);
  };

  const cancelImport = () => {
    setImportPreview(null);
    setImportType(null);
    setPendingImportMode(null);
  };

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" /> },
    { id: 'email', label: 'Email', icon: <Mail className="w-4 h-4" /> },
    { id: 'suppliers', label: 'Fournisseurs', icon: <Truck className="w-4 h-4" /> },
    { id: 'catalog', label: 'Catalogue', icon: <Database className="w-4 h-4" /> },
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-md p-0">
          <SheetHeader className="p-4 border-b border-border">
            <SheetTitle>Réglages</SheetTitle>
          </SheetHeader>

          {/* Tabs */}
          <div className="flex border-b border-border overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-colors whitespace-nowrap px-2',
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-4 overflow-y-auto max-h-[calc(100vh-140px)]">
            {/* WhatsApp Tab */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gérez vos destinataires WhatsApp. Le numéro doit inclure l'indicatif pays (ex: 33612345678).
                </p>
                <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                  <input type="text" placeholder="Nom" value={newWaName} onChange={(e) => setNewWaName(e.target.value)} className="search-input" />
                  <input type="tel" placeholder="Numéro (ex: 33612345678)" value={newWaPhone} onChange={(e) => setNewWaPhone(e.target.value)} className="search-input" />
                  <button onClick={handleAddWaRecipient} disabled={!newWaName.trim() || !newWaPhone.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
                {waRecipients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Aucun destinataire WhatsApp</p>
                ) : (
                  <div className="space-y-2">
                    {waRecipients.map(recipient => (
                      <div key={recipient.id} className="recipient-card">
                        <div className="flex-1">
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-muted-foreground">{recipient.phone}</p>
                        </div>
                        <button onClick={() => onDeleteWaRecipient(recipient.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Email Tab */}
            {activeTab === 'email' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Gérez vos destinataires email.</p>
                <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                  <input type="text" placeholder="Nom" value={newEmailName} onChange={(e) => setNewEmailName(e.target.value)} className="search-input" />
                  <input type="email" placeholder="Email" value={newEmailAddress} onChange={(e) => setNewEmailAddress(e.target.value)} className="search-input" />
                  <button onClick={handleAddEmailRecipient} disabled={!newEmailName.trim() || !newEmailAddress.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
                {emailRecipients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Aucun destinataire email</p>
                ) : (
                  <div className="space-y-2">
                    {emailRecipients.map(recipient => (
                      <div key={recipient.id} className="recipient-card">
                        <div className="flex-1">
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-muted-foreground">{recipient.email}</p>
                        </div>
                        <button onClick={() => onDeleteEmailRecipient(recipient.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Gérez vos fournisseurs. Ils seront utilisés pour regrouper les produits lors des exports.
                </p>
                <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                  <input type="text" placeholder="Nom du fournisseur" value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} className="search-input" />
                  <button onClick={handleAddSupplier} disabled={!newSupplierName.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    <Plus className="w-4 h-4" /> Ajouter
                  </button>
                </div>
                {suppliers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">Aucun fournisseur</p>
                ) : (
                  <div className="space-y-2">
                    {suppliers.map(supplier => (
                      <div key={supplier.id} className="recipient-card">
                        {editingSupplier === supplier.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input type="text" value={editSupplierName} onChange={(e) => setEditSupplierName(e.target.value)} className="search-input flex-1" />
                            <button onClick={saveEditSupplier} className="p-1 text-primary"><Check className="w-4 h-4" /></button>
                            <button onClick={() => setEditingSupplier(null)} className="p-1 text-muted-foreground"><X className="w-4 h-4" /></button>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1">
                              <p className="font-medium">{supplier.name}</p>
                            </div>
                            <button onClick={() => startEditSupplier(supplier)} className="p-2 text-muted-foreground hover:text-primary transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDeleteSupplier(supplier.id)} className="p-2 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Catalog Tab */}
            {activeTab === 'catalog' && (
              <div className="space-y-6">
                {/* Import Preview */}
                {importPreview && (
                  <div className="p-4 bg-accent/50 rounded-xl space-y-3 animate-slide-up">
                    <h4 className="font-semibold">
                      Aperçu de l'import ({importType === 'categories' ? 'Catégories' : 'Produits'})
                    </h4>
                    <div className="flex gap-4 text-sm">
                      <span className="text-success">✓ Valides: {importPreview.valid}</span>
                      <span className="text-destructive">✗ Invalides: {importPreview.invalid}</span>
                    </div>
                    {importPreview.invalidRows.length > 0 && (
                      <div className="csv-preview text-destructive">
                        <p className="font-medium mb-2">Lignes invalides:</p>
                        {importPreview.invalidRows.slice(0, 5).map((row, idx) => (
                          <p key={idx}>Ligne {row.row}: {row.reason}</p>
                        ))}
                        {importPreview.invalidRows.length > 5 && (
                          <p>... et {importPreview.invalidRows.length - 5} autres</p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => handleApplyImport('merge')} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium">Fusionner</button>
                      <button onClick={() => handleApplyImport('replace')} className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium">Remplacer tout</button>
                      <button onClick={cancelImport} className="py-2 px-4 rounded-lg bg-muted font-medium">Annuler</button>
                    </div>
                  </div>
                )}

                {/* Add Product manually */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Ajouter un produit
                  </h4>
                  <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                    <input type="text" placeholder="Nom du produit *" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} className="search-input" />
                    <input type="text" placeholder="Référence fournisseur *" value={newProductRef} onChange={(e) => setNewProductRef(e.target.value)} className="search-input" />
                    <select
                      value={newProductCategory}
                      onChange={(e) => setNewProductCategory(e.target.value)}
                      className="search-input"
                    >
                      <option value="">-- Catégorie --</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <select
                      value={newProductSupplier}
                      onChange={(e) => setNewProductSupplier(e.target.value)}
                      className="search-input"
                    >
                      <option value="">-- Fournisseur (optionnel) --</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <input type="text" placeholder="Clé image (optionnel, ex: emoji ou IMG/fichier.png)" value={newProductImage} onChange={(e) => setNewProductImage(e.target.value)} className="search-input" />
                    <button onClick={handleAddProduct} disabled={!newProductName.trim() || !newProductRef.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      <Plus className="w-4 h-4" /> Ajouter le produit
                    </button>
                  </div>
                </div>

                {/* Add Category manually */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Ajouter une catégorie
                  </h4>
                  <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                    <input type="text" placeholder="Nom de la catégorie *" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} className="search-input" />
                    <input type="number" placeholder="Ordre de tri (optionnel)" value={newCategorySortOrder} onChange={(e) => setNewCategorySortOrder(e.target.value)} className="search-input" />
                    <button onClick={handleAddCategory} disabled={!newCategoryName.trim()} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      <Plus className="w-4 h-4" /> Ajouter la catégorie
                    </button>
                  </div>
                </div>

                {/* Categories section */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    Catégories
                    <span className="text-sm font-normal text-muted-foreground">({categories.length})</span>
                  </h4>
                  <div className="flex gap-2">
                    <button onClick={handleExportCategories} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors">
                      <Download className="w-4 h-4" /> Exporter CSV
                    </button>
                    <button onClick={() => categoriesFileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors">
                      <Upload className="w-4 h-4" /> Importer CSV
                    </button>
                    <input ref={categoriesFileRef} type="file" accept=".csv" onChange={handleCategoriesFileChange} className="hidden" />
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {categories.map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                        {editingCategoryId === cat.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input type="text" value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} className="search-input flex-1" />
                            <input type="number" value={editCategorySortOrder} onChange={(e) => setEditCategorySortOrder(e.target.value)} className="search-input w-16" placeholder="Tri" />
                            <button onClick={saveEditCategory} className="p-1 text-primary"><Check className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setEditingCategoryId(null)} className="p-1 text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium">{cat.name}</span>
                            <div className="flex items-center gap-1">
                              {cat.id !== 'cat_other' && (
                                <>
                                  <button onClick={() => startEditCategory(cat)} className="p-1 text-muted-foreground hover:text-primary transition-colors" title="Modifier">
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button onClick={() => onDeleteCategory(cat.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors" title="Supprimer (produits → Autres)">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products section */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    Produits
                    <span className="text-sm font-normal text-muted-foreground">({products.length})</span>
                  </h4>
                  <div className="flex gap-2">
                    <button onClick={handleExportProducts} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors">
                      <Download className="w-4 h-4" /> Exporter CSV
                    </button>
                    <button onClick={() => productsFileRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors">
                      <Upload className="w-4 h-4" /> Importer CSV
                    </button>
                    <input ref={productsFileRef} type="file" accept=".csv" onChange={handleProductsFileChange} className="hidden" />
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {products.map(prod => (
                      <div key={prod.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
                        {editingProductId === prod.id ? (
                          <div className="flex-1 space-y-1">
                            <input type="text" value={editProductName} onChange={(e) => setEditProductName(e.target.value)} className="search-input" placeholder="Nom" />
                            <input type="text" value={editProductRef} onChange={(e) => setEditProductRef(e.target.value)} className="search-input" placeholder="Réf. fournisseur" />
                            <select value={editProductCategory} onChange={(e) => setEditProductCategory(e.target.value)} className="search-input">
                              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select value={editProductSupplier} onChange={(e) => setEditProductSupplier(e.target.value)} className="search-input">
                              <option value="">-- Fournisseur --</option>
                              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <div className="flex gap-1 justify-end">
                              <button onClick={saveEditProduct} className="p-1 text-primary"><Check className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setEditingProductId(null)} className="p-1 text-muted-foreground"><X className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate block">{prod.displayName}</span>
                              <span className="text-xs text-muted-foreground">{prod.supplierRef}</span>
                            </div>
                            <button onClick={() => startEditProduct(prod)} className="p-1 text-muted-foreground hover:text-primary transition-colors flex-shrink-0">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => onDeleteProduct(prod.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* CSV Schema info */}
                <div className="p-3 bg-muted/30 rounded-xl text-sm space-y-2">
                  <p className="font-medium">Format des fichiers CSV :</p>
                  <p className="text-muted-foreground font-mono text-xs">categories.csv: id,name,sortOrder</p>
                  <p className="text-muted-foreground font-mono text-xs">products.csv: id,categoryId,displayName,supplierRef,imageKey,supplierId,supplierName</p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl text-sm">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">Importer en mode "Remplacer tout" écrase le catalogue actuel.</p>
                </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Replace warning dialog */}
      <ConfirmDialog
        open={showReplaceWarning}
        onOpenChange={setShowReplaceWarning}
        title="Confirmer le remplacement"
        description="Cette action va remplacer toutes les données existantes. Les quantités et favoris des produits supprimés seront perdus."
        confirmLabel="Remplacer tout"
        variant="destructive"
        onConfirm={() => {
          setShowReplaceWarning(false);
          if (pendingImportMode) {
            applyImport(pendingImportMode);
          }
        }}
      />
    </>
  );
};
