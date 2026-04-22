import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldX,
  AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface CashMovement {
  id: string;
  type: string;
  amount: number;
  payment_method?: string | null;
  description: string | null;
  created_at: string;
  discount_reason?: string | null;
  discount_authorized_by?: string | null;
}

export interface PrintCashierReportParams {
  session: {
    opened_at?: string;
    closed_at?: string | null;
    opening_balance?: number;
    total_cash?: number;
    total_card?: number;
    total_pix?: number;
    total_withdrawals?: number;
    total_sales?: number;
  };
  movements: CashMovement[];
  closingBalance: number;
  notes: string;
  riskLevel: RiskLevel;
}

interface CloseCashierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (
    closingBalance: number, 
    notes?: string, 
    expectedBalance?: number, 
    riskLevel?: "ok" | "low" | "medium" | "high" | "critical"
  ) => void;
  isClosing: boolean;
  session: any;
  movements?: CashMovement[];
}

type RiskLevel = "ok" | "low" | "medium" | "high" | "critical";

const MIN_JUSTIFICATION_LENGTH = 30;

function getRiskLevel(difference: number): RiskLevel {
  const absDiff = Math.abs(difference);
  if (absDiff <= 5) return "ok";
  if (absDiff <= 50) return "low";
  if (absDiff <= 100) return "medium";
  if (absDiff <= 200) return "high";
  return "critical";
}

function getRiskConfig(riskLevel: RiskLevel) {
  const configs = {
    ok: {
      icon: ShieldCheck,
      label: "Saldo Confere",
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      description: "Não há divergência significativa.",
    },
    low: {
      icon: AlertCircle,
      label: "Divergência Baixa",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50 border-yellow-200",
      description: "Justificativa obrigatória para registrar a diferença.",
    },
    medium: {
      icon: AlertTriangle,
      label: "Divergência Média",
      color: "text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
      description: "Requer justificativa e confirmação adicional.",
    },
    high: {
      icon: ShieldAlert,
      label: "Divergência Alta",
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
      description: "Requer justificativa detalhada e confirmação.",
    },
    critical: {
      icon: ShieldX,
      label: "Divergência Crítica",
      color: "text-red-700",
      bgColor: "bg-red-100 border-red-300",
      description: "Fechamento bloqueado. Contate um supervisor.",
    },
  };
  return configs[riskLevel];
}

