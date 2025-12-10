import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isSubmitting: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const WizardNavigation = ({
  currentStep,
  totalSteps,
  canProceed,
  isSubmitting,
  onPrev,
  onNext,
  onSubmit,
}: WizardNavigationProps) => {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex gap-3 mt-6">
      {currentStep > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex-1"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
      )}

      {!isLastStep ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          className="flex-1"
        >
          Continuar
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? "Salvando..." : "Confirmar"}
          {!isSubmitting && <Check className="w-4 h-4 ml-1" />}
        </Button>
      )}
    </div>
  );
};
