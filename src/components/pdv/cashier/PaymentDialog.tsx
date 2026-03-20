import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  CheckCircle,
  Loader2,
  Percent,
  DollarSign,
  Plus,
  X,
  Sparkles,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Comanda, ComandaItem } from "@/hooks/use-pdv-comandas";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { usePDVPayments, PaymentMethod } from "@/hooks/use-pdv-payments";
import { CurrencyInput } from "@/components/ui/currency-input";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comanda?: Comanda | null;
  items?: ComandaItem[];
  table?: PDVTable | null;
  tableComandas?: Comanda[];
  tableItems?: ComandaItem[];
  onSuccess?: () => void;
}

type CardType = "credito" | "debito";
type DiscountType = "percent" | "value";

interface SplitPayment {
  id: string;
  method: PaymentMethod;
  cardType?: CardType;
  amount: string;
  installments: string;
}

const paymentMethods = [
  { id: "dinheiro" as PaymentMethod, label: "Dinheiro", icon: Banknote, color: "text-green-600" },
  { id: "cartao" as PaymentMethod, label: "Cartão", icon: CreditCard, color: "text-blue-600" },
  { id: "pix" as PaymentMethod, label: "PIX", icon: QrCode, color: "text-purple-600" },
];

const quickValues = [50, 100, 150, 200];

