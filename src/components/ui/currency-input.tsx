import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: string | number;
  onChange: (value: string) => void;
}

// Converte número para formato brasileiro: 1234.56 → "1.234,56"
const formatToBRL = (value: number | string): string => {
  if (value === "" || value === null || value === undefined) return "";
  
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "";
  
  return numValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Converte formato brasileiro para número: "1.234,56" → "1234.56"
const parseBRLToNumber = (value: string): string => {
  if (!value) return "";
  
  // Remove pontos de milhar e substitui vírgula por ponto
  const cleaned = value.replace(/\./g, "").replace(",", ".");
  
  return cleaned;
};

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState("");

    // Atualiza o display quando o value externo muda
    React.useEffect(() => {
      if (value !== undefined && value !== null && value !== "") {
        const numValue = typeof value === "string" ? parseFloat(value) : value;
        if (!isNaN(numValue)) {
          setDisplayValue(formatToBRL(numValue));
        }
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      
      // Remove tudo exceto números
      const numbersOnly = inputValue.replace(/\D/g, "");
      
      if (numbersOnly === "") {
        setDisplayValue("");
        onChange("");
        return;
      }
      
      // Converte para centavos e depois para reais
      const cents = parseInt(numbersOnly, 10);
      const reais = cents / 100;
      
      // Formata para exibição
      const formatted = formatToBRL(reais);
      setDisplayValue(formatted);
      
      // Envia valor numérico para o parent
      onChange(reais.toString());
    };

    return (
      <div className="relative flex items-center">
        <span className="absolute left-3 text-muted-foreground pointer-events-none text-sm">
          R$
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayValue}
          onChange={handleChange}
          className={cn("pl-9", className)}
          placeholder="0,00"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";
