import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield } from "lucide-react";
import { useAccessLogs } from "@/hooks/use-checklist-access-logs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const actionLabels: Record<string, string> = {
  login: "Login por PIN",
  checklist_start: "Iniciou checklist",
  checklist_complete: "Concluiu checklist",
  item_save: "Salvou item",
  logout: "Logout",
};

export function AccessLogsPanel() {
  const [dateFilter, setDateFilter] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("all");
  const { user } = useAuth();
  const { data: logs, isLoading } = useAccessLogs({
    date: dateFilter || undefined,
    operatorId: operatorFilter !== "all" ? operatorFilter : undefined,
  });

  const { data: operators } = useQuery({
    queryKey: ["operators-list", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data } = await supabase.from("checklist_operators").select("id, name").eq("user_id", user.id).eq("is_active", true);
      return data || [];
    },
    enabled: !!user?.id,
  });

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold flex items-center gap-2"><Shield className="h-5 w-5" />Log de Acessos</h2>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40" />
        <Select value={operatorFilter} onValueChange={setOperatorFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Operador" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {(operators || []).map((op: any) => <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Operador</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(logs || []).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm whitespace-nowrap">{formatDate(log.createdAt)}</TableCell>
                    <TableCell className="text-sm font-medium">{log.operatorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{actionLabels[log.action] || log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {log.details && typeof log.details === "object" ? JSON.stringify(log.details) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
                {!logs?.length && (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-8">Nenhum registro encontrado.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
