import React, { useState } from 'react';
import { Mail, Copy, Check, ExternalLink } from 'lucide-react';
import { Recipient } from '@/types/grocery';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';

interface EmailExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipients: Recipient[];
  message: string;
  onGoToSettings: () => void;
}

export const EmailExport: React.FC<EmailExportProps> = ({
  open,
  onOpenChange,
  recipients,
  message,
  onGoToSettings,
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState(false);

  const selectedRecipients = recipients.filter(r => selectedIds.has(r.id) && r.email);

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

  const getMailtoLink = () => {
    const emails = selectedRecipients.map(r => r.email).join(',');
    const subject = encodeURIComponent('Liste de courses');
    const body = encodeURIComponent(message);
    return `mailto:${emails}?subject=${subject}&body=${body}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetSelection = () => {
    setSelectedIds(new Set());
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => {
      if (!isOpen) resetSelection();
      onOpenChange(isOpen);
    }}>
      <SheetContent side="bottom" className="modal-content rounded-t-2xl max-h-[85vh]">
        <SheetHeader className="pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Envoyer par Email
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
                Ajouter des emails dans Réglages →
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
                      <p className="text-sm text-muted-foreground">{recipient.email}</p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedRecipients.length > 0 && (
                <div className="pt-4 border-t border-border space-y-3">
                  <a
                    href={getMailtoLink()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    Ouvrir dans l'application Email
                    <ExternalLink className="w-4 h-4" />
                  </a>
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
