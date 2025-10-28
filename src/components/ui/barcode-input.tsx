import * as React from "react";
import { Input } from "@/components/ui/input";
import { Barcode } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BarcodeInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const BarcodeInput = React.forwardRef<HTMLInputElement, BarcodeInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          type="text"
          className={cn("pl-10", className)}
          ref={ref}
          {...props}
        />
        <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
);

BarcodeInput.displayName = "BarcodeInput";

export { BarcodeInput };
