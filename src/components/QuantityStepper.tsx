import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrement}
        className={cn(
          'stepper-btn',
          value === 0 && 'opacity-40 cursor-not-allowed'
        )}
        disabled={value === 0}
        aria-label="Diminuer la quantité"
      >
        <Minus className="w-4 h-4" />
      </button>
      
      <span className={cn(
        'w-8 text-center font-semibold text-lg tabular-nums',
        value > 0 ? 'text-primary' : 'text-muted-foreground'
      )}>
        {value}
      </span>
      
      <button
        onClick={onIncrement}
        className="stepper-btn"
        aria-label="Augmenter la quantité"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
