import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEvaluationById } from "@/hooks/use-customer-evaluations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { StarRating } from "./StarRating";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface EvaluationDetailDialogProps {
  evaluationId: string;
  open: boolean;
  onClose: () => void;
}

export const EvaluationDetailDialog = ({ evaluationId, open, onClose }: EvaluationDetailDialogProps) => {
  const { data: evaluation, isLoading } = useEvaluationById(evaluationId);

  const getNpsEmoji = (score: number) => {
    if (score <= 6) return "😠";
    if (score <= 8) return "😐";
    return "😄";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Avaliação</DialogTitle>
          <DialogDescription>
            Informações completas da avaliação do cliente
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : evaluation ? (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Nome</p>
                <p className="font-medium">{evaluation.customer_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">WhatsApp</p>
                <p className="font-medium">{evaluation.customer_whatsapp}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                <p className="font-medium">
                  {format(new Date(evaluation.customer_birth_date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Data da Avaliação</p>
                <p className="font-medium">
                  {format(new Date(evaluation.evaluation_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </div>

            {/* Respostas */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Respostas</h3>
              {evaluation.evaluation_answers.map((answer) => (
                <div key={answer.id} className="p-4 border rounded-lg space-y-2">
                  <p className="font-medium">{answer.evaluation_questions?.question_text}</p>
                  <StarRating value={answer.score} onChange={() => {}} readonly />
                </div>
              ))}
            </div>

            {/* NPS */}
            {evaluation.nps_score !== null && (
              <div className="p-4 border rounded-lg space-y-2">
                <h3 className="font-semibold">NPS - Net Promoter Score</h3>
                <p className="text-sm text-muted-foreground">
                  De 0 a 10, você indicaria este lugar para alguém?
                </p>
                <div className="flex items-center gap-4">
                  <Badge className="text-2xl px-4 py-2">
                    {evaluation.nps_score} {getNpsEmoji(evaluation.nps_score)}
                  </Badge>
                  {evaluation.nps_score <= 6 && (
                    <p className="text-sm text-destructive">Detrator</p>
                  )}
                  {evaluation.nps_score >= 7 && evaluation.nps_score <= 8 && (
                    <p className="text-sm text-yellow-600">Neutro</p>
                  )}
                  {evaluation.nps_score >= 9 && (
                    <p className="text-sm text-green-600">Promotor</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
