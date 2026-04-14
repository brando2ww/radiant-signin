import { Card, CardContent } from "@/components/ui/card";
import { Camera, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { EvidenceItem } from "@/hooks/use-checklist-evidence";

interface Props {
  evidence: EvidenceItem[];
}

export function EvidenceOverview({ evidence }: Props) {
  const total = evidence.length;
  const pending = evidence.filter(e => !e.reviewStatus || e.reviewStatus === "pendente").length;
  const approved = evidence.filter(e => e.reviewStatus === "aprovado").length;
  const rejected = evidence.filter(e => e.reviewStatus === "reprovado").length;

  const cards = [
    { label: "Total de Evidências", value: total, icon: Camera, color: "text-primary" },
    { label: "Pendentes de Revisão", value: pending, icon: Clock, color: "text-yellow-500" },
    { label: "Aprovadas", value: approved, icon: CheckCircle2, color: "text-green-500" },
    { label: "Reprovadas", value: rejected, icon: XCircle, color: "text-destructive" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map(c => (
        <Card key={c.label}>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-muted ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
