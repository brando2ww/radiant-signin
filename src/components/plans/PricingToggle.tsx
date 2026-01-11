import { Badge } from "@/components/ui/badge";

interface PricingToggleProps {
  isYearly: boolean;
  onToggle: (isYearly: boolean) => void;
}

export function PricingToggle({ isYearly, onToggle }: PricingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      <button
        onClick={() => onToggle(false)}
        className={`text-sm sm:text-base md:text-lg font-medium transition-colors ${
          !isYearly ? "text-primary" : "text-muted-foreground"
        }`}
      >
        Mensal
      </button>
      
      <div className="relative">
        <button
          onClick={() => onToggle(!isYearly)}
          className="relative inline-flex h-7 w-12 sm:h-8 sm:w-14 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{
            backgroundColor: isYearly ? "hsl(var(--primary))" : "hsl(var(--muted))",
          }}
          role="switch"
          aria-checked={isYearly}
        >
          <span
            className={`inline-block h-5 w-5 sm:h-6 sm:w-6 transform rounded-full bg-background shadow-lg transition-transform ${
              isYearly ? "translate-x-6 sm:translate-x-7" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => onToggle(true)}
          className={`text-sm sm:text-base md:text-lg font-medium transition-colors ${
            isYearly ? "text-primary" : "text-muted-foreground"
          }`}
        >
          Anual
        </button>
        {isYearly && (
          <Badge variant="default" className="animate-fade-in bg-primary/10 text-primary hover:bg-primary/20 text-[10px] sm:text-xs px-1.5 sm:px-2">
            <span className="hidden sm:inline">Economize </span>20%
          </Badge>
        )}
      </div>
    </div>
  );
}
