import { cn } from "@/lib/utils";

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
}

export const WizardProgress = ({ currentStep, totalSteps }: WizardProgressProps) => {
  return (
    <div className="flex gap-2 justify-center mb-6">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            i === currentStep
              ? "bg-primary w-8"
              : i < currentStep
              ? "bg-primary w-2"
              : "bg-muted w-2"
          )}
        />
      ))}
    </div>
  );
};