export function printCashierReport(params: PrintCashierReportParams) {
  const { session, movements, closingBalance: finalBalance, notes: finalNotes, riskLevel: finalRisk } = params;
  
  const openedAt = session?.opened_at 
    ? format(new Date(session.opened_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
    : "—";
  const closedAt = session?.closed_at
    ? format(new Date(session.closed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
    : format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR });
  const openingBal = session?.opening_balance || 0;
  const totalCash = session?.total_cash || 0;
  const totalCard = session?.total_card || 0;
  const totalPix = session?.total_pix || 0;
  const totalWithdrawals = session?.total_withdrawals || 0;
  const totalSales = session?.total_sales || 0;
  const expectedBalance = openingBal + totalCash - totalWithdrawals;
  const totalReinforcements = movements
    .filter((m) => m.type === "reforco")
    .reduce((acc, m) => acc + m.amount, 0);
  const diff = finalBalance - expectedBalance;
  
  const riskLabels: Record<RiskLevel, string> = {
    ok: "OK", low: "Baixo", medium: "Médio", high: "Alto", critical: "Crítico"
  };

  const movementRows = movements.map((m) => {
    const time = format(new Date(m.created_at), "HH:mm", { locale: ptBR });
    const typeLabel = m.type === "venda" ? "Venda" : m.type === "sangria" ? "Sangria" : m.type === "reforco" ? "Reforço" : m.type;
    const method = m.payment_method === "dinheiro" ? "Dinheiro" : m.payment_method === "cartao" ? "Cartão" : m.payment_method === "pix" ? "PIX" : "";
    return `<tr>
      <td style="padding:2px 6px;font-size:11px">${time}</td>
      <td style="padding:2px 6px;font-size:11px">${typeLabel}</td>
      <td style="padding:2px 6px;font-size:11px">${method}</td>
      <td style="padding:2px 6px;font-size:11px;text-align:right">R$ ${m.amount.toFixed(2)}</td>
      <td style="padding:2px 6px;font-size:11px">${m.description || ""}</td>
    </tr>`;
  }).join("");

  // Build discount section
  const discountMovements = movements.filter((m) => m.discount_reason);
  let discountSection = "";
  if (discountMovements.length > 0) {
    const discountRows = discountMovements.map((m) => {
      const time = format(new Date(m.created_at), "HH:mm", { locale: ptBR });
      return `<tr>
        <td style="padding:2px 6px;font-size:11px">${time}</td>
        <td style="padding:2px 6px;font-size:11px">${m.discount_reason || ""}</td>
        <td style="padding:2px 6px;font-size:11px">${m.discount_authorized_by || ""}</td>
        <td style="padding:2px 6px;font-size:11px;text-align:right">R$ ${m.amount.toFixed(2)}</td>
      </tr>`;
    }).join("");
    discountSection = `<div class="divider"></div>
<div class="section">
  <div class="section-title">DESCONTOS APLICADOS</div>
  <table><thead><tr><th>Hora</th><th>Motivo</th><th>Autorizado por</th><th style="text-align:right">Valor</th></tr></thead>
  <tbody>${discountRows}</tbody></table>
</div>`;
  }

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Demonstrativo de Caixa</title>
<style>
  @page { size: 80mm auto; margin: 4mm; }
  @media print { body { width: 72mm; } }
  body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; margin: 0; padding: 8px; }
  h1 { font-size: 14px; text-align: center; margin: 0 0 4px; border-top: 2px solid #000; border-bottom: 2px solid #000; padding: 6px 0; }
  .section { margin: 8px 0; }
  .section-title { font-weight: bold; font-size: 12px; border-bottom: 1px dashed #000; padding-bottom: 2px; margin-bottom: 4px; }
  .row { display: flex; justify-content: space-between; font-size: 11px; padding: 1px 0; }
  .row.total { font-weight: bold; font-size: 12px; border-top: 1px solid #000; padding-top: 4px; margin-top: 4px; }
  .divider { border-top: 1px dashed #000; margin: 6px 0; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 10px; border-bottom: 1px solid #000; padding: 2px 6px; }
  .footer { text-align: center; font-size: 10px; margin-top: 12px; border-top: 2px solid #000; padding-top: 6px; }
  .risk-badge { display: inline-block; padding: 2px 8px; font-weight: bold; font-size: 11px; border: 1px solid #000; margin-top: 4px; }
</style></head><body>
<h1>DEMONSTRATIVO DE CAIXA</h1>
<div class="section">
  <div class="row"><span>Abertura:</span><span>${openedAt}</span></div>
  <div class="row"><span>Fechamento:</span><span>${closedAt}</span></div>
</div>
<div class="divider"></div>
<div class="section">
  <div class="section-title">RESUMO FINANCEIRO</div>
  <div class="row"><span>Saldo Inicial:</span><span>R$ ${openingBal.toFixed(2)}</span></div>
  <div class="row"><span>Vendas Dinheiro:</span><span style="color:green">+ R$ ${totalCash.toFixed(2)}</span></div>
  <div class="row"><span>Vendas Cartão:</span><span>R$ ${totalCard.toFixed(2)}</span></div>
  <div class="row"><span>Vendas PIX:</span><span>R$ ${totalPix.toFixed(2)}</span></div>
  <div class="row"><span>Reforços:</span><span style="color:green">+ R$ ${totalReinforcements.toFixed(2)}</span></div>
  <div class="row"><span>Sangrias:</span><span style="color:red">- R$ ${totalWithdrawals.toFixed(2)}</span></div>
  <div class="divider"></div>
  <div class="row total"><span>Saldo Esperado:</span><span>R$ ${expectedBalance.toFixed(2)}</span></div>
  <div class="row total"><span>Saldo Informado:</span><span>R$ ${finalBalance.toFixed(2)}</span></div>
  <div class="row total"><span>Diferença:</span><span style="color:${diff >= 0 ? 'green' : 'red'}">${diff >= 0 ? '+' : ''}R$ ${diff.toFixed(2)}</span></div>
  <div class="divider"></div>
  <div class="row total"><span>Total de Vendas:</span><span>R$ ${totalSales.toFixed(2)}</span></div>
</div>
${movements.length > 0 ? `
<div class="divider"></div>
<div class="section">
  <div class="section-title">MOVIMENTAÇÕES</div>
  <table><thead><tr><th>Hora</th><th>Tipo</th><th>Forma</th><th style="text-align:right">Valor</th><th>Desc.</th></tr></thead>
  <tbody>${movementRows}</tbody></table>
</div>` : ''}
${discountSection}
${finalNotes ? `
<div class="divider"></div>
<div class="section">
  <div class="section-title">JUSTIFICATIVA</div>
  <p style="font-size:11px;margin:4px 0">${finalNotes}</p>
</div>` : ''}
<div class="section" style="text-align:center;margin-top:8px">
  <span class="risk-badge">Risco: ${riskLabels[finalRisk]}</span>
</div>
<div class="footer">Documento gerado automaticamente<br/>${closedAt}</div>
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  iframe.style.left = "-9999px";
  document.body.appendChild(iframe);
  
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => {
      iframe.contentWindow?.print();
      setTimeout(() => document.body.removeChild(iframe), 1000);
    }, 300);
  }
}


export function CloseCashierDialog({
  open,
  onOpenChange,
  onClose,
  isClosing,
  session,
  movements = [],
}: CloseCashierDialogProps) {
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  const expectedBalance =
    (session?.opening_balance || 0) +
    (session?.total_cash || 0) -
    (session?.total_withdrawals || 0);

  const difference = useMemo(() => {
    return (parseFloat(closingBalance) || 0) - expectedBalance;
  }, [closingBalance, expectedBalance]);

  const riskLevel = useMemo(() => {
    return getRiskLevel(difference);
  }, [difference]);

  const riskConfig = useMemo(() => {
    return getRiskConfig(riskLevel);
  }, [riskLevel]);

  const needsJustification = riskLevel !== "ok";
  const needsConfirmation = ["medium", "high"].includes(riskLevel);
  const isBlocked = riskLevel === "critical";

  const justificationLength = notes.trim().length;
  const isJustificationValid = !needsJustification || justificationLength >= MIN_JUSTIFICATION_LENGTH;
  const isConfirmationValid = !needsConfirmation || confirmed;

  const canClose = useMemo(() => {
    if (!closingBalance) return false;
    if (isBlocked) return false;
    if (!isJustificationValid) return false;
    if (!isConfirmationValid) return false;
    return true;
  }, [closingBalance, isBlocked, isJustificationValid, isConfirmationValid]);

  const internalPrint = (finalBalance: number, finalNotes: string, finalRisk: RiskLevel) => {
    printCashierReport({
      session,
      movements,
      closingBalance: finalBalance,
      notes: finalNotes,
      riskLevel: finalRisk,
    });
  };

  const handleClose = () => {
    const balance = parseFloat(closingBalance) || 0;
    const finalNotes = notes.trim() || undefined;
    internalPrint(balance, finalNotes || "", riskLevel);
    onClose(balance, finalNotes, expectedBalance, riskLevel);
    setClosingBalance("");
    setNotes("");
    setConfirmed(false);
  };

  const RiskIcon = riskConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] p-0 flex flex-col gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>Fechar Caixa</DialogTitle>
          <DialogDescription>
            Confira os valores e informe o saldo final em dinheiro
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          <Card>
            <CardContent className="pt-4 pb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Saldo Inicial:</span>
                <span className="font-medium">
                  R$ {(session?.opening_balance || 0).toFixed(2)}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendas em Dinheiro:</span>
                <span className="font-medium text-green-600">
                  + R$ {(session?.total_cash || 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendas em Cartão:</span>
                <span className="font-medium text-muted-foreground">
                  R$ {(session?.total_card || 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Vendas em PIX:</span>
                <span className="font-medium text-muted-foreground">
                  R$ {(session?.total_pix || 0).toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sangrias:</span>
                <span className="font-medium text-red-600">
                  - R$ {(session?.total_withdrawals || 0).toFixed(2)}
                </span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Saldo Esperado:</span>
                <span>R$ {expectedBalance.toFixed(2)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-semibold">
                <span>Total de Vendas:</span>
                <span className="text-green-600">
                  R$ {(session?.total_sales || 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="closing">Saldo Final em Dinheiro</Label>
            <CurrencyInput
              id="closing"
              value={closingBalance}
              onChange={setClosingBalance}
              autoFocus
            />
          </div>

          {/* Alerta de Divergência Antifraude */}
          {closingBalance && (
            <Card className={cn("border-2", riskConfig.bgColor)}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <RiskIcon className={cn("h-6 w-6 mt-0.5", riskConfig.color)} />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={cn("font-semibold", riskConfig.color)}>
                        {riskConfig.label}
                      </span>
                      <span className={cn("font-mono font-bold", riskConfig.color)}>
                        {difference >= 0 ? "+" : ""}R$ {difference.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {riskConfig.description}
                    </p>
                    {riskLevel !== "ok" && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {difference > 0 ? "Sobra" : "Falta"} de R$ {Math.abs(difference).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campo de Justificativa */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="notes">
                {needsJustification ? "Justificativa*" : "Observações (opcional)"}
              </Label>
              {needsJustification && (
                <span className={cn(
                  "text-xs",
                  justificationLength >= MIN_JUSTIFICATION_LENGTH 
                    ? "text-green-600" 
                    : "text-muted-foreground"
                )}>
                  {justificationLength}/{MIN_JUSTIFICATION_LENGTH} caracteres
                </span>
              )}
            </div>
            <Textarea
              id="notes"
              placeholder={
                needsJustification 
                  ? "Explique detalhadamente o motivo da divergência (mínimo 30 caracteres)..."
                  : "Adicione observações sobre o fechamento do caixa..."
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={cn(
                needsJustification && justificationLength < MIN_JUSTIFICATION_LENGTH && justificationLength > 0 
                  && "border-yellow-500 focus-visible:ring-yellow-500"
              )}
            />
            {needsJustification && justificationLength > 0 && justificationLength < MIN_JUSTIFICATION_LENGTH && (
              <p className="text-xs text-yellow-600">
                Faltam {MIN_JUSTIFICATION_LENGTH - justificationLength} caracteres para a justificativa.
              </p>
            )}
          </div>

          {/* Checkbox de Confirmação */}
          {needsConfirmation && !isBlocked && (
            <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border">
              <Checkbox 
                id="confirm" 
                checked={confirmed}
                onCheckedChange={(checked) => setConfirmed(checked === true)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="confirm"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Confirmo que revisei os valores
                </label>
                <p className="text-xs text-muted-foreground">
                  Declaro que verifiquei a contagem do caixa e que a justificativa apresentada é verdadeira.
                </p>
              </div>
            </div>
          )}

          {/* Aviso de Bloqueio */}
          {isBlocked && (
            <Card className="border-2 border-red-500 bg-red-50">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-3">
                  <ShieldX className="h-6 w-6 text-red-700 mt-0.5" />
                  <div className="space-y-2">
                    <p className="font-semibold text-red-700">
                      Fechamento Bloqueado
                    </p>
                    <p className="text-sm text-red-600">
                      A divergência detectada (R$ {Math.abs(difference).toFixed(2)}) excede o limite permitido para fechamento automático.
                    </p>
                    <p className="text-sm text-red-600">
                      Por favor, recontagem o caixa ou contate um supervisor para autorização especial.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isClosing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleClose}
            disabled={isClosing || !canClose}
            variant={isBlocked ? "destructive" : "default"}
          >
            {isClosing ? "Fechando..." : isBlocked ? "Bloqueado" : "Fechar Caixa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
