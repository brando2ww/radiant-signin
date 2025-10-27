import { DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CashierStatus() {
  // TODO: Integrar com sistema de caixa
  const isCashierOpen = false;
  const currentBalance = 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-2 h-10 px-3"
          >
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline text-sm font-medium">
              R$ {currentBalance.toFixed(2)}
            </span>
            <Badge 
              variant={isCashierOpen ? "default" : "secondary"}
              className="ml-1"
            >
              {isCashierOpen ? "Aberto" : "Fechado"}
            </Badge>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Caixa {isCashierOpen ? "aberto" : "fechado"}</p>
          <p className="text-xs text-muted-foreground">
            Saldo atual: R$ {currentBalance.toFixed(2)}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
