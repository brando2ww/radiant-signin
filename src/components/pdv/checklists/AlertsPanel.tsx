import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Bell, Check } from "lucide-react";
import { format } from "date-fns";

interface Alert {
  id: string;
  alert_type: string;
  message: string;
  is_acknowledged: boolean;
  created_at: string;
  checklist_executions?: { checklists?: { name?: string } } | null;
  checklist_items?: { title?: string } | null;
}

interface AlertsPanelProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
}

const alertTypeLabels: Record<string, string> = {
  prazo_expirado: "Prazo expirado",
  temperatura_fora: "Temperatura",
  item_critico: "Item crítico",
};

export function AlertsPanel({ alerts, onAcknowledge }: AlertsPanelProps) {
  const unacked = alerts.filter((a) => !a.is_acknowledged);
  const acked = alerts.filter((a) => a.is_acknowledged);

  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Alertas
          {unacked.length > 0 && <Badge variant="destructive">{unacked.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {unacked.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-md border border-destructive/30 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{alertTypeLabels[alert.alert_type] || alert.alert_type}</Badge>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(alert.created_at), "dd/MM HH:mm")}
                </span>
              </div>
              <p className="text-sm">{alert.message}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onAcknowledge(alert.id)}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {acked.length > 0 && (
          <details className="mt-2">
            <summary className="text-xs text-muted-foreground cursor-pointer">
              Alertas reconhecidos ({acked.length})
            </summary>
            <div className="space-y-1 mt-2">
              {acked.slice(0, 10).map((alert) => (
                <div key={alert.id} className="flex items-center gap-2 text-xs text-muted-foreground p-2 border rounded-md opacity-60">
                  <Check className="h-3 w-3" />
                  <span className="truncate">{alert.message}</span>
                  <span className="shrink-0">{format(new Date(alert.created_at), "dd/MM HH:mm")}</span>
                </div>
              ))}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}