export function PaymentDialog({
  open,
  onOpenChange,
  comanda,
  items = [],
  table,
  tableComandas = [],
  tableItems = [],
  onSuccess,
}: PaymentDialogProps) {
  // Payment state
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("dinheiro");
  const [cardType, setCardType] = useState<CardType>("credito");
  const [cashReceived, setCashReceived] = useState("");
  const [installments, setInstallments] = useState("1");
  
  // Discount & fees
  const [discountType, setDiscountType] = useState<DiscountType>("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [discountPassword, setDiscountPassword] = useState("");
  const [discountAuthorized, setDiscountAuthorized] = useState(false);
  const [serviceFeeEnabled, setServiceFeeEnabled] = useState(false);
  
  // Split payment
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ change: number } | null>(null);
  
  const { registerPayment, isRegisteringPayment, registerTablePayment, isRegisteringTablePayment } = usePDVPayments();

  // Determine payment context
  const isTablePayment = !!table;
  const displayItems = isTablePayment ? tableItems : items;
  const subtotal = isTablePayment
    ? tableComandas.reduce((sum, c) => sum + c.subtotal, 0)
    : comanda?.subtotal || 0;

  const title = isTablePayment
    ? `Mesa ${table?.table_number}`
    : `Comanda #${comanda?.comanda_number}`;

  // Calculate discount
  const discountAmount = discountType === "percent"
    ? (subtotal * (parseFloat(discountValue) || 0)) / 100
    : parseFloat(discountValue) || 0;

  // Calculate service fee (10%)
  const serviceFeeAmount = serviceFeeEnabled ? (subtotal - discountAmount) * 0.1 : 0;

  // Final total
  const total = Math.max(0, subtotal - discountAmount + serviceFeeAmount);

  // Cash calculations
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const changeAmount = selectedMethod === "dinheiro" ? Math.max(0, cashReceivedNum - total) : 0;
  
  // Split payment total
  const splitTotal = splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
  const splitRemaining = total - splitTotal;

  // Discount requires password authorization
  const hasDiscount = discountAmount > 0;
  const discountNeedsAuth = hasDiscount && !discountAuthorized;

  // Validation
  const canSubmit = !discountNeedsAuth && (splitEnabled
    ? Math.abs(splitRemaining) < 0.01 && splitPayments.length > 0
    : selectedMethod !== "dinheiro" || cashReceivedNum >= total);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedMethod("dinheiro");
      setCardType("credito");
      setCashReceived("");
      setInstallments("1");
      setDiscountType("percent");
      setDiscountValue("");
      setDiscountPassword("");
      setDiscountAuthorized(false);
      setServiceFeeEnabled(false);
      setSplitEnabled(false);
      setSplitPayments([]);
      setShowSuccess(false);
      setSuccessData(null);
    }
  }, [open]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const handleQuickValue = (value: number) => {
    setCashReceived(value.toString());
  };

  const handleExactValue = () => {
    setCashReceived(total.toString());
  };

  const addSplitPayment = () => {
    setSplitPayments([
      ...splitPayments,
      {
        id: crypto.randomUUID(),
        method: "dinheiro",
        amount: "",
        installments: "1",
      },
    ]);
  };

  const removeSplitPayment = (id: string) => {
    setSplitPayments(splitPayments.filter((p) => p.id !== id));
  };

  const updateSplitPayment = (id: string, updates: Partial<SplitPayment>) => {
    setSplitPayments(
      splitPayments.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const handleSubmit = async () => {
    try {
      const finalAmount = total;
      const paymentData = {
        amount: finalAmount,
        paymentMethod: selectedMethod,
        cashReceived: selectedMethod === "dinheiro" ? cashReceivedNum : undefined,
        changeAmount: selectedMethod === "dinheiro" ? changeAmount : undefined,
        installments: selectedMethod === "cartao" ? parseInt(installments) : undefined,
      };

      if (isTablePayment && table) {
        await registerTablePayment({
          tableId: table.id,
          comandaIds: tableComandas.map((c) => c.id),
          ...paymentData,
        });
      } else if (comanda) {
        await registerPayment({
          comandaId: comanda.id,
          orderId: comanda.order_id,
          ...paymentData,
        });
      }

      // Show success animation
      setSuccessData({ change: changeAmount });
      setShowSuccess(true);
      
      // Auto close after animation
      setTimeout(() => {
        onOpenChange(false);
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
    }
  };

  const isProcessing = isRegisteringPayment || isRegisteringTablePayment;

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 space-y-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-green-600" />
            </motion.div>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center space-y-2"
            >
              <h3 className="text-xl font-bold text-green-600">
                Pagamento Confirmado!
              </h3>
              <p className="text-muted-foreground">
                {formatCurrency(total)}
              </p>
              {successData && successData.change > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Troco: </span>
                  <span className="font-bold text-lg">{formatCurrency(successData.change)}</span>
                </div>
              )}
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Pagamento - {title}
          </DialogTitle>
          <DialogDescription>
            Revise o pedido e selecione a forma de pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 overflow-y-auto max-h-[60vh] pr-2">
          {/* Left Column - Order Summary */}
          <div className="space-y-4">
            {/* Items List */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Resumo do Pedido
                </h4>
                <ScrollArea className="h-[140px]">
                  <div className="space-y-2">
                    {displayItems.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}x {item.product_name}
                        </span>
                        <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Discount & Service Fee */}
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Discount */}
                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Desconto
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex border rounded-lg overflow-hidden">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "rounded-none px-3",
                          discountType === "percent" && "bg-primary/10 text-primary"
                        )}
                        onClick={() => setDiscountType("percent")}
                      >
                        <Percent className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "rounded-none px-3",
                          discountType === "value" && "bg-primary/10 text-primary"
                        )}
                        onClick={() => setDiscountType("value")}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    </div>
                    <Input
                      type="number"
                      placeholder={discountType === "percent" ? "0%" : "0,00"}
                      value={discountValue}
                      onChange={(e) => {
                        setDiscountValue(e.target.value);
                        setDiscountAuthorized(false);
                        setDiscountPassword("");
                      }}
                      className="flex-1"
                    />
                  </div>

                  {/* Password for discount authorization */}
                  {hasDiscount && (
                    <div className="space-y-2">
                      <Label className="text-sm flex items-center gap-2">
                        <Lock className="h-4 w-4 text-amber-500" />
                        Senha para desconto
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          type="password"
                          placeholder="Digite a senha"
                          value={discountPassword}
                          onChange={(e) => setDiscountPassword(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant={discountAuthorized ? "default" : "outline"}
                          size="sm"
                          className="shrink-0"
                          disabled={discountAuthorized}
                          onClick={() => {
                            if (discountPassword === "1234") {
                              setDiscountAuthorized(true);
                              toast.success("Desconto autorizado");
                            } else {
                              toast.error("Senha incorreta");
                              setDiscountPassword("");
                            }
                          }}
                        >
                          {discountAuthorized ? "Autorizado ✓" : "Autorizar"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Service Fee Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="service-fee" className="text-sm cursor-pointer">
                    Taxa de serviço (10%)
                  </Label>
                  <Switch
                    id="service-fee"
                    checked={serviceFeeEnabled}
                    onCheckedChange={setServiceFeeEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Totals */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Desconto</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                {serviceFeeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Taxa de serviço</span>
                    <span>{formatCurrency(serviceFeeAmount)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">TOTAL</span>
                  <span className="font-bold text-2xl text-primary">
                    {formatCurrency(total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-4">
            {/* Split Payment Toggle */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <Label htmlFor="split-payment" className="text-sm cursor-pointer flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Dividir pagamento
              </Label>
              <Switch
                id="split-payment"
                checked={splitEnabled}
                onCheckedChange={(checked) => {
                  setSplitEnabled(checked);
                  if (checked && splitPayments.length === 0) {
                    addSplitPayment();
                  }
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              {splitEnabled ? (
                <motion.div
                  key="split"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-3"
                >
                  {/* Split Payments List */}
                  {splitPayments.map((payment, index) => (
                    <Card key={payment.id}>
                      <CardContent className="p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">Forma {index + 1}</Badge>
                          {splitPayments.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeSplitPayment(payment.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Select
                          value={payment.method}
                          onValueChange={(v) =>
                            updateSplitPayment(payment.id, { method: v as PaymentMethod })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((m) => (
                              <SelectItem key={m.id} value={m.id}>
                                <div className="flex items-center gap-2">
                                  <m.icon className={cn("h-4 w-4", m.color)} />
                                  {m.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <CurrencyInput
                          value={payment.amount}
                          onChange={(v) => updateSplitPayment(payment.id, { amount: v })}
                          placeholder="Valor"
                        />
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={addSplitPayment}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar forma
                  </Button>

                  {/* Split Summary */}
                  <div className="p-3 bg-muted rounded-lg space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Pago:</span>
                      <span className="font-medium">{formatCurrency(splitTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Restante:</span>
                      <span
                        className={cn(
                          "font-medium",
                          Math.abs(splitRemaining) < 0.01
                            ? "text-green-600"
                            : "text-destructive"
                        )}
                      >
                        {formatCurrency(splitRemaining)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="single"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-4"
                >
                  {/* Payment Methods */}
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => (
                      <Button
                        key={method.id}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-20 flex-col gap-2 relative overflow-hidden",
                          selectedMethod === method.id &&
                            "border-primary bg-primary/10 ring-2 ring-primary/20"
                        )}
                        onClick={() => setSelectedMethod(method.id)}
                      >
                        <method.icon
                          className={cn(
                            "h-6 w-6 transition-colors",
                            selectedMethod === method.id
                              ? method.color
                              : "text-muted-foreground"
                          )}
                        />
                        <span className="text-xs font-medium">{method.label}</span>
                        {selectedMethod === method.id && (
                          <motion.div
                            layoutId="payment-indicator"
                            className="absolute bottom-0 left-0 right-0 h-1 bg-primary"
                          />
                        )}
                      </Button>
                    ))}
                  </div>

                  {/* Cash Fields */}
                  {selectedMethod === "dinheiro" && (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Valor Recebido</Label>
                        <CurrencyInput
                          value={cashReceived}
                          onChange={setCashReceived}
                          placeholder="0,00"
                          className="text-lg h-12"
                        />
                      </div>

                      {/* Quick Value Buttons */}
                      <div className="grid grid-cols-5 gap-2">
                        {quickValues.map((value) => (
                          <Button
                            key={value}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuickValue(value)}
                            className="text-xs"
                          >
                            R$ {value}
                          </Button>
                        ))}
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={handleExactValue}
                          className="text-xs"
                        >
                          Exato
                        </Button>
                      </div>

                      {/* Change Display */}
                      {cashReceivedNum > 0 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={cn(
                            "p-4 rounded-lg text-center",
                            cashReceivedNum >= total
                              ? "bg-green-100 dark:bg-green-900/30"
                              : "bg-destructive/10"
                          )}
                        >
                          <span className="text-sm text-muted-foreground block mb-1">
                            Troco
                          </span>
                          <span
                            className={cn(
                              "text-2xl font-bold",
                              cashReceivedNum >= total
                                ? "text-green-600"
                                : "text-destructive"
                            )}
                          >
                            {formatCurrency(changeAmount)}
                          </span>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Card Fields */}
                  {selectedMethod === "cartao" && (
                    <div className="space-y-4">
                      {/* Card Type Selection */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-14",
                            cardType === "credito" &&
                              "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          )}
                          onClick={() => setCardType("credito")}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <CreditCard
                              className={cn(
                                "h-5 w-5",
                                cardType === "credito"
                                  ? "text-blue-600"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span className="text-xs">Crédito</span>
                          </div>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-14",
                            cardType === "debito" &&
                              "border-green-500 bg-green-50 dark:bg-green-900/20"
                          )}
                          onClick={() => setCardType("debito")}
                        >
                          <div className="flex flex-col items-center gap-1">
                            <CreditCard
                              className={cn(
                                "h-5 w-5",
                                cardType === "debito"
                                  ? "text-green-600"
                                  : "text-muted-foreground"
                              )}
                            />
                            <span className="text-xs">Débito</span>
                          </div>
                        </Button>
                      </div>

                      {/* Installments (Credit only) */}
                      {cardType === "credito" && (
                        <div className="space-y-2">
                          <Label>Parcelas</Label>
                          <Select value={installments} onValueChange={setInstallments}>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                                <SelectItem key={i} value={String(i)}>
                                  <span className="font-medium">{i}x</span>{" "}
                                  <span className="text-muted-foreground">
                                    de {formatCurrency(total / i)}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PIX */}
                  {selectedMethod === "pix" && (
                    <div className="p-6 bg-muted/50 rounded-lg text-center space-y-3">
                      <QrCode className="h-16 w-16 mx-auto text-purple-600 opacity-50" />
                      <p className="text-sm text-muted-foreground">
                        Aguardando pagamento via PIX
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(total)}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isProcessing}
            size="lg"
            className="gap-2 min-w-[200px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Confirmar {formatCurrency(total)}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
