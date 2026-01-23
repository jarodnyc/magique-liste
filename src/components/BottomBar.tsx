import React, { useState } from 'react';
import { Send, MessageCircle, Mail, FileText, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomBarProps {
  itemCount: number;
  onWhatsApp: () => void;
  onEmail: () => void;
  onPDF: () => void;
}

export const BottomBar: React.FC<BottomBarProps> = ({
  itemCount,
  onWhatsApp,
  onEmail,
  onPDF,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (itemCount === 0) return null;

  return (
    <div className="bottom-sticky-bar">
      {/* Expanded options */}
      {expanded && (
        <div className="mb-3 flex gap-2 animate-slide-up">
          <button
            onClick={() => {
              onPDF();
              setExpanded(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border font-medium hover:bg-muted transition-colors"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => {
              onEmail();
              setExpanded(false);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border font-medium hover:bg-muted transition-colors"
          >
            <Mail className="w-4 h-4" />
            Email
          </button>
        </div>
      )}

      <div className="flex gap-2">
        {/* More options button */}
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'p-3 rounded-xl border border-border transition-all',
            expanded ? 'bg-muted' : 'bg-card hover:bg-muted'
          )}
          aria-label="Plus d'options"
        >
          <ChevronUp
            className={cn(
              'w-5 h-5 transition-transform',
              expanded && 'rotate-180'
            )}
          />
        </button>

        {/* Main WhatsApp button */}
        <button
          onClick={onWhatsApp}
          className="flex-1 btn-primary-sticky flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20BD5C]"
        >
          <MessageCircle className="w-5 h-5" />
          Envoyer liste ({itemCount})
        </button>
      </div>
    </div>
  );
};
