import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Clock, Users } from "lucide-react";
import { PublicProduct } from "@/hooks/use-public-menu";
import { useState, useEffect } from "react";
import { CartItem } from "@/pages/PublicMenu";
import { toast } from "sonner";
import { useMarketingTracking } from "@/hooks/use-marketing-tracking";
import { formatBRL } from "@/lib/format";

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PublicProduct;
  onAddToCart: (item: CartItem) => void;
}

export const ProductDetailModal = ({
  open,
  onOpenChange,
  product,
  onAddToCart,
}: ProductDetailModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const { trackViewItem } = useMarketingTracking();

  const basePrice = product.promotional_price || product.base_price;

  // Track view when modal opens
  useEffect(() => {
    if (open) {
      trackViewItem({
        id: product.id,
        name: product.name,
        price: Number(basePrice),
      });
    }
  }, [open, product.id, product.name, basePrice, trackViewItem]);

  const handleOptionChange = (optionId: string, itemId: string, type: "single" | "multiple") => {
    setSelectedOptions((prev) => {
      if (type === "single") {
        return { ...prev, [optionId]: [itemId] };
      } else {
        const current = prev[optionId] || [];
        if (current.includes(itemId)) {
          return { ...prev, [optionId]: current.filter((id) => id !== itemId) };
        } else {
          return { ...prev, [optionId]: [...current, itemId] };
        }
      }
    });
  };

  const calculateTotal = () => {
    let total = Number(basePrice);

    product.delivery_product_options?.forEach((option) => {
      const selectedItems = selectedOptions[option.id] || [];
      selectedItems.forEach((itemId) => {
        const item = option.delivery_product_option_items?.find((i) => i.id === itemId);
        if (item) {
          total += Number(item.price_adjustment);
        }
      });
    });

    return total * quantity;
  };

  const validateOptions = () => {
    const errors: string[] = [];

    product.delivery_product_options?.forEach((option) => {
      const selected = selectedOptions[option.id] || [];
      
      if (option.is_required && selected.length === 0) {
        errors.push(`${option.name} é obrigatório`);
      }

      if (selected.length < option.min_selections) {
        errors.push(`Selecione pelo menos ${option.min_selections} opção(ões) em ${option.name}`);
      }

      if (selected.length > option.max_selections) {
        errors.push(`Selecione no máximo ${option.max_selections} opção(ões) em ${option.name}`);
      }
    });

    return errors;
  };

  const handleAddToCart = () => {
    const errors = validateOptions();
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
      return;
    }

    const cartOptions: CartItem["selectedOptions"] = [];
    
    product.delivery_product_options?.forEach((option) => {
      const selectedItems = selectedOptions[option.id] || [];
      selectedItems.forEach((itemId) => {
        const item = option.delivery_product_option_items?.find((i) => i.id === itemId);
        if (item) {
          cartOptions.push({
            optionId: option.id,
            optionName: option.name,
            itemId: item.id,
            itemName: item.name,
            priceAdjustment: Number(item.price_adjustment),
          });
        }
      });
    });

    onAddToCart({
      productId: product.id,
      name: product.name,
      quantity,
      unitPrice: Number(basePrice),
      selectedOptions: cartOptions,
      notes: notes || undefined,
    });

    toast.success("Produto adicionado ao carrinho!");
    onOpenChange(false);
    
    // Reset
    setQuantity(1);
    setNotes("");
    setSelectedOptions({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {product.image_url && (
            <div className="relative w-full h-64 rounded-lg overflow-hidden">
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.promotional_price && (
                <Badge className="absolute top-2 right-2 bg-red-500">
                  Promoção
                </Badge>
              )}
            </div>
          )}

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{product.preparation_time} min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Serve {product.serves} pessoa(s)</span>
            </div>
          </div>

          {/* Options */}
          {product.delivery_product_options?.map((option) => (
            <div key={option.id} className="space-y-3 border rounded-lg p-4">
              <div>
                <Label className="text-base font-semibold">
                  {option.name}
                  {option.is_required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {option.type === "single"
                    ? "Escolha 1 opção"
                    : `Escolha de ${option.min_selections} até ${option.max_selections} opções`}
                </p>
              </div>

              {option.type === "single" ? (
                <RadioGroup
                  value={selectedOptions[option.id]?.[0] || ""}
                  onValueChange={(value) => handleOptionChange(option.id, value, "single")}
                >
                  {option.delivery_product_option_items
                    ?.filter((item) => item.is_available)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={item.id} id={item.id} />
                          <Label htmlFor={item.id} className="cursor-pointer">
                            {item.name}
                          </Label>
                        </div>
                        {item.price_adjustment !== 0 && (
                          <span className="text-sm text-muted-foreground">
                            {item.price_adjustment > 0 ? "+" : ""}
                            {formatBRL(Number(item.price_adjustment))}
                          </span>
                        )}
                      </div>
                    ))}
                </RadioGroup>
              ) : (
                <div className="space-y-2">
                  {option.delivery_product_option_items
                    ?.filter((item) => item.is_available)
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={item.id}
                            checked={(selectedOptions[option.id] || []).includes(item.id)}
                            onCheckedChange={() =>
                              handleOptionChange(option.id, item.id, "multiple")
                            }
                          />
                          <Label htmlFor={item.id} className="cursor-pointer">
                            {item.name}
                          </Label>
                        </div>
                        {item.price_adjustment !== 0 && (
                          <span className="text-sm text-muted-foreground">
                            {item.price_adjustment > 0 ? "+" : ""}
                            {formatBRL(Number(item.price_adjustment))}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: sem cebola, ponto da carne, etc..."
              rows={3}
            />
          </div>

          {/* Quantity and Add */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
              <Button
                size="icon"
                variant="outline"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button onClick={handleAddToCart} size="lg">
              Adicionar • {formatBRL(calculateTotal())}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
