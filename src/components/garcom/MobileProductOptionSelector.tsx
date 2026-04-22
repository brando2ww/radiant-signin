import { useState } from "react";
import { Check, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PDVProductOption } from "@/hooks/use-pdv-product-options";
import type { SelectedOption } from "@/components/pdv/ProductOptionSelector";

interface Props {
  options: PDVProductOption[];
  basePrice: number;
  onConfirm: (selections: SelectedOption[]) => void;
  onBack: () => void;
}

function getItemPrice(item: any): number {
  if (item.linked_product) {
    return Number(item.linked_product.price_salon) || 0;
  }
  return Number(item.price_adjustment) || 0;
}

function helperText(option: PDVProductOption): string {
  const min = option.min_selections || (option.is_required ? 1 : 0);
  const max = option.max_selections || 0;
  if (option.type === "single") return "Escolha 1";
  if (max > 0 && min > 0 && min !== max) return `Escolha de ${min} a ${max}`;
  if (max > 0) return `Escolha até ${max}`;
  if (min > 0) return `Escolha pelo menos ${min}`;
  return "Escolha quantos quiser";
}

export function MobileProductOptionSelector({
  options,
  basePrice,
  onConfirm,
  onBack,
}: Props) {
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  const toggle = (option: PDVProductOption, itemId: string) => {
    setSelections((prev) => {
      const current = prev[option.id] || [];
      if (option.type === "single") {
        // Mesmo item já escolhido → mantém (não desseleciona em single obrigatório).
        // Em opcional, permite desseleção.
        if (current[0] === itemId) {
          return option.is_required ? prev : { ...prev, [option.id]: [] };
        }
        return { ...prev, [option.id]: [itemId] };
      }
      // Multiple
      if (current.includes(itemId)) {
        return { ...prev, [option.id]: current.filter((id) => id !== itemId) };
      }
      if (option.max_selections > 0 && current.length >= option.max_selections) {
        return prev;
      }
      return { ...prev, [option.id]: [...current, itemId] };
    });
  };

  const isGroupValid = (option: PDVProductOption): boolean => {
    const selected = selections[option.id] || [];
    if (!option.is_required) return true;
    return selected.length >= (option.min_selections || 1);
  };

  const isValid = options.every(isGroupValid);

  const extras = Object.entries(selections).reduce((total, [optId, itemIds]) => {
    const option = options.find((o) => o.id === optId);
    if (!option) return total;
    return (
      total +
      itemIds.reduce((sum, itemId) => {
        const item = option.items.find((i) => i.id === itemId);
        return sum + (item ? getItemPrice(item) : 0);
      }, 0)
    );
  }, 0);

  const handleConfirm = () => {
    const result: SelectedOption[] = options
      .filter((opt) => (selections[opt.id] || []).length > 0)
      .map((opt) => ({
        optionId: opt.id,
        optionName: opt.name,
        items: (selections[opt.id] || []).map((itemId) => {
          const item = opt.items.find((i) => i.id === itemId)!;
          return {
            itemId: item.id,
            itemName: item.name,
            priceAdjustment: getItemPrice(item),
            linkedProductId: item.linked_product_id || null,
            printerStation: (item.linked_product as any)?.printer_station || null,
            recipes: (item.recipes || []).map((r: any) => ({
              ingredient_id: r.ingredient_id,
              quantity: Number(r.quantity) || 1,
            })),
          };
        }),
      }));
    onConfirm(result);
  };

  const total = basePrice + extras;
  const showStepLabel = options.length > 1;

  return (
    <div className="flex flex-col">
      {/* Resumo de preço vivo */}
      <div className="mb-4 flex items-baseline justify-between rounded-xl bg-muted/50 px-3 py-2">
        <span className="text-xs text-muted-foreground">Total</span>
        <span className="text-base font-semibold tabular-nums">
          R$ {total.toFixed(2)}
          {extras > 0 && (
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              (+R$ {extras.toFixed(2)})
            </span>
          )}
        </span>
      </div>

      {/* Grupos */}
      <div className="space-y-5 pb-4">
        {options.map((option, idx) => {
          const selected = selections[option.id] || [];
          const valid = isGroupValid(option);
          const filled = selected.length > 0;

          return (
            <section
              key={option.id}
              aria-required={option.is_required}
              className={cn(
                "rounded-2xl border p-3 transition-colors",
                filled ? "bg-muted/30 border-border" : "bg-card border-border",
              )}
            >
              {/* Cabeçalho do grupo */}
              <header className="mb-3">
                {showStepLabel && (
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Etapa {idx + 1} de {options.length}
                  </p>
                )}
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold leading-tight">
                    {option.name}
                  </h3>
                  {option.is_required && (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                      Obrigatório
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    "mt-0.5 text-xs",
                    valid || !option.is_required
                      ? "text-muted-foreground"
                      : "text-destructive",
                  )}
                >
                  {helperText(option)}
                  {option.type === "multiple" && option.max_selections > 0 && (
                    <span className="ml-1 tabular-nums">
                      · {selected.length}/{option.max_selections}
                    </span>
                  )}
                </p>
              </header>

              {/* Itens */}
              <div className="space-y-2">
                {option.items.length === 0 ? (
                  <p className="rounded-lg border border-dashed py-3 text-center text-xs text-muted-foreground">
                    Nenhum item disponível
                  </p>
                ) : (
                  option.items.map((item) => {
                    const isSelected =
                      option.type === "single"
                        ? selected[0] === item.id
                        : selected.includes(item.id);
                    const price = getItemPrice(item);
                    const reachedMax =
                      option.type === "multiple" &&
                      option.max_selections > 0 &&
                      !isSelected &&
                      selected.length >= option.max_selections;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={isSelected}
                        disabled={reachedMax}
                        onClick={() => toggle(option, item.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors min-h-[52px]",
                          "active:scale-[0.98] transition-transform",
                          isSelected
                            ? "border-primary bg-primary/10"
                            : "border-border bg-background",
                          reachedMax && "opacity-50",
                        )}
                      >
                        {/* Indicador */}
                        <span
                          className={cn(
                            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground/30 bg-transparent",
                          )}
                        >
                          {isSelected && <Check className="h-4 w-4" strokeWidth={3} />}
                        </span>

                        {/* Nome */}
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "text-sm font-medium",
                                isSelected && "text-foreground",
                              )}
                            >
                              {item.name}
                            </span>
                            {item.linked_product && (
                              <Package className="h-3 w-3 text-muted-foreground" />
                            )}
                          </span>
                        </span>

                        {/* Preço */}
                        {price > 0 && (
                          <span className="shrink-0 text-sm tabular-nums text-muted-foreground">
                            + R$ {price.toFixed(2)}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Footer sticky */}
      <div className="sticky bottom-0 -mx-4 mt-2 border-t bg-background px-4 pt-3 pb-4 shadow-[0_-8px_16px_-8px_rgba(0,0,0,0.15)]" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1"
            onClick={onBack}
          >
            Voltar
          </Button>
          <Button
            type="button"
            className="h-12 flex-[2] text-base"
            onClick={handleConfirm}
            disabled={!isValid}
          >
            Continuar · R$ {total.toFixed(2)}
          </Button>
        </div>
      </div>
    </div>
  );
}
