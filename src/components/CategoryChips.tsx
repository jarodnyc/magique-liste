import React from 'react';
import { Star } from 'lucide-react';
import { Category } from '@/types/grocery';
import { cn } from '@/lib/utils';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string | null;
  showFavorites: boolean;
  onSelectCategory: (categoryId: string | null) => void;
  onToggleFavorites: () => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  showFavorites,
  onSelectCategory,
  onToggleFavorites,
}) => {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1">
      {/* Favorites chip */}
      <button
        onClick={onToggleFavorites}
        className={cn(
          'chip flex items-center gap-1.5 whitespace-nowrap flex-shrink-0',
          showFavorites && 'chip-active'
        )}
      >
        <Star className={cn('w-4 h-4', showFavorites ? 'fill-current' : '')} />
        Favoris
      </button>

      {/* All chip */}
      <button
        onClick={() => onSelectCategory(null)}
        className={cn(
          'chip whitespace-nowrap flex-shrink-0',
          selectedCategory === null && !showFavorites && 'chip-active'
        )}
      >
        Tout
      </button>

      {/* Category chips */}
      {categories.map(category => (
        <button
          key={category.id}
          onClick={() => onSelectCategory(category.id)}
          className={cn(
            'chip whitespace-nowrap flex-shrink-0',
            selectedCategory === category.id && !showFavorites && 'chip-active'
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
};
