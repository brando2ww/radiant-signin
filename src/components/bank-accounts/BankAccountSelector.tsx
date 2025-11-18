import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBankAccounts } from "@/hooks/use-bank-accounts";
import { Wallet } from "lucide-react";

interface BankAccountSelectorProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function BankAccountSelector({
  value,
  onValueChange,
  placeholder = "Selecione uma conta",
  disabled,
}: BankAccountSelectorProps) {
  const { bankAccounts, isLoading } = useBankAccounts();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Carregando contas..." />
        </SelectTrigger>
      </Select>
    );
  }

  if (!bankAccounts || bankAccounts.length === 0) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Nenhuma conta cadastrada" />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {bankAccounts.map((account) => (
          <SelectItem key={account.id} value={account.id}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: account.color || "#3b82f6" }}
              />
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span>{account.name}</span>
              <span className="text-xs text-muted-foreground">
                ({formatCurrency(account.current_balance)})
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
