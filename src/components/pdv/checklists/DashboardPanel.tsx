import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Clock, AlertTriangle, XCircle, Activity } from "lucide-react";
import { useChecklistDashboard } from "@/hooks/use-checklist-dashboard";
import { CompletionChart } from "./CompletionChart";
import { ShiftComparison } from "./ShiftComparison";
import { AlertsPanel } from "./AlertsPanel";
import { format } from "date-fns";

export function DashboardPanel() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const { metrics, completionChart, shiftComparison, alerts, unacknowledgedAlerts, acknowledgeAlert, isLoading, metricsLoading } =
    useChecklistDashboard({ date });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        {unacknowledgedAlerts.length > 0 && (
          <Badge variant="destructive">{unacknowledgedAlerts.length} alerta(s)</Badge>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Concluídos"
          value={metrics?.concluido ?? 0}
          icon={CheckCircle2}
          color="text-green-600"
          loading={metricsLoading}
        />
        <MetricCard
          title="Em Andamento"
          value={metrics?.emAndamento ?? 0}
          icon={Activity}
          color="text-blue-600"
          loading={metricsLoading}
        />
        <MetricCard
          title="Atrasados"
          value={metrics?.atrasado ?? 0}
          icon={AlertTriangle}
          color="text-orange-600"
          loading={metricsLoading}
        />
        <MetricCard
          title="Não Iniciados"
          value={metrics?.naoIniciado ?? 0}
          icon={XCircle}
          color="text-muted-foreground"
          loading={metricsLoading}
        />
      </div>

      {/* Score */}
      {metrics && metrics.total > 0 && (
        <Card>
          <CardContent className="py-4 flex items-center justify-between">
            <span className="text-sm font-medium">Score médio do dia</span>
            <Badge variant="secondary" className="text-lg">{metrics.avgScore}/100</Badge>
          </CardContent>
        </Card>
      )}

      {/* Charts & Shifts */}
      <div className="grid gap-4 md:grid-cols-2">
        <CompletionChart data={completionChart} />
        <ShiftComparison data={shiftComparison} />
      </div>

      {/* Alerts */}
      <AlertsPanel alerts={alerts} onAcknowledge={(id) => acknowledgeAlert({ alertId: id })} />

      {/* Activity Feed */}
      {metrics?.executions && metrics.executions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {metrics.executions.slice(0, 15).map((exec: any) => (
              <div key={exec.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                <div className="flex items-center gap-2 min-w-0">
                  <StatusDot status={exec.status} />
                  <span className="truncate">{exec.checklists?.name || "Checklist"}</span>
                  <span className="text-muted-foreground text-xs">
                    {exec.checklist_operators?.name || "—"}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">
                  {exec.completed_at
                    ? format(new Date(exec.completed_at), "HH:mm")
                    : exec.started_at
                    ? format(new Date(exec.started_at), "HH:mm")
                    : "—"}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, loading }: any) {
  if (loading) return <Card><CardContent className="py-6"><Skeleton className="h-10 w-full" /></CardContent></Card>;
  return (
    <Card>
      <CardContent className="py-4 flex items-center gap-3">
        <Icon className={`h-8 w-8 ${color}`} />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    concluido: "bg-green-500",
    em_andamento: "bg-blue-500",
    atrasado: "bg-orange-500",
    pendente: "bg-gray-400",
    nao_iniciado: "bg-gray-300",
  };
  return <div className={`w-2 h-2 rounded-full shrink-0 ${colors[status] || "bg-gray-400"}`} />;
}
