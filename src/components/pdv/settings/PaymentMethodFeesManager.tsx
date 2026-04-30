import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Pencil, Trash2, Sparkles, Percent } from "lucide-react";
import {
  PaymentMethodFee,
  usePaymentMethodFees,
  useUpsertPaymentMethodFee,
  useTogglePaymentMethodFee,
  useDeletePaymentMethodFee,
  useSeedPaymentMethodFees,
} from "@/hooks/use-payment-method-fees";
import { calculateNetAmount } from "@/lib/financial/payment-fees";
import { formatBRL } from "@/lib/format";

interface FormState {
  id?: string;
  method_key: string;
  label: string;
  fee_percentage: string;
  fee_fixed: string;
  is_active: boolean;
  notes: string;
}

const EMPTY: FormState = {
  method_key: "",
  label: "",
  fee_percentage: "0",
  fee_fixed: "0",
  is_active: true,
  notes: "",
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 40);

export function PaymentMethodFeesManager() {
  const { data: fees = [], isLoading } = usePaymentMethodFees();
  const upsert = useUpsertPaymentMethodFee();
  const toggle = useTogglePaymentMethodFee();
  const remove = useDeletePaymentMethodFee();
  const seed = useSeedPaymentMethodFees();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [confirmDelete, setConfirmDelete] = useState<PaymentMethodFee | null>(null);

  const isEdit = !!form.id;

  const preview = useMemo(() => {
    return calculateNetAmount(100, {
      fee_percentage: parseFloat(form.fee_percentage) || 0,
      fee_fixed: parseFloat(form.fee_fixed) || 0,
    });
  }, [form.fee_percentage, form.fee_fixed]);

  const openNew = () => {
    setForm(EMPTY);
    setOpen(true);
  };

  const openEdit = (fee: PaymentMethodFee) => {
    setForm({
      id: fee.id,
      method_key: fee.method_key,
      label: fee.label,
      fee_percentage: String(fee.fee_percentage),
      fee_fixed: String(fee.fee_fixed),
      is_active: fee.is_active,
      notes: fee.notes ?? "",
    });
    setOpen(true);
  };

  const submit = async () => {
    const label = form.label.trim();
    if (!label) return;
    const method_key = (form.method_key || slugify(label)).trim();
    if (!method_key) return;

    await upsert.mutateAsync({
      method_key,
      label,
      fee_percentage: parseFloat(form.fee_percentage) || 0,
      fee_fixed: parseFloat(form.fee_fixed) || 0,
      is_active: form.is_active,
      notes: form.notes || null,
    } as any);
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Percent className="h-5 w-5" />
              Taxas por Forma de Pagamento
            </CardTitle>
            <CardDescription>
              Configure a taxa percentual e fixa de cada método. As taxas são aplicadas
              automaticamente no caixa, financeiro, relatórios e DRE. Vendas antigas não
              são recalculadas.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {fees.length === 0 && !isLoading && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => seed.mutate()}
                disabled={seed.isPending}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Criar padrões
              </Button>
            )}
            <Button type="button" size="sm" onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : fees.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma forma de pagamento cadastrada. Use "Criar padrões" para começar com
            Crédito, Débito, PIX, Dinheiro e iFood.
          </p>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Forma</TableHead>
                  <TableHead className="text-right">% Taxa</TableHead>
                  <TableHead className="text-right">Taxa Fixa</TableHead>
                  <TableHead className="text-right">Líquido em R$ 100</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => {
                  const p = calculateNetAmount(100, fee);
                  return (
                    <TableRow key={fee.id}>
                      <TableCell>
                        <div className="font-medium">{fee.label}</div>
                        {fee.notes && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {fee.notes}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fee.fee_percentage.toString().replace(".", ",")}%
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatBRL(fee.fee_fixed)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatBRL(p.net)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={fee.is_active}
                          onCheckedChange={(v) =>
                            toggle.mutate({ id: fee.id, is_active: v })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(fee)}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setConfirmDelete(fee)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEdit ? "Editar taxa" : "Nova forma de pagamento"}</DialogTitle>
            <DialogDescription>
              Defina o percentual e a taxa fixa cobrados por transação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Ex: Crédito, iFood, Vale-refeição"
              />
            </div>

            <div className="space-y-2">
              <Label>Chave do método</Label>
              <Input
                value={form.method_key}
                onChange={(e) =>
                  setForm({ ...form, method_key: slugify(e.target.value) })
                }
                placeholder={slugify(form.label) || "auto"}
                disabled={isEdit}
              />
              <p className="text-xs text-muted-foreground">
                Identificador único usado nas transações. Ex: credit, pix, ifood.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Taxa %</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.fee_percentage}
                  onChange={(e) => setForm({ ...form, fee_percentage: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Taxa fixa</Label>
                <CurrencyInput
                  value={form.fee_fixed}
                  onChange={(v) => setForm({ ...form, fee_fixed: v || "0" })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <Label>Ativo</Label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => setForm({ ...form, is_active: v })}
              />
            </div>

            <div className="rounded-md bg-muted p-3 text-sm">
              <div className="font-medium">Prévia de R$ 100,00</div>
              <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-muted-foreground">
                <span>Taxa percentual:</span>
                <span className="text-right tabular-nums">
                  {formatBRL(preview.fee_percentage_amount)}
                </span>
                <span>Taxa fixa:</span>
                <span className="text-right tabular-nums">
                  {formatBRL(preview.fee_fixed_amount)}
                </span>
                <span className="font-medium text-foreground">Líquido:</span>
                <span className="text-right font-medium tabular-nums text-foreground">
                  {formatBRL(preview.net)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={upsert.isPending || !form.label.trim()}>
              {upsert.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover {confirmDelete?.label}?</AlertDialogTitle>
            <AlertDialogDescription>
              As vendas já registradas continuam preservadas. Apenas novas vendas deixarão
              de aplicar esta taxa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmDelete) remove.mutate(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
