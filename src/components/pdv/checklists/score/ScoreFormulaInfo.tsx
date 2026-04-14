import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Clock, CheckSquare, Star } from "lucide-react";

interface ScoreFormulaInfoProps {
  onNavigate?: (section: string) => void;
}

const FORMULA_ITEMS = [
  { label: "Pontualidade", weight: 40, icon: Clock, color: "bg-blue-500", desc: "Concluiu dentro do prazo máximo" },
  { label: "Completude", weight: 30, icon: CheckSquare, color: "bg-green-500", desc: "Todos os itens preenchidos" },
  { label: "Qualidade", weight: 30, icon: Star, color: "bg-yellow-500", desc: "Média das avaliações por estrelas" },
];

export function ScoreFormulaInfo({ onNavigate }: ScoreFormulaInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Como o Score é Calculado</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          O score de cada colaborador é calculado automaticamente com base em 3 critérios:
        </p>
        <div className="space-y-3">
          {FORMULA_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex items-center gap-3">
                <div className={`h-8 w-8 rounded-md ${item.color} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className="text-xs text-muted-foreground">({item.weight}%)</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <div className="w-24">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.weight}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-lg bg-muted/50 text-center">
          <p className="text-xs text-muted-foreground">
            Score = (Pontualidade × 0.4) + (Completude × 0.3) + (Qualidade × 0.3)
          </p>
        </div>

        {onNavigate && (
          <Button variant="ghost" size="sm" className="mt-3 text-xs" onClick={() => onNavigate("configuracoes")}>
            <Settings className="h-3.5 w-3.5 mr-1.5" />
            Ajustar pesos nas Configurações
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
