import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface PhoneInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const applyMask = (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      
      if (cleaned.length <= 10) {
        // Formato: (00) 0000-0000
        return cleaned
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{4})(\d)/, '$1-$2')
          .slice(0, 14);
      } else {
        // Formato: (00) 00000-0000
        return cleaned
          .replace(/(\d{2})(\d)/, '($1) $2')
          .replace(/(\d{5})(\d)/, '$1-$2')
          .slice(0, 15);
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
        placeholder="(00) 00000-0000"
        maxLength={15}
        className={cn(className)}
        {...props}
      />
    );
  }
);

PhoneInput.displayName = "PhoneInput";
