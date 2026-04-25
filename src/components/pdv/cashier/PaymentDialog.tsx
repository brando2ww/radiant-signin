import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
import { Checkbox } from "@/components/ui/checkbox";
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
  FileText,
  Printer,
  AlertTriangle,
  Trash2,
  Search,
  Lock as LockIcon,
  Minus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Comanda, ComandaItem, usePDVComandas } from "@/hooks/use-pdv-comandas";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { usePDVPayments, PaymentMethod } from "@/hooks/use-pdv-payments";
import { usePDVProducts } from "@/hooks/use-pdv-products";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
import { useNFCeEmission } from "@/hooks/use-nfce-emission";
import { usePDVSettings } from "@/hooks/use-pdv-settings";
import { printNonFiscalReceipt, printDanfeFromUrl } from "@/lib/print-fiscal-receipt";
import { formatTableLabel } from "@/utils/formatTableNumber";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  comanda?: Comanda | null;
  items?: ComandaItem[];
  table?: PDVTable | null;
  tableComandas?: Comanda[];
  tableItems?: ComandaItem[];
  /** Quando true, força split com 1 linha por comanda nominal (cobrar tudo da mesa) */
  splitByComanda?: boolean;
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
  /** Quando preenchido, esta linha cobra uma comanda nominal específica */
  comandaId?: string;
  comandaLabel?: string;
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
  splitByComanda = false,
  onSuccess,
}: PaymentDialogProps) {
  const { user } = useAuth();
  
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
  const [discountAuthorizedBy, setDiscountAuthorizedBy] = useState("");
  const [discountReason, setDiscountReason] = useState("");
  const [serviceFeeEnabled, setServiceFeeEnabled] = useState(true);
  
  // Split payment
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [splitPayments, setSplitPayments] = useState<SplitPayment[]>([]);

  // Charge mode (segmented): "all" | "split-forms" | "by-product"
  type ChargeMode = "all" | "split-forms" | "by-product";
  const [chargeMode, setChargeMode] = useState<ChargeMode>("all");
  // Map<itemId, qtyToPay>
  const [selectedItemQtys, setSelectedItemQtys] = useState<Map<string, number>>(new Map());
  // Sessão de cobrança "Por produto" — usada para lock/unlock de itens
  const chargingSessionRef = useRef<string>("");
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState<{ change: number } | null>(null);
  const [nfceState, setNfceState] = useState<
    | { kind: "idle" }
    | { kind: "success"; chave: string; danfe?: string }
    | { kind: "error"; message: string; missing?: string[] }
  >({ kind: "idle" });

  const { registerPayment, isRegisteringPayment, registerTablePayment, isRegisteringTablePayment, registerPartialPayment, isRegisteringPartialPayment } = usePDVPayments();
  const {
    markAsCharging,
    releaseFromCharging,
    removeItem,
    isRemovingItem,
    addItem,
    isAddingItem,
    comandaItems: liveComandaItems,
    lockItemsForCharging,
    unlockItemsForCharging,
  } = usePDVComandas();
  const { products: productsList } = usePDVProducts();
  const { emitNFCe, isEmitting } = useNFCeEmission();
  const { settings } = usePDVSettings();

  // Edição do pedido (correção pelo caixa)
  const [itemToRemove, setItemToRemove] = useState<ComandaItem | null>(null);
  const [addItemDialogOpen, setAddItemDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [addItemQty, setAddItemQty] = useState("1");
  const [addItemNotes, setAddItemNotes] = useState("");

  // Comandas envolvidas neste pagamento (1 ou várias)
  const involvedComandas: Comanda[] = table
    ? tableComandas
    : comanda
      ? [comanda]
      : [];

  // Travamos `em_cobranca` quando o dialog abre. Guardamos os IDs
  // efetivamente travados (por nós) para liberar caso o operador cancele.
  const lockedIdsRef = useRef<string[]>([]);
  const paymentDoneRef = useRef(false);

  // Determine payment context
  const isTablePayment = !!table;

  // Itens vivos via React Query (atualizam em tempo real após add/remove)
  const liveItemsForPayment: ComandaItem[] = isTablePayment
    ? liveComandaItems.filter((it) => tableComandas.some((c) => c.id === it.comanda_id))
    : comanda
      ? liveComandaItems.filter((it) => it.comanda_id === comanda.id)
      : [];

  // Fallback para Balcão (comanda virtual sem registro real em pdv_comandas)
  const displayItems: ComandaItem[] = liveItemsForPayment.length > 0
    ? liveItemsForPayment
    : (isTablePayment ? tableItems : items);

  const liveSubtotal = displayItems.reduce(
    (sum, it) => sum + Number(it.subtotal || 0),
    0,
  );
  const fullSubtotal = liveItemsForPayment.length > 0
    ? liveSubtotal
    : (isTablePayment
        ? tableComandas.reduce((sum, c) => sum + c.subtotal, 0)
        : (comanda?.subtotal || 0));

  // Pagamento parcial (modo by-product) é suportado apenas quando temos itens reais persistidos.
  const supportsByProduct = liveItemsForPayment.length > 0 && !isTablePayment;

  // Itens disponíveis para seleção parcial (apenas com quantidade pendente)
  const selectableItems = displayItems.filter((it) => {
    const paid = (it as any).paid_quantity || 0;
    return it.quantity - paid > 0;
  });

  // Subtotal pendente (todos itens não pagos)
  const pendingSubtotal = selectableItems.reduce((sum, it) => {
    const paid = (it as any).paid_quantity || 0;
    return sum + (it.quantity - paid) * Number(it.unit_price || 0);
  }, 0);

  // Subtotal selecionado (modo by-product)
  const selectedSubtotal = Array.from(selectedItemQtys.entries()).reduce((sum, [id, qty]) => {
    const it = displayItems.find((d) => d.id === id);
    if (!it) return sum;
    return sum + qty * Number(it.unit_price || 0);
  }, 0);

  const isByProduct = chargeMode === "by-product" && supportsByProduct;

  // Subtotal efetivo usado para descontos/taxas/total
  const subtotal = isByProduct ? selectedSubtotal : fullSubtotal;

  const title = isTablePayment
    ? formatTableLabel(table?.table_number)
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

  // Discount requires password authorization and reason
  const hasDiscount = parseFloat(discountValue) > 0;
  const discountNeedsAuth = hasDiscount && !discountAuthorized;
  const discountNeedsReason = hasDiscount && !discountReason.trim();

  // Validation
  const hasByProductSelection = isByProduct && selectedItemQtys.size > 0 && selectedSubtotal > 0;
  const byProductBlocks = chargeMode === "by-product" && (!supportsByProduct || !hasByProductSelection);
  const canSubmit = !discountNeedsAuth && !discountNeedsReason && !byProductBlocks && (splitEnabled
    ? Math.abs(splitRemaining) < 0.01 && splitPayments.length > 0
    : selectedMethod !== "dinheiro" || cashReceivedNum >= total);

  // Reset state + adquirir lock em_cobranca quando o dialog abre.
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
      setDiscountAuthorizedBy("");
      setDiscountReason("");
      setServiceFeeEnabled(true);
      setShowSuccess(false);
      setSuccessData(null);
      setNfceState({ kind: "idle" });
      paymentDoneRef.current = false;
      lockedIdsRef.current = [];

      // Pré-popular split-por-comanda quando vier de "Cobrar tudo da mesa"
      if (splitByComanda && tableComandas.length > 1) {
        setSplitEnabled(true);
        setSplitPayments(
          tableComandas.map((c) => ({
            id: crypto.randomUUID(),
            method: "dinheiro" as PaymentMethod,
            amount: c.subtotal.toFixed(2),
            installments: "1",
            comandaId: c.id,
            comandaLabel: c.customer_name ?? `#${c.comanda_number}`,
          })),
        );
      } else {
        setSplitEnabled(false);
        setSplitPayments([]);
      }

      // Adquire lock em_cobranca para comandas vindas do garçom
      const candidateIds = involvedComandas
        .filter((c) => c.status === "aguardando_pagamento")
        .map((c) => c.id);
      if (candidateIds.length > 0) {
        markAsCharging(candidateIds)
          .then((lockedIds) => {
            lockedIdsRef.current = lockedIds;
            // Se algum candidato não pôde ser travado (outro caixa pegou antes),
            // fechamos o dialog para evitar conflito.
            if (lockedIds.length < candidateIds.length) {
              const stolen = candidateIds.length - lockedIds.length;
              toast.error(
                stolen === candidateIds.length
                  ? "Outro operador já está cobrando esta(s) comanda(s)."
                  : `${stolen} comanda(s) já está(ão) sendo cobrada(s) por outro operador.`,
              );
              if (lockedIds.length === 0) {
                onOpenChange(false);
              }
            }
          })
          .catch(() => {
            // Erro de rede: não bloqueia o pagamento (mutation final usa filtro tolerante).
          });
      }
    } else {
      // Dialog fechando: liberar lock se o pagamento não foi concluído
      if (!paymentDoneRef.current && lockedIdsRef.current.length > 0) {
        releaseFromCharging(lockedIdsRef.current).catch(() => {});
        lockedIdsRef.current = [];
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    const allocated = splitPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const remaining = total - allocated;
    setSplitPayments([
      ...splitPayments,
      {
        id: crypto.randomUUID(),
        method: "dinheiro",
        amount: remaining > 0 ? remaining.toFixed(2) : "",
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
    if (isProcessing) return;
    try {
      const finalAmount = total;
      const paymentData = {
        amount: finalAmount,
        paymentMethod: selectedMethod,
        cashReceived: selectedMethod === "dinheiro" ? cashReceivedNum : undefined,
        changeAmount: selectedMethod === "dinheiro" ? changeAmount : undefined,
        installments: selectedMethod === "cartao" ? parseInt(installments) : undefined,
        discountAmount: hasDiscount ? discountAmount : undefined,
        discountReason: hasDiscount ? discountReason : undefined,
        discountAuthorizedBy: hasDiscount ? discountAuthorizedBy : undefined,
      };

      // Modo split-por-comanda: 1 pagamento por comanda nominal (cada um com seu método)
      const isSplitByComanda = splitEnabled && splitPayments.some((p) => p.comandaId);
      if (isSplitByComanda && isTablePayment) {
        for (const line of splitPayments) {
          if (!line.comandaId) continue;
          const c = tableComandas.find((x) => x.id === line.comandaId);
          if (!c) continue;
          await registerPayment({
            comandaId: c.id,
            orderId: c.order_id,
            amount: parseFloat(line.amount) || c.subtotal,
            paymentMethod: line.method,
            installments: line.method === "cartao" ? parseInt(line.installments) : undefined,
            cashReceived: line.method === "dinheiro" ? parseFloat(line.amount) : undefined,
          });
        }
      } else if (isTablePayment && table) {
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

      paymentDoneRef.current = true;
      setSuccessData({ change: changeAmount });
      setShowSuccess(true);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
    }
  };

  const handleFinish = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  const buildBusinessInfo = () => ({
    name: settings?.business_name || settings?.nfe_nome_fantasia || "Estabelecimento",
    cnpj: settings?.business_cnpj || "",
    address: settings?.business_address || "",
    phone: settings?.business_phone || "",
  });

  const handlePrintNonFiscal = () => {
    printNonFiscalReceipt({
      business: buildBusinessInfo(),
      identifier: title,
      items: displayItems.map((i) => ({
        product_name: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
      })),
      subtotal,
      desconto: discountAmount,
      taxa_servico: serviceFeeAmount,
      total,
      forma_pagamento: selectedMethod,
      valor_pago: selectedMethod === "dinheiro" ? cashReceivedNum : total,
      troco: changeAmount,
    });
  };

  const handleEmitNFCe = async () => {
    try {
      // Buscar dados fiscais dos produtos
      const productIds = Array.from(new Set(displayItems.map((i) => i.product_id).filter(Boolean)));
      let productMap: Record<string, any> = {};
      if (productIds.length) {
        const { data: prods } = await supabase
          .from("pdv_products")
          .select("id, ncm, cfop, cest, origem, ean, unit")
          .in("id", productIds as string[]);
        (prods || []).forEach((p: any) => { productMap[p.id] = p; });
      }

      const result = await emitNFCe({
        comanda_id: comanda?.id || null,
        table_id: table?.id || null,
        order_id: comanda?.order_id || null,
        cashier_session_id: null,
        items: displayItems.map((i) => {
          const p = productMap[i.product_id] || {};
          return {
            product_id: i.product_id,
            product_name: i.product_name,
            quantity: i.quantity,
            unit_price: i.unit_price,
            subtotal: i.subtotal,
            ncm: p.ncm,
            cfop: p.cfop,
            cest: p.cest,
            origem: p.origem,
            ean: p.ean,
            unidade: p.unit,
          };
        }),
        valor_desconto: discountAmount || 0,
        valor_servico: serviceFeeAmount || 0,
        forma_pagamento: selectedMethod === "cartao" ? (cardType === "credito" ? "cartao_credito" : "cartao_debito") : selectedMethod,
        valor_pago: selectedMethod === "dinheiro" ? cashReceivedNum : total,
        troco: changeAmount || 0,
        parcelas: selectedMethod === "cartao" ? parseInt(installments) : 1,
      });

      if (result.success && result.chave_acesso) {
        setNfceState({ kind: "success", chave: result.chave_acesso, danfe: result.danfe_url });
      } else {
        setNfceState({
          kind: "error",
          message: result.motivo || result.error || "Falha ao emitir",
          missing: result.missing,
        });
      }
    } catch (e: any) {
      setNfceState({ kind: "error", message: e.message || "Erro inesperado" });
    }
  };

  const isProcessing = isRegisteringPayment || isRegisteringTablePayment;

  if (showSuccess) {
    const nfceEnabled = !!settings?.nfe_enable_nfce;
    const nfceConfigured = nfceEnabled && !!settings?.nfe_certificate_url && !!settings?.nfe_csc_id && !!settings?.nfe_csc_token;
    return (
      <Dialog open={open} onOpenChange={(o) => { if (!o) handleFinish(); }}>
        <DialogContent className="sm:max-w-md">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center py-6 space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-xl font-bold text-green-600">Pagamento Confirmado!</h3>
              <p className="text-2xl font-bold">{formatCurrency(total)}</p>
              {successData && successData.change > 0 && (
                <p className="text-sm text-muted-foreground">
                  Troco: <span className="font-bold text-foreground">{formatCurrency(successData.change)}</span>
                </p>
              )}
            </div>

            {/* NFC-e status */}
            {nfceState.kind === "success" && (
              <div className="w-full rounded-md border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-900 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  NFC-e autorizada
                </div>
                <p className="text-[11px] font-mono break-all text-muted-foreground">{nfceState.chave}</p>
                {nfceState.danfe && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => printDanfeFromUrl(nfceState.danfe!)}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir DANFE NFC-e
                  </Button>
                )}
              </div>
            )}

            {nfceState.kind === "error" && (
              <div className="w-full rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900 p-3 space-y-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  NFC-e não emitida
                </div>
                <p className="text-xs text-muted-foreground">{nfceState.message}</p>
                {nfceState.missing?.length ? (
                  <ul className="text-xs text-muted-foreground list-disc list-inside">
                    {nfceState.missing.map((m, i) => <li key={i}>{m}</li>)}
                  </ul>
                ) : null}
              </div>
            )}

            <div className="w-full space-y-2 pt-2">
              <Button
                className="w-full"
                size="lg"
                onClick={handleEmitNFCe}
                disabled={isEmitting || nfceState.kind === "success" || !nfceConfigured}
                title={!nfceConfigured ? "Configure NFC-e em Integrações > NF Automática" : undefined}
              >
                {isEmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                {nfceState.kind === "error" ? "Tentar emitir NFC-e novamente" : "Emitir NFC-e (Cupom Fiscal)"}
              </Button>

              {!nfceConfigured && (
                <p className="text-[11px] text-center text-muted-foreground -mt-1">
                  {!nfceEnabled ? "NFC-e desabilitada nas configurações" : "Configure certificado e CSC em Integrações > NF Automática"}
                </p>
              )}

              <Button variant="outline" className="w-full" onClick={handlePrintNonFiscal}>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Recibo Não-Fiscal
              </Button>

              <Button variant="ghost" className="w-full" onClick={handleFinish}>
                Concluir
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    );
  }

  // Produtos para o dialog de adicionar item
  const targetComandaIdForAdd: string | null =
    comanda?.id ?? (isTablePayment && tableComandas.length === 1 ? tableComandas[0].id : null);
  const filteredProducts = (productsList || []).filter((p: any) => {
    if (!p.is_available) return false;
    if (!productSearch.trim()) return true;
    const q = productSearch.trim().toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.ean?.toLowerCase?.().includes(q) ||
      p.category?.toLowerCase?.().includes(q)
    );
  });
  const selectedProduct = filteredProducts.find((p: any) => p.id === selectedProductId)
    ?? (productsList || []).find((p: any) => p.id === selectedProductId);

  const handleConfirmAddItem = async () => {
    if (!targetComandaIdForAdd || !selectedProduct) return;
    const qty = Math.max(1, parseInt(addItemQty) || 1);
    try {
      await addItem({
        comandaId: targetComandaIdForAdd,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: qty,
        unitPrice: Number(selectedProduct.price_salon) || 0,
        notes: addItemNotes.trim() || undefined,
      });
      setAddItemDialogOpen(false);
      setSelectedProductId(null);
      setProductSearch("");
      setAddItemQty("1");
      setAddItemNotes("");
    } catch (e) {
      // toast já é exibido pelo hook
    }
  };

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] overflow-hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Pagamento - {title}
          </DialogTitle>
          <DialogDescription>
            Revise o pedido e selecione a forma de pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column - Order Summary */}
          <div className="flex flex-col gap-4 max-h-[65vh]">
            <div className="overflow-y-auto flex-1 space-y-4 pr-1">
            {/* Items List */}
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Resumo do Pedido
                </h4>
                <ScrollArea className="h-[160px]">
                  <div className="space-y-1">
                    <AnimatePresence initial={false}>
                      {displayItems.map((item) => {
                        const canRemove =
                          item.kitchen_status === "pendente" ||
                          item.kitchen_status === "preparando";
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0, marginTop: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center justify-between gap-2 text-sm py-1"
                          >
                            <span className="text-muted-foreground flex-1 min-w-0 truncate">
                              {item.quantity}x {item.product_name}
                            </span>
                            <span className="font-medium tabular-nums">
                              {formatCurrency(item.subtotal)}
                            </span>
                            {canRemove ? (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setItemToRemove(item)}
                                disabled={isRemovingItem}
                                aria-label="Remover item"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            ) : (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="inline-flex">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 shrink-0 text-muted-foreground/40 cursor-not-allowed"
                                      disabled
                                      aria-label="Item não pode ser removido"
                                      tabIndex={-1}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                  Item já preparado pela cozinha — não pode ser removido
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </ScrollArea>

                {/* Add item / multi-comanda hint */}
                <div className="mt-3 pt-3 border-t">
                  {isTablePayment && tableComandas.length > 1 ? (
                    <p className="text-xs text-muted-foreground italic">
                      Para adicionar itens, acesse a comanda específica.
                    </p>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setProductSearch("");
                        setSelectedProductId(null);
                        setAddItemQty("1");
                        setAddItemNotes("");
                        setAddItemDialogOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar item
                    </Button>
                  )}
                </div>
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
onClick={() => {
                          setDiscountType("percent");
                          setDiscountAuthorized(false);
                          setDiscountAuthorizedBy("");
                          setDiscountPassword("");
                        }}
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
                        onClick={() => {
                          setDiscountType("value");
                          setDiscountAuthorized(false);
                          setDiscountAuthorizedBy("");
                          setDiscountPassword("");
                        }}
                      >
                        <DollarSign className="h-4 w-4" />
                      </Button>
                    </div>
                    {discountType === "percent" ? (
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0"
                          value={discountValue}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                            setDiscountValue(val > 0 ? val.toString() : e.target.value);
                            setDiscountAuthorized(false);
                            setDiscountAuthorizedBy("");
                            setDiscountPassword("");
                            setDiscountReason("");
                          }}
                          className="pr-8"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm pointer-events-none">%</span>
                      </div>
                    ) : (
                      <div className="flex-1">
                        <CurrencyInput
                          value={discountValue}
                          onChange={(val) => {
                            setDiscountValue(val);
                            setDiscountAuthorized(false);
                            setDiscountAuthorizedBy("");
                            setDiscountPassword("");
                            setDiscountReason("");
                          }}
                          placeholder="0,00"
                        />
                      </div>
                    )}
                  </div>

                  {/* Discount reason + password side by side */}
                  {hasDiscount && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <FileText className="h-3 w-3 text-amber-500" />
                          Motivo *
                        </Label>
                        <Input
                          type="text"
                          placeholder="Ex: Cliente frequente"
                          value={discountReason}
                          onChange={(e) => setDiscountReason(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs flex items-center gap-1">
                          <Lock className="h-3 w-3 text-amber-500" />
                          Senha
                        </Label>
                        <div className="flex gap-1">
                          <Input
                            type="password"
                            inputMode="numeric"
                            placeholder="Senha"
                            value={discountPassword}
                            onChange={(e) => setDiscountPassword(e.target.value)}
                            className="h-8 text-sm flex-1"
                          />
                          <Button
                            type="button"
                            variant={discountAuthorized ? "default" : "outline"}
                            size="sm"
                            className="shrink-0 h-8 px-2 text-xs"
                            disabled={discountAuthorized}
                            onClick={async () => {
                              if (!discountPassword) {
                                toast.error("Digite a senha");
                                return;
                              }
                              const { data: users, error } = await supabase
                                .from("establishment_users")
                                .select("display_name, discount_password, max_discount_percent")
                                .eq("establishment_owner_id", user?.id || "")
                                .eq("is_active", true) as any;

                              if (error) {
                                toast.error("Erro ao verificar senha");
                                return;
                              }

                              const authorizer = (users || []).find(
                                (u: any) => u.discount_password === discountPassword
                              );

                              if (!authorizer) {
                                toast.error("Senha incorreta");
                                setDiscountPassword("");
                                return;
                              }

                              const discountPercent = discountType === "percent"
                                ? parseFloat(discountValue) || 0
                                : ((parseFloat(discountValue) || 0) / subtotal) * 100;
                              
                              const maxAllowed = authorizer.max_discount_percent ?? 100;

                              if (discountPercent > maxAllowed) {
                                toast.error(
                                  `Desconto acima do limite de ${authorizer.display_name || "operador"} (máx ${maxAllowed}%)`
                                );
                                setDiscountPassword("");
                                return;
                              }

                              setDiscountAuthorized(true);
                              setDiscountAuthorizedBy(authorizer.display_name || "Operador");
                              toast.success(`Desconto autorizado por ${authorizer.display_name || "operador"}`);
                            }}
                          >
                            {discountAuthorized ? "✓" : "OK"}
                          </Button>
                        </div>
                        {discountAuthorized && discountAuthorizedBy && (
                          <p className="text-xs text-green-600">
                            Por: {discountAuthorizedBy}
                          </p>
                        )}
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

            </div>

            {/* Totals - fixed at bottom */}
            <Card className="bg-primary/5 border-primary/20 shrink-0">
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
                  <motion.span
                    key={total}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="font-bold text-2xl text-primary"
                  >
                    {formatCurrency(total)}
                  </motion.span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment */}
          <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-1">
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

    {/* Confirmação de remoção de item */}
    <AlertDialog open={!!itemToRemove} onOpenChange={(o) => { if (!o) setItemToRemove(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover item?</AlertDialogTitle>
          <AlertDialogDescription>
            {itemToRemove && (
              <>
                <span className="font-medium text-foreground">
                  {itemToRemove.quantity}x {itemToRemove.product_name}
                </span>{" "}
                — {formatCurrency(itemToRemove.subtotal)} será removido da conta.
                <br />
                Esta ação não pode ser desfeita.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemovingItem}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isRemovingItem}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.preventDefault();
              if (!itemToRemove) return;
              removeItem(itemToRemove.id);
              setItemToRemove(null);
            }}
          >
            {isRemovingItem ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Removendo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Remover
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Dialog para adicionar item */}
    <Dialog open={addItemDialogOpen} onOpenChange={setAddItemDialogOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-primary" />
            Adicionar item à comanda
          </DialogTitle>
          <DialogDescription>
            Busque um produto para incluir no pedido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="Buscar por nome, código ou categoria..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[260px] border rounded-md">
            <div className="p-1">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum produto encontrado.
                </p>
              ) : (
                filteredProducts.slice(0, 200).map((p: any) => {
                  const isSelected = p.id === selectedProductId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedProductId(p.id)}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-left text-sm transition-colors",
                        isSelected
                          ? "bg-primary/10 text-foreground"
                          : "hover:bg-muted"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        {p.category && (
                          <p className="text-xs text-muted-foreground truncate">{p.category}</p>
                        )}
                      </div>
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(Number(p.price_salon) || 0)}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>

          {selectedProduct && (
            <div className="border-t pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm">
                  Selecionado: <span className="font-medium">{selectedProduct.name}</span>
                </p>
                <span className="font-semibold tabular-nums">
                  {formatCurrency(Number(selectedProduct.price_salon) || 0)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    min={1}
                    value={addItemQty}
                    onChange={(e) => setAddItemQty(e.target.value)}
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">Observações (opcional)</Label>
                  <Input
                    type="text"
                    placeholder="Ex: sem cebola"
                    value={addItemNotes}
                    onChange={(e) => setAddItemNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={() => setAddItemDialogOpen(false)}
            disabled={isAddingItem}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmAddItem}
            disabled={!selectedProduct || !targetComandaIdForAdd || isAddingItem}
          >
            {isAddingItem ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adicionando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
