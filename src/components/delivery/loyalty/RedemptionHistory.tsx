import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, History } from "lucide-react";
import { useRedemptionHistory } from "@/hooks/use-delivery-loyalty";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function RedemptionHistory() {
  const { data: history = [], isLoading } = useRedemptionHistory();

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          Histórico de Resgates
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhum resgate realizado</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Pontos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((h) => (
                <TableRow key={h.id}>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(h.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="font-medium">
                    {(h as any).delivery_customers?.name || "—"}
                  </TableCell>
                  <TableCell>{h.description || "—"}</TableCell>
                  <TableCell className="text-right text-red-600 font-medium">{h.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
