import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Trash2, AlertTriangle, PackageX } from "lucide-react";
import { useExpiryItems, useExpiryHistory, useCreateExpiry, useUpdateExpiryStatus, useDeleteExpiry } from "@/hooks/use-product-expiry";
import { toast } from "@/hooks/use-toast";

export function ExpiryTrackingPanel() {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ product_name: "", batch_id: "", expiry_date: "", notes: "" });
  const { data: items, isLoading } = useExpiryItems();
  const { data: history } = useExpiryHistory();
  const createMutation = useCreateExpiry();
  const updateStatus = useUpdateExpiryStatus();
  const deleteMutation = useDeleteExpiry();

  const handleAdd = async () => {
    if (!form.product_name || !form.expiry_date) return;
    try {
      await createMutation.mutateAsync(form);
      toast({ title: "Produto registrado ✅" });
      setShowAdd(false);
      setForm({ product_name: "", batch_id: "", expiry_date: "", notes: "" });
    } catch {
      toast({ title: "Erro ao registrar", variant: "destructive" });
    }
  };

  const handleDiscard = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: "descartado" });
      toast({ title: "Marcado como descartado" });
    } catch {
      toast({ title: "Erro", variant: "destructive" });
    }
  };

  const statusConfig: Record<string, { label: string; variant: "destructive" | "secondary" | "default" | "outline"; icon?: any }> = {
    vencido: { label: "Vencido", variant: "destructive" },
    proximo_vencimento: { label: "Próximo do vencimento", variant: "secondary" },
    valido: { label: "Válido", variant: "default" },
    descartado: { label: "Descartado", variant: "outline" },
  };

  const alertItems = (items || []).filter((i) => i.status === "vencido" || i.status === "proximo_vencimento");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Controle de Validade</h2>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4 mr-1" />Registrar Produto</Button>
      </div>

      {alertItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alertItems.map((item) => (
            <Card key={item.id} className={item.status === "vencido" ? "border-destructive" : "border-yellow-500"}>
              <CardContent className="py-3 flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 shrink-0 ${item.status === "vencido" ? "text-destructive" : "text-yellow-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{item.product_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.batch_id && `Lote: ${item.batch_id} • `}
                    Vence: {item.expiry_date} ({item.daysLeft < 0 ? `${Math.abs(item.daysLeft)}d atrás` : `${item.daysLeft}d restantes`})
                  </p>
                </div>
                <Badge variant={statusConfig[item.status]?.variant || "outline"}>{statusConfig[item.status]?.label}</Badge>
                <Button size="sm" variant="outline" onClick={() => handleDiscard(item.id)}>
                  <PackageX className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Produtos Ativos</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(items || []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-sm">{item.product_name}</TableCell>
                    <TableCell className="text-sm">{item.batch_id || "—"}</TableCell>
                    <TableCell className="text-sm">{item.expiry_date}</TableCell>
                    <TableCell><Badge variant={statusConfig[item.status]?.variant || "outline"} className="text-[10px]">{statusConfig[item.status]?.label}</Badge></TableCell>
                    <TableCell className="text-sm">{item.daysLeft}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleDiscard(item.id)}><PackageX className="h-3.5 w-3.5" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteMutation.mutate(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!items?.length && <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground text-sm py-8">Nenhum produto registrado.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {(history || []).length > 0 && (
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm">Histórico de Descartes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(history || []).map((h: any) => (
                  <TableRow key={h.id}>
                    <TableCell className="text-sm">{h.product_name}</TableCell>
                    <TableCell className="text-sm">{h.batch_id || "—"}</TableCell>
                    <TableCell className="text-sm">{h.expiry_date}</TableCell>
                    <TableCell className="text-sm">{h.notes || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Registrar Produto</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Nome do produto" value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
            <Input placeholder="Lote (opcional)" value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })} />
            <Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
            <Textarea placeholder="Notas (opcional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          <DialogFooter>
            <Button onClick={handleAdd} disabled={createMutation.isPending || !form.product_name || !form.expiry_date}>
              {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
