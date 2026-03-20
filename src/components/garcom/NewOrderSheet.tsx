import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { LayoutGrid, ClipboardList } from "lucide-react";

interface NewOrderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMesa: () => void;
  onSelectComandaAvulsa: () => void;
}

export function NewOrderSheet({ open, onOpenChange, onSelectMesa, onSelectComandaAvulsa }: NewOrderSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl px-6 pb-10">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-lg">Novo Pedido</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onSelectMesa}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-colors active:scale-[0.97] hover:border-primary hover:bg-accent"
          >
            <LayoutGrid className="h-10 w-10 text-primary" />
            <span className="text-sm font-semibold text-foreground">Abrir em Mesa</span>
          </button>
          <button
            onClick={onSelectComandaAvulsa}
            className="flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-colors active:scale-[0.97] hover:border-primary hover:bg-accent"
          >
            <ClipboardList className="h-10 w-10 text-primary" />
            <span className="text-sm font-semibold text-foreground">Comanda Avulsa</span>
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
