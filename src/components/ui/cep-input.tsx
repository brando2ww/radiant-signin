import * as React from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

interface CEPInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const CEPInput = React.forwardRef<HTMLInputElement, CEPInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const applyMask = (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      return cleaned
        .replace(/(\d{5})(\d)/, '$1-$2')
        .slice(0, 9);
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
        placeholder="00000-000"
        maxLength={9}
        className={cn(className)}
        {...props}
      />
    );
  }
);

CEPInput.displayName = "CEPInput";
