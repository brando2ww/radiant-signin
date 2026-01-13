import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard, Unlock, TrendingUp, TrendingDown, Lock, HelpCircle, Receipt } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const shortcuts = [
  {
    category: "Caixa Fechado",
    items: [
      { key: "F1", description: "Abrir Caixa", icon: Unlock, color: "text-green-600" },
    ],
  },
  {
    category: "Caixa Aberto",
    items: [
      { key: "F2", description: "Adicionar Reforço", icon: TrendingUp, color: "text-green-600" },
      { key: "F3", description: "Realizar Sangria", icon: TrendingDown, color: "text-orange-600" },
      { key: "F4", description: "Fechar Caixa", icon: Lock, color: "text-red-600" },
      { key: "F5", description: "Cobrar Comanda/Mesa", icon: Receipt, color: "text-primary" },
    ],
  },
  {
    category: "Geral",
    items: [
      { key: "F12", description: "Mostrar/Ocultar este guia", icon: HelpCircle, color: "text-blue-600" },
    ],
  },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atalhos de Teclado
          </DialogTitle>
          <DialogDescription>
            Use os atalhos abaixo para agilizar as operações do caixa.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {section.category}
              </h4>
              <div className="space-y-2">
                {section.items.map((shortcut) => (
                  <div
                    key={shortcut.key}
                    className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                  >
                    <kbd className="inline-flex items-center justify-center min-w-[3rem] h-8 px-2 text-sm font-semibold bg-background border rounded-md shadow-sm">
                      {shortcut.key}
                    </kbd>
                    <shortcut.icon className={`h-4 w-4 ${shortcut.color}`} />
                    <span className="text-sm">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Entendi, Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
