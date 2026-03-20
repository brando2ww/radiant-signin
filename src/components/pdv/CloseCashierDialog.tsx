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

interface CashMovement {
  id: string;
  type: string;
  amount: number;
  payment_method?: string | null;
  description: string | null;
  created_at: string;
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

  const handleClose = () => {
    const balance = parseFloat(closingBalance) || 0;
    onClose(balance, notes.trim() || undefined, expectedBalance, riskLevel);
    setClosingBalance("");
    setNotes("");
    setConfirmed(false);
  };

  const RiskIcon = riskConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fechar Caixa</DialogTitle>
          <DialogDescription>
            Confira os valores e informe o saldo final em dinheiro
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Card>
            <CardContent className="pt-6 space-y-3">
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
