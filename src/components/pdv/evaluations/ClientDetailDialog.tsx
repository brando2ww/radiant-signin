import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, MessageSquare, Star, User } from "lucide-react";
import { formatPhoneForWhatsApp } from "@/lib/whatsapp-message";
import type { EvaluationWithAnswers } from "@/hooks/use-customer-evaluations";

interface ClientDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: {
    name: string;
    whatsapp: string;
    birthDate: string | null;
    totalEvaluations: number;
    avgNps: number | null;
    firstEvaluation: string;
    lastEvaluation: string;
    npsCategory: "promoter" | "neutral" | "detractor" | "none";
    evaluations: EvaluationWithAnswers[];
  } | null;
}

export default function ClientDetailDialog({ open, onOpenChange, client }: ClientDetailDialogProps) {
  if (!client) return null;

  const npsColor = {
    promoter: "text-green-600",
    neutral: "text-yellow-600",
    detractor: "text-red-600",
    none: "text-muted-foreground",
  }[client.npsCategory];

  const handleWhatsApp = () => {
    const phone = formatPhoneForWhatsApp(client.whatsapp);
    window.open(`https://wa.me/${phone}`, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {client.name}
          </DialogTitle>
          <DialogDescription>Histórico completo do cliente</DialogDescription>
        </DialogHeader>

        {/* Client info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground">WhatsApp</span>
            <p className="font-medium">{client.whatsapp}</p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Aniversário</span>
            <p className="font-medium">
              {client.birthDate
                ? format(new Date(client.birthDate), "dd/MM/yyyy", { locale: ptBR })
                : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Cadastro</span>
            <p className="font-medium">
              {format(new Date(client.firstEvaluation), "dd/MM/yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">NPS Médio</span>
            <p className={`font-bold ${npsColor}`}>
              {client.avgNps !== null ? client.avgNps.toFixed(1) : "N/A"}
            </p>
          </div>
        </div>

        <Button variant="outline" size="sm" className="w-fit gap-2" onClick={handleWhatsApp}>
          <WhatsAppIcon size={16} className="text-green-600" />
          Enviar mensagem
        </Button>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1" style={{ maxHeight: 300 }}>
          <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {client.totalEvaluations} avaliação{client.totalEvaluations !== 1 ? "ões" : ""}
          </h4>

          {client.evaluations.map((ev) => {
            const avgScore =
              ev.evaluation_answers.length > 0
                ? ev.evaluation_answers.reduce((s, a) => s + a.score, 0) / ev.evaluation_answers.length
                : null;
            const comments = ev.evaluation_answers.filter((a) => a.comment).map((a) => a.comment!);

            return (
              <div
                key={ev.id}
                className="border border-border rounded-lg p-3 space-y-2 bg-muted/30"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {format(new Date(ev.evaluation_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  <div className="flex items-center gap-2">
                    {avgScore !== null && (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        {avgScore.toFixed(1)}
                      </Badge>
                    )}
                    {ev.nps_score !== null && (
                      <Badge
                        className={
                          ev.nps_score >= 9
                            ? "bg-green-500/20 text-green-700 border-green-300"
                            : ev.nps_score >= 7
                              ? "bg-yellow-500/20 text-yellow-700 border-yellow-300"
                              : "bg-red-500/20 text-red-700 border-red-300"
                        }
                      >
                        NPS {ev.nps_score}
                      </Badge>
                    )}
                  </div>
                </div>

                {comments.length > 0 && (
                  <div className="space-y-1">
                    {comments.map((c, i) => (
                      <p key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                        <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
                        {c}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
