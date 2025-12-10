import { useState, useEffect } from "react";
import { TransactionFormData } from "@/lib/validations/transaction";
import { Transaction } from "@/hooks/use-transactions";
import { WizardProgress } from "./WizardProgress";
import { WizardNavigation } from "./WizardNavigation";
import { StepType } from "./StepType";
import { StepCategory } from "./StepCategory";
import { StepAmount } from "./StepAmount";
import { StepDetails } from "./StepDetails";
import { StepReview } from "./StepReview";

interface TransactionWizardProps {
  transaction?: Transaction | null;
  isSubmitting: boolean;
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
}

const TOTAL_STEPS = 5;

export const TransactionWizard = ({
  transaction,
  isSubmitting,
  onSubmit,
  onCancel,
}: TransactionWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{
    type: "income" | "expense";
    category: string;
    amount: number | string;
    transaction_date: Date;
    description: string;
    payment_method: string;
    is_recurring: boolean;
  }>({
    type: "income",
    category: "",
    amount: "",
    transaction_date: new Date(),
    description: "",
    payment_method: "",
    is_recurring: false,
  });

  // Populate form when editing
  useEffect(() => {
    if (transaction) {
      setFormData({
        type: transaction.type as "income" | "expense",
        category: transaction.category,
        amount: Number(transaction.amount),
        transaction_date: new Date(transaction.transaction_date + "T12:00:00"),
        description: transaction.description || "",
        payment_method: transaction.payment_method || "",
        is_recurring: transaction.is_recurring || false,
      });
      // When editing, go to review step directly
      setCurrentStep(TOTAL_STEPS - 1);
    } else {
      setFormData({
        type: "income",
        category: "",
        amount: "",
        transaction_date: new Date(),
        description: "",
        payment_method: "",
        is_recurring: false,
      });
      setCurrentStep(0);
    }
  }, [transaction]);

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Type
        return !!formData.type;
      case 1: // Category
        return !!formData.category;
      case 2: // Amount
        const amount = typeof formData.amount === "string" 
          ? parseFloat(formData.amount) 
          : formData.amount;
        return !isNaN(amount) && amount > 0;
      case 3: // Details
        return formData.description.length >= 3;
      case 4: // Review
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1 && canProceed()) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onCancel();
    }
  };

  const handleSubmit = () => {
    const amount = typeof formData.amount === "string"
      ? parseFloat(formData.amount)
      : formData.amount;

    onSubmit({
      type: formData.type,
      category: formData.category,
      amount,
      transaction_date: formData.transaction_date,
      description: formData.description,
      payment_method: formData.payment_method,
      is_recurring: formData.is_recurring,
    });
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepType
            value={formData.type}
            onChange={(type) => setFormData((prev) => ({ ...prev, type, category: "" }))}
          />
        );
      case 1:
        return (
          <StepCategory
            type={formData.type}
            value={formData.category}
            onChange={(category) => setFormData((prev) => ({ ...prev, category }))}
          />
        );
      case 2:
        return (
          <StepAmount
            amount={formData.amount}
            date={formData.transaction_date}
            onAmountChange={(amount) => setFormData((prev) => ({ ...prev, amount }))}
            onDateChange={(transaction_date) =>
              setFormData((prev) => ({ ...prev, transaction_date }))
            }
          />
        );
      case 3:
        return (
          <StepDetails
            description={formData.description}
            paymentMethod={formData.payment_method}
            isRecurring={formData.is_recurring}
            onDescriptionChange={(description) =>
              setFormData((prev) => ({ ...prev, description }))
            }
            onPaymentMethodChange={(payment_method) =>
              setFormData((prev) => ({ ...prev, payment_method }))
            }
            onRecurringChange={(is_recurring) =>
              setFormData((prev) => ({ ...prev, is_recurring }))
            }
          />
        );
      case 4:
        return (
          <StepReview
            type={formData.type}
            category={formData.category}
            amount={formData.amount}
            date={formData.transaction_date}
            description={formData.description}
            paymentMethod={formData.payment_method}
            isRecurring={formData.is_recurring}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-[400px]">
      <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      
      <div className="flex-1">
        {renderStep()}
      </div>

      <WizardNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        canProceed={canProceed()}
        isSubmitting={isSubmitting}
        onPrev={handlePrev}
        onNext={handleNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
