import React from 'react';
import { Settings, RotateCcw } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onResetQuantities: () => void;
  hasItemsInCart: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onResetQuantities,
  hasItemsInCart,
}) => {
  return (
    <header className="flex items-center justify-between px-4 py-3">
      <h1 className="text-xl font-bold font-display text-foreground">
        🛒 Ma Liste
      </h1>
      
      <div className="flex items-center gap-2">
        {hasItemsInCart && (
          <button
            onClick={onResetQuantities}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
            aria-label="Réinitialiser les quantités"
            title="Réinitialiser"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
        
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Réglages"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
