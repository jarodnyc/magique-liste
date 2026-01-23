import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Download, 
  Upload, 
  AlertTriangle,
  MessageCircle,
  Mail,
  Database
} from 'lucide-react';
import { Recipient, Category, Product, CSVImportResult } from '@/types/grocery';
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
  onAddWaRecipient: (recipient: Recipient) => void;
  onUpdateWaRecipient: (id: string, updates: Partial<Recipient>) => void;
  onDeleteWaRecipient: (id: string) => void;
  onAddEmailRecipient: (recipient: Recipient) => void;
  onUpdateEmailRecipient: (id: string, updates: Partial<Recipient>) => void;
  onDeleteEmailRecipient: (id: string) => void;
  onUpdateCategories: (categories: Category[], mode: 'merge' | 'replace') => void;
  onUpdateProducts: (products: Product[], mode: 'merge' | 'replace') => void;
}

type TabType = 'whatsapp' | 'email' | 'catalog';

export const Settings: React.FC<SettingsProps> = ({
  open,
  onOpenChange,
  waRecipients,
  emailRecipients,
  categories,
  products,
  onAddWaRecipient,
  onUpdateWaRecipient,
  onDeleteWaRecipient,
  onAddEmailRecipient,
  onUpdateEmailRecipient,
  onDeleteEmailRecipient,
  onUpdateCategories,
  onUpdateProducts,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('whatsapp');
  const [newWaName, setNewWaName] = useState('');
  const [newWaPhone, setNewWaPhone] = useState('');
  const [newEmailName, setNewEmailName] = useState('');
  const [newEmailAddress, setNewEmailAddress] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // CSV Import state
  const [importPreview, setImportPreview] = useState<CSVImportResult | null>(null);
  const [importType, setImportType] = useState<'categories' | 'products' | null>(null);
  const [showReplaceWarning, setShowReplaceWarning] = useState(false);
  const [pendingImportMode, setPendingImportMode] = useState<'merge' | 'replace' | null>(null);
  
  const categoriesFileRef = useRef<HTMLInputElement>(null);
  const productsFileRef = useRef<HTMLInputElement>(null);

  // Generate unique ID
  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

  // CSV Export handlers
  const handleExportCategories = () => {
    const csv = exportCategoriesToCSV(categories);
    downloadCSV(csv, 'categories.csv');
  };

  const handleExportProducts = () => {
    const csv = exportProductsToCSV(products);
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
          <div className="flex border-b border-border">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors',
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

                {/* Add new */}
                <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={newWaName}
                    onChange={(e) => setNewWaName(e.target.value)}
                    className="search-input"
                  />
                  <input
                    type="tel"
                    placeholder="Numéro (ex: 33612345678)"
                    value={newWaPhone}
                    onChange={(e) => setNewWaPhone(e.target.value)}
                    className="search-input"
                  />
                  <button
                    onClick={handleAddWaRecipient}
                    disabled={!newWaName.trim() || !newWaPhone.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>

                {/* List */}
                {waRecipients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun destinataire WhatsApp
                  </p>
                ) : (
                  <div className="space-y-2">
                    {waRecipients.map(recipient => (
                      <div key={recipient.id} className="recipient-card">
                        <div className="flex-1">
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-muted-foreground">{recipient.phone}</p>
                        </div>
                        <button
                          onClick={() => onDeleteWaRecipient(recipient.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
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
                <p className="text-sm text-muted-foreground">
                  Gérez vos destinataires email.
                </p>

                {/* Add new */}
                <div className="space-y-2 p-3 bg-muted/30 rounded-xl">
                  <input
                    type="text"
                    placeholder="Nom"
                    value={newEmailName}
                    onChange={(e) => setNewEmailName(e.target.value)}
                    className="search-input"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newEmailAddress}
                    onChange={(e) => setNewEmailAddress(e.target.value)}
                    className="search-input"
                  />
                  <button
                    onClick={handleAddEmailRecipient}
                    disabled={!newEmailName.trim() || !newEmailAddress.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter
                  </button>
                </div>

                {/* List */}
                {emailRecipients.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">
                    Aucun destinataire email
                  </p>
                ) : (
                  <div className="space-y-2">
                    {emailRecipients.map(recipient => (
                      <div key={recipient.id} className="recipient-card">
                        <div className="flex-1">
                          <p className="font-medium">{recipient.name}</p>
                          <p className="text-sm text-muted-foreground">{recipient.email}</p>
                        </div>
                        <button
                          onClick={() => onDeleteEmailRecipient(recipient.id)}
                          className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
                          <p key={idx}>
                            Ligne {row.row}: {row.reason}
                          </p>
                        ))}
                        {importPreview.invalidRows.length > 5 && (
                          <p>... et {importPreview.invalidRows.length - 5} autres</p>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplyImport('merge')}
                        className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground font-medium"
                      >
                        Fusionner
                      </button>
                      <button
                        onClick={() => handleApplyImport('replace')}
                        className="flex-1 py-2 rounded-lg bg-destructive text-destructive-foreground font-medium"
                      >
                        Remplacer tout
                      </button>
                      <button
                        onClick={cancelImport}
                        className="py-2 px-4 rounded-lg bg-muted font-medium"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                )}

                {/* Categories section */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    Catégories
                    <span className="text-sm font-normal text-muted-foreground">
                      ({categories.length})
                    </span>
                  </h4>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportCategories}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Exporter CSV
                    </button>
                    <button
                      onClick={() => categoriesFileRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Importer CSV
                    </button>
                    <input
                      ref={categoriesFileRef}
                      type="file"
                      accept=".csv"
                      onChange={handleCategoriesFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Products section */}
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    Produits
                    <span className="text-sm font-normal text-muted-foreground">
                      ({products.length})
                    </span>
                  </h4>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleExportProducts}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Exporter CSV
                    </button>
                    <button
                      onClick={() => productsFileRef.current?.click()}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-muted hover:bg-muted/80 font-medium transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      Importer CSV
                    </button>
                    <input
                      ref={productsFileRef}
                      type="file"
                      accept=".csv"
                      onChange={handleProductsFileChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* CSV Schema info */}
                <div className="p-3 bg-muted/30 rounded-xl text-sm space-y-2">
                  <p className="font-medium">Format des fichiers CSV :</p>
                  <p className="text-muted-foreground font-mono text-xs">
                    categories.csv: id,name,sortOrder
                  </p>
                  <p className="text-muted-foreground font-mono text-xs">
                    products.csv: id,categoryId,displayName,supplierRef,imageKey
                  </p>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-xl text-sm">
                  <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                  <p className="text-foreground">
                    Importer en mode "Remplacer tout" écrase le catalogue actuel.
                  </p>
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
