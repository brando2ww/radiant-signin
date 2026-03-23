import { useParams } from "react-router-dom";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Clock, Camera, Loader2 } from "lucide-react";
import { usePublicTasks } from "@/hooks/use-public-tasks";
import { format } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function PublicTasks() {
  const { userId } = useParams<{ userId: string }>();
  const { instances, isLoading, settings, completeTask, isCompleting } = usePublicTasks(userId || "");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [completingId, setCompletingId] = useState<string | null>(null);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Link inválido</p>
      </div>
    );
  }

  const shifts = settings?.shifts || [
    { name: "Abertura", start: "06:00", end: "11:00" },
    { name: "Tarde", start: "11:00", end: "17:00" },
    { name: "Fechamento", start: "17:00", end: "23:00" },
  ];

  const totalDone = instances.filter((i) => i.status === "done").length;
  const progress = instances.length > 0 ? Math.round((totalDone / instances.length) * 100) : 0;

  const grouped = shifts.map((s) => ({
    shift: s,
    tasks: instances.filter((i) => i.shift === s.name.toLowerCase() || i.shift === s.name),
  })).filter((g) => g.tasks.length > 0);

  const handleComplete = (id: string) => {
    setCompletingId(id);
    completeTask(
      { id, completedBy: name || undefined },
      {
        onSuccess: () => {
          toast({ title: "Tarefa concluída!" });
          setExpandedId(null);
          setCompletingId(null);
        },
        onError: () => setCompletingId(null),
      }
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="text-center space-y-1">
          <h1 className="text-xl font-bold">Tarefas do Dia</h1>
          <p className="text-sm text-muted-foreground">{format(new Date(), "dd/MM/yyyy")}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : instances.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground text-sm">
              Nenhuma tarefa para hoje.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm">{totalDone}/{instances.length}</span>
              <Progress value={progress} className="w-40 h-2" />
              <Badge variant={progress === 100 ? "default" : "secondary"}>{progress}%</Badge>
            </div>

            {grouped.map(({ shift, tasks }) => (
              <Card key={shift.name}>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {shift.name}
                    <span className="text-xs text-muted-foreground font-normal">
                      ({shift.start} - {shift.end})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-3 pt-0 space-y-2">
                  {tasks.map((task) => {
                    const isDone = task.status === "done";
                    const isExpanded = expandedId === task.id;

                    return (
                      <div key={task.id} className={`rounded-md border p-3 ${isDone ? "bg-primary/5 border-primary/20" : ""}`}>
                        <div
                          className="flex items-center gap-3 cursor-pointer"
                          onClick={() => !isDone && setExpandedId(isExpanded ? null : task.id)}
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium ${isDone ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </p>
                            {task.assignedTo && (
                              <p className="text-xs text-muted-foreground">Resp: {task.assignedTo}</p>
                            )}
                          </div>
                          {isDone && task.completedAt && (
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(task.completedAt), "HH:mm")}
                            </span>
                          )}
                          {isDone && task.completedBy && (
                            <Badge variant="outline" className="text-xs">{task.completedBy}</Badge>
                          )}
                        </div>

                        {isExpanded && !isDone && (
                          <div className="mt-3 space-y-2 pl-8">
                            <Input
                              placeholder="Seu nome (opcional)"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="text-sm"
                            />
                            {task.requiresPhoto && (
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Camera className="h-4 w-4" />
                                <span>Foto obrigatória (em breve)</span>
                              </div>
                            )}
                            <Button
                              size="sm"
                              className="w-full"
                              onClick={() => handleComplete(task.id)}
                              disabled={completingId === task.id}
                            >
                              {completingId === task.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                              )}
                              Marcar como Feito
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
