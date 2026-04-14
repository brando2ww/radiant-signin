import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Loader2 } from "lucide-react";
import { useExpiryHistory } from "@/hooks/use-product-expiry";
import type { ExpiryItem } from "@/hooks/use-product-expiry";

export function ExpiryLossHistory() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data: history, isLoading } = useExpiryHistory(from && to ? { from, to } : undefined);

  const items = history || [];
  const totalValue = items.reduce((s, i) => {
    const qty = (i as any).discarded_quantity || (i as any).quantity || 1;
    const cost = (i as any).unit_cost || 0;
    return s + qty * cost;
  }, 0);

  const exportCsv = () => {
    const header = "Produto,Lote,Validade,Data Descarte,Motivo,Valor Perda\n";
    const rows = items.map((i) => {
      const qty = (i as any).discarded_quantity || (i as any).quantity || 1;
      const cost = (i as any).unit_cost || 0;
      return `"${i.product_name}","${i.batch_id || ""}","${i.expiry_date}","${(i as any).discarded_at || ""}","${(i as any).discard_reason || ""}","${(qty * cost).toFixed(2)}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historico_perdas.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Histórico de Perdas</CardTitle>
          <div className="flex items-center gap-2">
            <Input type="date" className="h-8 w-[130px]" value={from} onChange={(e) => setFrom(e.target.value)} />
            <span className="text-xs text-muted-foreground">até</span>
            <Input type="date" className="h-8 w-[130px]" value={to} onChange={(e) => setTo(e.target.value)} />
            <Button size="sm" variant="outline" className="h-8" onClick={exportCsv} disabled={!items.length}>
              <Download className="h-3.5 w-3.5 mr-1" />CSV
            </Button>
          </div>
        </div>
        {items.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {items.length} itens descartados · Perda total: <span className="font-semibold text-destructive">R$ {totalValue.toFixed(2)}</span>
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Lote</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Data descarte</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Valor perda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((i) => {
                const qty = (i as any).discarded_quantity || (i as any).quantity || 1;
                const cost = (i as any).unit_cost || 0;
                return (
                  <TableRow key={i.id}>
                    <TableCell className="text-sm font-medium">{i.product_name}</TableCell>
                    <TableCell className="text-sm">{i.batch_id || "—"}</TableCell>
                    <TableCell className="text-sm">{i.expiry_date}</TableCell>
                    <TableCell className="text-sm">{(i as any).discarded_at ? new Date((i as any).discarded_at).toLocaleDateString("pt-BR") : "—"}</TableCell>
                    <TableCell className="text-sm capitalize">{(i as any).discard_reason || "—"}</TableCell>
                    <TableCell className="text-sm">R$ {(qty * cost).toFixed(2)}</TableCell>
                  </TableRow>
                );
              })}
              {!items.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">
                    Nenhum descarte registrado no período.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
