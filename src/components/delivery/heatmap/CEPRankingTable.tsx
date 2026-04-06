import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import type { CEPData } from "@/hooks/use-delivery-heatmap";

interface CEPRankingTableProps {
  data: CEPData[];
}

function formatCEP(cep: string) {
  const clean = cep.replace(/\D/g, "");
  return clean.length === 8 ? `${clean.slice(0, 5)}-${clean.slice(5)}` : clean;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function CEPRankingTable({ data }: CEPRankingTableProps) {
  const maxOrders = data.length > 0 ? data[0].orderCount : 1;

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum dado de CEP encontrado no período selecionado.
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8">#</TableHead>
            <TableHead>CEP</TableHead>
            <TableHead>Bairro</TableHead>
            <TableHead>Cidade</TableHead>
            <TableHead className="text-right">Pedidos</TableHead>
            <TableHead className="w-[120px]">Concentração</TableHead>
            <TableHead className="text-right">Receita</TableHead>
            <TableHead className="text-right">Ticket Médio</TableHead>
            <TableHead className="text-right">% Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={item.zipCode}>
              <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
              <TableCell className="font-mono text-sm">{formatCEP(item.zipCode)}</TableCell>
              <TableCell>{item.neighborhood || "—"}</TableCell>
              <TableCell>{item.city ? `${item.city}/${item.state}` : "—"}</TableCell>
              <TableCell className="text-right font-medium">{item.orderCount}</TableCell>
              <TableCell>
                <Progress value={(item.orderCount / maxOrders) * 100} className="h-2" />
              </TableCell>
              <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.averageTicket)}</TableCell>
              <TableCell className="text-right">{item.percentOfTotal.toFixed(1)}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
