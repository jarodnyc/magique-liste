import React, { useState, useMemo } from 'react';
import { useGroceryStore } from '@/hooks/useGroceryStore';
import { Header } from '@/components/Header';
import { CategoryChips } from '@/components/CategoryChips';
import { SearchBar } from '@/components/SearchBar';
import { ProductCard } from '@/components/ProductCard';
import { BottomBar } from '@/components/BottomBar';
import { WhatsAppExport } from '@/components/WhatsAppExport';
import { EmailExport } from '@/components/EmailExport';
import { PDFExport } from '@/components/PDFExport';
import { Settings } from '@/components/Settings';
import { ConfirmDialog } from '@/components/ConfirmDialog';

const Index = () => {
  const {
    categories,
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
    deleteSupplier,
    addProduct,
    deleteProduct,
    deleteCategory,
    getListItems,
    generateExportText,
    generateGroupedExport,
  } = useGroceryStore();

  // UI State
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showSettings, setShowSettings] = useState(false);
  const [showWhatsApp, setShowWhatsApp] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let result = products;

    // Filter by favorites
    if (showFavorites) {
      result = result.filter(p => favorites.has(p.id));
    }

    // Filter by category (only when NOT searching)
    if (selectedCategory && !showFavorites && !searchQuery.trim()) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Filter by search (displayName and supplierRef)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(p => 
        p.displayName.toLowerCase().includes(query) ||
        p.supplierRef.toLowerCase().includes(query)
      );
    }

    // Sort by category order
    return result.sort((a, b) => {
      const catA = categories.find(c => c.id === a.categoryId);
      const catB = categories.find(c => c.id === b.categoryId);
      return (catA?.sortOrder || 999) - (catB?.sortOrder || 999);
    });
  }, [products, selectedCategory, showFavorites, searchQuery, favorites, categories]);

  // Count items in cart
  const cartItemCount = Object.values(quantities).filter(q => q > 0).length;

  // Handle category selection
  const handleSelectCategory = (categoryId: string | null) => {
    setShowFavorites(false);
    setSelectedCategory(categoryId);
  };

  // Handle favorites toggle
  const handleToggleFavorites = () => {
    setShowFavorites(!showFavorites);
    if (!showFavorites) {
      setSelectedCategory(null);
    }
  };

  // Handle reset
  const handleResetConfirm = () => {
    resetQuantities();
    setShowResetConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <div className="sticky-header">
        <Header
          onOpenSettings={() => setShowSettings(true)}
          onResetQuantities={() => setShowResetConfirm(true)}
          hasItemsInCart={cartItemCount > 0}
        />
        
        {/* Category Chips */}
        <div className="px-4">
          <CategoryChips
            categories={categories}
            selectedCategory={selectedCategory}
            showFavorites={showFavorites}
            onSelectCategory={handleSelectCategory}
            onToggleFavorites={handleToggleFavorites}
          />
        </div>
        
        {/* Search Bar */}
        <div className="px-4 py-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Rechercher un produit..."
          />
        </div>
      </div>

      {/* Product List */}
      <div className="px-4 py-2 space-y-2">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {showFavorites
                ? 'Aucun favori'
                : searchQuery
                ? 'Aucun produit trouvé'
                : 'Aucun produit dans cette catégorie'}
            </p>
          </div>
        ) : (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              quantity={quantities[product.id] || 0}
              isFavorite={favorites.has(product.id)}
              onQuantityChange={(qty) => setQuantity(product.id, qty)}
              onIncrement={() => incrementQuantity(product.id)}
              onDecrement={() => decrementQuantity(product.id)}
              onToggleFavorite={() => toggleFavorite(product.id)}
            />
          ))
        )}
      </div>

      {/* Bottom Bar */}
      <BottomBar
        itemCount={cartItemCount}
        onWhatsApp={() => setShowWhatsApp(true)}
        onEmail={() => setShowEmail(true)}
        onPDF={() => setShowPDF(true)}
      />

      {/* Modals */}
      <WhatsAppExport
        open={showWhatsApp}
        onOpenChange={setShowWhatsApp}
        recipients={waRecipients}
        message={generateExportText()}
        onGoToSettings={() => setShowSettings(true)}
      />

      <EmailExport
        open={showEmail}
        onOpenChange={setShowEmail}
        recipients={emailRecipients}
        message={generateExportText()}
        onGoToSettings={() => setShowSettings(true)}
      />

      <PDFExport
        open={showPDF}
        onOpenChange={setShowPDF}
        groupedItems={generateGroupedExport()}
      />

      <Settings
        open={showSettings}
        onOpenChange={setShowSettings}
        waRecipients={waRecipients}
        emailRecipients={emailRecipients}
        categories={categories}
        products={products}
        suppliers={suppliers}
        onAddWaRecipient={addWaRecipient}
        onUpdateWaRecipient={updateWaRecipient}
        onDeleteWaRecipient={deleteWaRecipient}
        onAddEmailRecipient={addEmailRecipient}
        onUpdateEmailRecipient={updateEmailRecipient}
        onDeleteEmailRecipient={deleteEmailRecipient}
        onUpdateCategories={updateCategories}
        onUpdateProducts={updateProducts}
        onAddSupplier={addSupplier}
        onDeleteSupplier={deleteSupplier}
        onAddProduct={addProduct}
        onDeleteProduct={deleteProduct}
        onDeleteCategory={deleteCategory}
      />

      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Réinitialiser les quantités"
        description="Voulez-vous vraiment remettre toutes les quantités à zéro ?"
        confirmLabel="Réinitialiser"
        variant="destructive"
        onConfirm={handleResetConfirm}
      />
    </div>
  );
};

export default Index;
