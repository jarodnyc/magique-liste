import React, { useState } from 'react';
import { X, MessageCircle, Copy, Check, ChevronRight } from 'lucide-react';
import { Recipient } from '@/types/grocery';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';

interface WhatsAppExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: Recipient[];
  message: string;
  onGoToSettings: () => void;
}

export const WhatsAppExport: React.FC<WhatsAppExportProps> = ({
  open,
  onOpenChange,
  recipients,
  message,
  onGoToSettings,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const selectedRecipients = recipients.filter(r => selectedIds.has(r.id) && r.phone);

  const toggleRecipient = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getWhatsAppLink = (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenNext = () => {
    if (currentIndex < selectedRecipients.length) {
      const recipient = selectedRecipients[currentIndex];
      if (recipient.phone) {
        window.open(getWhatsAppLink(recipient.phone), '_blank');
        setCurrentIndex(prev => prev + 1);
      }
    }
  };

  const resetSelection = () => {
    setSelectedIds(new Set());
    setCurrentIndex(0);
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetSelection();
      onOpenChange(isOpen);
    }}>
      <SheetContent side="bottom" className="modal-content rounded-t-2xl max-h-[85vh]">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#25D366]" />
            Envoyer par WhatsApp
          </SheetTitle>
        </SheetHeader>

        <div className="py-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {recipients.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Aucun destinataire configuré
              </p>
              <button
                onClick={() => {
                  onOpenChange(false);
                  onGoToSettings();
                }}
                className="text-primary font-medium hover:underline"
              >
                Ajouter des numéros dans Réglages →
              </button>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Sélectionnez les destinataires :
              </p>
              
              <div className="space-y-2">
                {recipients.map(recipient => (
                  <label
                    key={recipient.id}
                    className={cn(
                      'recipient-card cursor-pointer',
                      selectedIds.has(recipient.id) && 'bg-accent border-primary/30'
                    )}
                  >
                    <Checkbox
                      checked={selectedIds.has(recipient.id)}
                      onCheckedChange={() => toggleRecipient(recipient.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{recipient.name}</p>
                      <p className="text-sm text-muted-foreground">{recipient.phone}</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedRecipients.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-border">
                  {/* Sequential helper */}
                  {selectedRecipients.length > 1 && (
                    <div className="flex items-center justify-between bg-muted/50 rounded-xl p-3">
                      <span className="text-sm">
                        {currentIndex < selectedRecipients.length
                          ? `Prochain: ${selectedRecipients[currentIndex].name}`
                          : 'Tous envoyés ✓'}
                      </span>
                      <button
                        onClick={handleOpenNext}
                        disabled={currentIndex >= selectedRecipients.length}
                        className={cn(
                          'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium',
                          currentIndex < selectedRecipients.length
                            ? 'bg-[#25D366] text-white'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        Ouvrir le prochain
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Individual links */}
                  <div className="space-y-2">
                    {selectedRecipients.map((recipient, idx) => (
                      <a
                        key={recipient.id}
                        href={getWhatsAppLink(recipient.phone!)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          'flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all',
                          idx < currentIndex
                            ? 'bg-muted text-muted-foreground line-through'
                            : 'bg-[#25D366] text-white hover:bg-[#20BD5C]'
                        )}
                        onClick={() => {
                          if (idx === currentIndex) {
                            setCurrentIndex(prev => prev + 1);
                          }
                        }}
                      >
                        <MessageCircle className="w-4 h-4" />
                        {recipient.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Copy button */}
              <button
                onClick={handleCopy}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-success" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copier le message
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
