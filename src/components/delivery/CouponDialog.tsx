import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useState, useEffect } from "react";
import {
  DeliveryCoupon,
  useCreateCoupon,
  useUpdateCoupon,
} from "@/hooks/use-delivery-coupons";

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: DeliveryCoupon;
}

export const CouponDialog = ({ open, onOpenChange, coupon }: CouponDialogProps) => {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("100");
  const [validFrom, setValidFrom] = useState("");
  const [validUntil, setValidUntil] = useState("");

  const createCoupon = useCreateCoupon();
  const updateCoupon = useUpdateCoupon();

  useEffect(() => {
    if (coupon) {
      setCode(coupon.code);
      setType(coupon.type);
      setValue(coupon.value.toString());
      setMinOrderValue(coupon.min_order_value.toString());
      setMaxDiscount(coupon.max_discount?.toString() || "");
      setUsageLimit(coupon.usage_limit.toString());
      setValidFrom(coupon.valid_from.split("T")[0]);
      setValidUntil(coupon.valid_until.split("T")[0]);
    } else {
      // Reset
      setCode("");
      setType("percentage");
      setValue("");
      setMinOrderValue("0");
      setMaxDiscount("");
      setUsageLimit("100");
      const today = new Date().toISOString().split("T")[0];
      setValidFrom(today);
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setValidUntil(nextMonth.toISOString().split("T")[0]);
    }
  }, [coupon, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const couponData = {
      code: code.toUpperCase(),
      type,
      value: Number(value),
      min_order_value: Number(minOrderValue),
      max_discount: maxDiscount ? Number(maxDiscount) : null,
      usage_limit: Number(usageLimit),
      valid_from: new Date(validFrom).toISOString(),
      valid_until: new Date(validUntil + "T23:59:59").toISOString(),
      is_active: true,
    };

    if (coupon) {
      updateCoupon.mutate(
        { id: coupon.id, updates: couponData },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createCoupon.mutate(couponData, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? "Editar Cupom" : "Criar Cupom"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Código do Cupom *</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Ex: PRIMEIRACOMPRA"
              maxLength={20}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use apenas letras e números (sem espaços)
            </p>
          </div>

          <div className="space-y-2">
            <Label>Tipo de Desconto *</Label>
            <RadioGroup value={type} onValueChange={(v: any) => setType(v)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage">Porcentagem (%)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Valor Fixo (R$)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                Valor do Desconto * {type === "percentage" ? "(%)" : "(R$)"}
              </Label>
              <Input
                id="value"
                type="number"
                step={type === "percentage" ? "1" : "0.01"}
                min="0"
                max={type === "percentage" ? "100" : undefined}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Pedido Mínimo (R$)</Label>
              <Input
                id="minOrderValue"
                type="number"
                step="0.01"
                min="0"
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                required
              />
            </div>
          </div>

          {type === "percentage" && (
            <div className="space-y-2">
              <Label htmlFor="maxDiscount">Desconto Máximo (R$)</Label>
              <Input
                id="maxDiscount"
                type="number"
                step="0.01"
                min="0"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="Opcional"
              />
              <p className="text-xs text-muted-foreground">
                Limite o valor máximo do desconto
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="usageLimit">Limite de Uso</Label>
            <Input
              id="usageLimit"
              type="number"
              min="1"
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Válido a partir de *</Label>
              <Input
                id="validFrom"
                type="date"
                value={validFrom}
                onChange={(e) => setValidFrom(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validUntil">Válido até *</Label>
              <Input
                id="validUntil"
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createCoupon.isPending || updateCoupon.isPending}
            >
              {coupon ? "Salvar" : "Criar Cupom"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
