import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ClipboardList, Play, CheckCircle2, Clock } from "lucide-react";
import { PinLoginScreen } from "@/components/pdv/checklists/execution/PinLoginScreen";
import { ChecklistExecutionPage } from "@/components/pdv/checklists/execution/ChecklistExecutionPage";
import { useChecklistExecution } from "@/hooks/use-checklist-execution";
import { useLogAccess } from "@/hooks/use-checklist-access-logs";
import { Toaster } from "@/components/ui/toaster";

interface Operator {
  id: string;
  name: string;
  sector: string;
  access_level: string;
}

interface ScheduleItem {
  scheduleId: string;
  checklistId: string;
  checklistName: string;
  sector: string;
  shift: string;
  startTime: string;
  maxDuration: number;
  executionId: string | null;
  executionStatus: string | null;
  isStandalone?: boolean;
}

export default function PublicTasks() {
  const { userId } = useParams<{ userId: string }>();
  const [operator, setOperator] = useState<Operator | null>(null);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeExecutionId, setActiveExecutionId] = useState<string | null>(null);

  const { fetchAssignedSchedules, startExecution, getCurrentShift } = useChecklistExecution(userId || "");
  const logAccess = useLogAccess();

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Link inválido</p>
      </div>
    );
  }

  const loadSchedules = async (op: Operator) => {
    setLoading(true);
    try {
      const data = await fetchAssignedSchedules(op.id, op.sector, op.access_level);
      setSchedules(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (op: Operator) => {
    setOperator(op);
    loadSchedules(op);
    logAccess.mutate({ userId: userId!, operatorId: op.id, action: "login", details: { name: op.name } });
  };

  const handleStart = async (item: ScheduleItem) => {
    if (item.executionId) {
      setActiveExecutionId(item.executionId);
      return;
    }
    setLoading(true);
    try {
      const execId = await startExecution(item.checklistId, item.scheduleId, operator!.id);
      setActiveExecutionId(execId);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!operator) {
    return (
      <>
        <Toaster />
        <PinLoginScreen userId={userId} onLogin={handleLogin} />
      </>
    );
  }

  if (activeExecutionId) {
    return (
      <>
        <Toaster />
        <ChecklistExecutionPage
          executionId={activeExecutionId}
          userId={userId}
          onBack={() => {
            setActiveExecutionId(null);
            loadSchedules(operator);
          }}
          onComplete={() => {
            setActiveExecutionId(null);
            loadSchedules(operator);
            if (operator) {
              logAccess.mutate({ userId: userId!, operatorId: operator.id, action: "checklist_complete", details: { executionId: activeExecutionId } });
            }
          }}
        />
      </>
    );
  }

  const currentShift = getCurrentShift();

  const statusLabels: Record<string, string> = {
    concluido: "Concluído",
    em_andamento: "Em andamento",
    atrasado: "Atrasado",
    pendente: "Pendente",
    nao_iniciado: "Não iniciado",
  };

  const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    concluido: "default",
    em_andamento: "secondary",
    atrasado: "destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold">Checklists do Dia</h1>
          <p className="text-sm text-muted-foreground">
            Olá, <strong>{operator.name}</strong> — Turno: {currentShift}
          </p>
          <p className="text-xs text-muted-foreground">
            {operator.access_level === "gestor" || operator.access_level === "lider"
              ? "Visão completa: todos os setores"
              : `Setor: ${operator.sector}`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : schedules.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm space-y-2">
              <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>Nenhum checklist disponível para você hoje.</p>
              {operator.access_level !== "gestor" && operator.access_level !== "lider" && (
                <p className="text-xs">
                  Você está vinculado ao setor <strong>{operator.sector}</strong>. Se precisa ver outros setores, peça ao gestor para ajustar seu nível de acesso.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {schedules.map((item) => {
              const isDone = item.executionStatus === "concluido";
              return (
                <Card key={item.scheduleId} className={isDone ? "opacity-60" : ""}>
                  <CardContent className="py-4 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{item.checklistName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-[10px]">{item.sector}</Badge>
                        {item.isStandalone ? (
                          <Badge variant="secondary" className="text-[10px]">Avulso</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {item.shift} — {item.startTime}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.executionStatus && (
                      <Badge variant={statusColors[item.executionStatus] || "outline"} className="text-[10px] shrink-0">
                        {statusLabels[item.executionStatus] || item.executionStatus}
                      </Badge>
                    )}
                    {!isDone && (
                      <Button size="sm" onClick={() => handleStart(item)} disabled={loading}>
                        {item.executionId ? (
                          <>
                            <Play className="h-3.5 w-3.5 mr-1" /> Continuar
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 mr-1" /> Iniciar
                          </>
                        )}
                      </Button>
                    )}
                    {isDone && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center pt-4">
          <Button variant="ghost" size="sm" onClick={() => setOperator(null)}>
            Trocar operador
          </Button>
        </div>
      </div>
    </div>
  );
}
