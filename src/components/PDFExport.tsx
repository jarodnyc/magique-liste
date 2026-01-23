import React, { useRef } from 'react';
import { Printer, X } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface GroupedItem {
  category: string;
  items: { ref: string; qty: number }[];
}

interface PDFExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupedItems: GroupedItem[];
}

export const PDFExport: React.FC<PDFExportProps> = ({
  open,
  onOpenChange,
  groupedItems,
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Print-only styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-content, .print-content * {
            visibility: visible;
          }
          .print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="modal-content rounded-t-2xl max-h-[85vh]">
          <SheetHeader className="pb-4 border-b border-border no-print">
            <SheetTitle className="flex items-center gap-2">
              <Printer className="w-5 h-5 text-primary" />
              Aperçu PDF / Impression
            </SheetTitle>
          </SheetHeader>

          <div className="py-4 space-y-4 overflow-y-auto max-h-[50vh] no-print">
            <p className="text-sm text-muted-foreground">
              Aperçu de la liste groupée par catégorie :
            </p>

            <div className="bg-muted/30 rounded-xl p-4 space-y-4">
              {groupedItems.map((group, idx) => (
                <div key={idx}>
                  <h3 className="font-semibold text-foreground mb-2">
                    {group.category}
                  </h3>
                  <div className="space-y-1 pl-2">
                    {group.items.map((item, itemIdx) => (
                      <p key={itemIdx} className="text-sm text-muted-foreground font-mono">
                        {item.ref} x{item.qty}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Imprimer / Enregistrer en PDF
            </button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Hidden print content */}
      <div ref={printRef} className="print-content hidden print:block">
        <h1 className="text-2xl font-bold mb-6">Liste de courses</h1>
        {groupedItems.map((group, idx) => (
          <div key={idx} className="mb-4">
            <h2 className="font-bold text-lg border-b pb-1 mb-2">
              {group.category}
            </h2>
            {group.items.map((item, itemIdx) => (
              <p key={itemIdx} className="font-mono">
                {item.ref} x{item.qty}
              </p>
            ))}
          </div>
        ))}
      </div>
    </>
  );
};
