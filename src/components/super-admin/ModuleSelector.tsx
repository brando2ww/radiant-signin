import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const availableModules = [
  { value: "pdv", label: "PDV", description: "Ponto de venda, caixa, salão, comandas" },
  { value: "delivery", label: "Delivery", description: "Pedidos online, cardápio digital" },
  { value: "financeiro", label: "Financeiro", description: "Contas, fluxo de caixa, DRE" },
  { value: "crm", label: "CRM", description: "Gestão de leads e clientes" },
  { value: "avaliacoes", label: "Avaliações", description: "Pesquisa de satisfação NPS" },
];

interface ModuleSelectorProps {
  selected: string[];
  onChange: (modules: string[]) => void;
}

export function ModuleSelector({ selected, onChange }: ModuleSelectorProps) {
  const toggle = (mod: string) => {
    onChange(
      selected.includes(mod)
        ? selected.filter((m) => m !== mod)
        : [...selected, mod]
    );
  };

  return (
    <div className="space-y-3">
      {availableModules.map((mod) => (
        <div
          key={mod.value}
          className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => toggle(mod.value)}
        >
          <Checkbox
            checked={selected.includes(mod.value)}
            onCheckedChange={() => toggle(mod.value)}
            className="mt-0.5"
          />
          <div>
            <Label className="font-medium cursor-pointer">{mod.label}</Label>
            <p className="text-xs text-muted-foreground">{mod.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
