import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatBRL } from "@/lib/format";
import { ExternalLink, Copy } from "lucide-react";
import { toast } from "sonner";
import { FiscalCouponStatusBadge } from "./FiscalCouponStatusBadge";
import type { FiscalCoupon } from "@/hooks/use-fiscal-coupons";

interface Props {
  coupon: FiscalCoupon | null;
  open: boolean;
  onClose: () => void;
}

function formatDate(d?: string | null) {
  if (!d) return "-";
  try {
    return format(new Date(d), "dd/MM/yyyy HH:mm", { locale: ptBR });
  } catch {
    return d;
  }
}

export function FiscalCouponDetailDialog({ coupon, open, onClose }: Props) {
  if (!coupon) return null;

  const items = Array.isArray(coupon.items_snapshot) ? coupon.items_snapshot : [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Cupom Nº {coupon.numero ?? "—"} / Série {coupon.serie ?? "—"}
            <FiscalCouponStatusBadge status={coupon.status} />
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="resumo" className="mt-2">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="itens">Itens ({items.length})</TabsTrigger>
            <TabsTrigger value="pagamento">Pagamento</TabsTrigger>
            <TabsTrigger value="cliente">Cliente</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo" className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Ambiente" value={coupon.ambiente === "producao" ? "Produção" : "Homologação"} />
              <Field label="Data emissão" value={formatDate(coupon.data_emissao)} />
              <Field label="Data autorização" value={formatDate(coupon.data_autorizacao)} />
              <Field label="Protocolo" value={coupon.protocolo_autorizacao || "-"} />
              <Field label="Valor total" value={formatBRL(coupon.valor_total)} />
              <Field label="Desconto" value={formatBRL(coupon.valor_desconto)} />
              <Field label="Serviço (10%)" value={formatBRL(coupon.valor_servico)} />
              <Field label="Última consulta" value={formatDate(coupon.last_status_check_at)} />
            </div>

            {coupon.chave_acesso && (
              <div className="rounded border bg-muted/40 p-3">
                <div className="text-xs text-muted-foreground mb-1">Chave de acesso</div>
                <div className="flex items-center gap-2">
                  <code className="text-xs break-all">{coupon.chave_acesso}</code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      navigator.clipboard.writeText(coupon.chave_acesso!);
                      toast.success("Chave copiada");
                    }}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {coupon.rejection_reason && (
              <div className="rounded border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <div className="font-medium text-destructive mb-1">Motivo da rejeição</div>
                <div>{coupon.rejection_reason}</div>
              </div>
            )}

            {coupon.cancellation_reason && (
              <div className="rounded border bg-muted/40 p-3 text-sm">
                <div className="font-medium mb-1">Cancelado em {formatDate(coupon.cancelled_at)}</div>
                <div className="text-muted-foreground">{coupon.cancellation_reason}</div>
                {coupon.cancellation_protocol && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Protocolo: {coupon.cancellation_protocol}
                  </div>
                )}
              </div>
            )}

            {(coupon.danfe_pdf_url || coupon.xml_url) && (
              <div className="flex flex-wrap gap-2 pt-2">
                {coupon.danfe_pdf_url && (
                  <Button asChild size="sm" variant="outline">
                    <a href={coupon.danfe_pdf_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" /> DANFE PDF
                    </a>
                  </Button>
                )}
                {coupon.xml_url && (
                  <Button asChild size="sm" variant="outline">
                    <a href={coupon.xml_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" /> XML
                    </a>
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="itens">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Qtd</TableHead>
                  <TableHead className="text-right">Unitário</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead>NCM</TableHead>
                  <TableHead>CFOP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">Sem itens registrados</TableCell></TableRow>
                )}
                {items.map((it, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{it.product_name}</TableCell>
                    <TableCell className="text-right">{Number(it.quantity)}</TableCell>
                    <TableCell className="text-right">{formatBRL(it.unit_price)}</TableCell>
                    <TableCell className="text-right font-medium">{formatBRL(it.subtotal)}</TableCell>
                    <TableCell className="text-xs">{it.ncm || "-"}</TableCell>
                    <TableCell className="text-xs">{it.cfop || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="pagamento">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Forma de pagamento" value={coupon.forma_pagamento || "-"} />
              <Field label="Parcelas" value={String(coupon.parcelas ?? 1)} />
              <Field label="Desconto" value={formatBRL(coupon.valor_desconto)} />
              <Field label="Serviço" value={formatBRL(coupon.valor_servico)} />
              <Field label="Valor total" value={formatBRL(coupon.valor_total)} />
            </div>
          </TabsContent>

          <TabsContent value="cliente">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="CPF" value={coupon.customer_cpf || "Consumidor não identificado"} />
              <Field label="Nome" value={coupon.customer_name || "-"} />
              <Field label="Email" value={coupon.customer_email || "-"} />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
