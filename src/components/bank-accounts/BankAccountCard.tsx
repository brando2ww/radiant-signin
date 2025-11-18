import { Wallet, Pencil, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BankAccount } from "@/hooks/use-bank-accounts";

interface BankAccountCardProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (id: string) => void;
}

export function BankAccountCard({ account, onEdit, onDelete }: BankAccountCardProps) {
  const balanceDiff = account.current_balance - account.initial_balance;
  const isPositive = balanceDiff >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-lg"
      style={{
        borderLeft: `4px solid ${account.color || '#3b82f6'}`,
      }}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: `${account.color || '#3b82f6'}20`,
              }}
            >
              <Wallet 
                className="h-6 w-6" 
                style={{ color: account.color || '#3b82f6' }}
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{account.name}</h3>
              {account.bank_name && (
                <p className="text-sm text-muted-foreground">{account.bank_name}</p>
              )}
            </div>
          </div>
          
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(account)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(account.id)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Saldo Atual</p>
            <p className="text-2xl font-bold">
              {formatCurrency(account.current_balance)}
            </p>
          </div>

          <div className="flex items-center gap-4 pt-3 border-t">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Saldo Inicial</p>
              <p className="text-sm font-medium">
                {formatCurrency(account.initial_balance)}
              </p>
            </div>
            
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Variação</p>
              <div className="flex items-center gap-1">
                {isPositive ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <p className={`text-sm font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(Math.abs(balanceDiff))}
                </p>
              </div>
            </div>
          </div>

          {(account.agency || account.account_number) && (
            <div className="pt-3 border-t">
              <p className="text-xs text-muted-foreground">
                {account.agency && `Ag: ${account.agency}`}
                {account.agency && account.account_number && " • "}
                {account.account_number && `CC: ${account.account_number}`}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
