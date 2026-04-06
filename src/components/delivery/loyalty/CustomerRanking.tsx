import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy } from "lucide-react";
import { useCustomerRanking } from "@/hooks/use-delivery-loyalty";

export function CustomerRanking() {
  const { data: ranking = [], isLoading } = useCustomerRanking();

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Ranking de Clientes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {ranking.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhum cliente com pontos ainda</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ganhos</TableHead>
                <TableHead className="text-right">Resgatados</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ranking.map((c, i) => (
                <TableRow key={c.id}>
                  <TableCell>
                    {i < 3 ? (
                      <Badge variant={i === 0 ? "default" : "secondary"}>
                        {i + 1}º
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">{i + 1}º</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell className="text-right text-green-600">+{c.earned}</TableCell>
                  <TableCell className="text-right text-red-600">-{c.redeemed}</TableCell>
                  <TableCell className="text-right font-bold">{c.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
