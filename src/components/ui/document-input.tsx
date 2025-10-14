import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface DocumentInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  documentType: 'cpf' | 'cnpj';
  value: string;
  onChange: (value: string) => void;
}

export const DocumentInput = React.forwardRef<HTMLInputElement, DocumentInputProps>(
  ({ documentType, value, onChange, className, ...props }, ref) => {
    const applyMask = (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      
      if (documentType === 'cpf') {
        return cleaned
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
          .slice(0, 14);
      } else {
        return cleaned
          .replace(/(\d{2})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1.$2')
          .replace(/(\d{3})(\d)/, '$1/$2')
          .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
          .slice(0, 18);
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const masked = applyMask(e.target.value);
      onChange(masked);
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={documentType === 'cpf' ? '000.000.000-00' : '00.000.000/0000-00'}
        maxLength={documentType === 'cpf' ? 14 : 18}
        className={cn(className)}
        {...props}
      />
    );
  }
);

DocumentInput.displayName = "DocumentInput";
