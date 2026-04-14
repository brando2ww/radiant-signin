import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { ExecutionTimer } from "./ExecutionTimer";
import { ExecutionItemRenderer, type ChecklistItemData } from "./ExecutionItemRenderer";
import { useChecklistExecution } from "@/hooks/use-checklist-execution";
import { toast } from "@/hooks/use-toast";

interface ChecklistExecutionPageProps {
  executionId: string;
  userId: string;
  onBack: () => void;
  onComplete: () => void;
}

export function ChecklistExecutionPage({ executionId, userId, onBack, onComplete }: ChecklistExecutionPageProps) {
  const { loadExecution, saveItemValue, completeExecution, createAlert } = useChecklistExecution(userId);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [alertedItems, setAlertedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadExecution(executionId).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [executionId, loadExecution]);

  const handleSave = useCallback(
    async (execItemId: string, value: any, photoUrl: string | null, isCompliant: boolean | null) => {
      await saveItemValue(execItemId, value, photoUrl, isCompliant);

      // Update local state
      setData((prev: any) => {
        if (!prev) return prev;
        const items = prev.items.map((it: ChecklistItemData) =>
          it.executionItemId === execItemId
            ? { ...it, value, photo_url: photoUrl, is_compliant: isCompliant, completed_at: new Date().toISOString() }
            : it
        );
        return { ...prev, items };
      });

      // Auto-alert for out of range
      if (isCompliant === false && !alertedItems.has(execItemId)) {
        const item = data?.items?.find((i: any) => i.executionItemId === execItemId);
        if (item) {
          const alertType = item.item_type === "temperature" ? "temperatura_fora" as const : "item_critico" as const;
          await createAlert(executionId, item.id, alertType, `${item.title}: valor ${value} fora da faixa (${item.min_value ?? "—"} a ${item.max_value ?? "—"})`);
          setAlertedItems((prev) => new Set(prev).add(execItemId));
          toast({ title: "⚠️ Alerta gerado", description: `${item.title} fora da faixa permitida`, variant: "destructive" });
        }
      }
    },
    [saveItemValue, createAlert, executionId, data, alertedItems]
  );

  const handleComplete = async () => {
    setCompleting(true);
    try {
      const score = await completeExecution(executionId);
      toast({ title: `Checklist concluído! Nota: ${score}/100` });
      onComplete();
    } catch {
      toast({ title: "Erro ao concluir", variant: "destructive" });
    } finally {
      setCompleting(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const items: ChecklistItemData[] = data.items;
  const totalRequired = items.filter((i) => i.is_required).length;
  const completedRequired = items.filter((i) => i.is_required && i.completed_at != null).length;
  const allRequiredDone = completedRequired >= totalRequired;
  const totalDone = items.filter((i) => i.completed_at != null).length;
  const progress = items.length > 0 ? Math.round((totalDone / items.length) * 100) : 0;

  return (
    <div className="max-w-lg mx-auto p-4 space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold truncate">{data.checklistName}</h2>
          <div className="flex items-center gap-2">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-xs text-muted-foreground">{progress}%</span>
          </div>
        </div>
        {data.started_at && data.maxDuration > 0 && (
          <ExecutionTimer startedAt={data.started_at} maxMinutes={data.maxDuration} />
        )}
      </div>

      {/* Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <ExecutionItemRenderer
            key={item.executionItemId}
            item={item}
            onSave={handleSave}
            userId={userId}
            executionId={executionId}
          />
        ))}
      </div>

      {/* Submit */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
        <div className="max-w-lg mx-auto">
          <Button
            className="w-full"
            size="lg"
            disabled={!allRequiredDone || completing || data.status === "concluido"}
            onClick={handleComplete}
          >
            {completing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle2 className="h-4 w-4 mr-2" />
            )}
            {data.status === "concluido"
              ? "Já Concluído"
              : !allRequiredDone
              ? `Faltam ${totalRequired - completedRequired} obrigatórios`
              : "Concluir Checklist"}
          </Button>
        </div>
      </div>
    </div>
  );
}
