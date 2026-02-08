import React from 'react';
import { Star } from 'lucide-react';
import { Product } from '@/types/grocery';
import { QuantityStepper } from './QuantityStepper';
import { getProductIcon } from '@/utils/iconMap';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  quantity: number;
  isFavorite: boolean;
  onQuantityChange: (qty: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleFavorite: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  isFavorite,
  onQuantityChange,
  onIncrement,
  onDecrement,
  onToggleFavorite,
}) => {
  const icon = getProductIcon(product.imageKey);
  const isImageFile = product.imageKey.startsWith('IMG/');

  return (
    <div className={cn(
      'card-product p-3 flex items-center gap-3 animate-slide-up',
      quantity > 0 && 'ring-2 ring-primary/30 bg-accent/30'
    )}>
      {/* Icon / Image */}
      <div className="icon-wrapper">
        {isImageFile ? (
          <img
            src={'/' + product.imageKey}
            alt={product.displayName}
            className="w-8 h-8 rounded object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : (
          <span role="img" aria-label={product.displayName}>
            {icon}
          </span>
        )}
        {isImageFile && (
          <span className="hidden" role="img" aria-label={product.displayName}>
            {icon}
          </span>
        )}
      </div>

      {/* Product Name */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-foreground truncate">
          {product.displayName}
        </h3>
      </div>

      {/* Favorite Button */}
      <button
        onClick={onToggleFavorite}
        className="favorite-btn p-1.5"
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Star
          className={cn(
            'w-5 h-5 transition-colors',
            isFavorite
              ? 'fill-favorite text-favorite'
              : 'text-muted-foreground hover:text-favorite'
          )}
        />
      </button>

      {/* Quantity Stepper */}
      <QuantityStepper
        value={quantity}
        onChange={onQuantityChange}
        onIncrement={onIncrement}
        onDecrement={onDecrement}
      />
    </div>
  );
};
