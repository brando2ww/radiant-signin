import { Gift } from "lucide-react";

export default function EvalCupons() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="text-center py-16 text-muted-foreground">
        <Gift className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium">Cupons</p>
        <p className="text-sm mt-1">Em breve: painel de cupons emitidos, gestão e validação.</p>
      </div>
    </div>
  );
}
