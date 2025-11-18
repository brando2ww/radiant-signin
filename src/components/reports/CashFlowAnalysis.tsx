import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CashFlowAnalysisProps {
  bankAccounts: any[];
  summary: {
    totalBankBalance: number;
    totalCreditCardDebt: number;
    cashFlow: number;
  };
}

export const CashFlowAnalysis = ({ bankAccounts, summary }: CashFlowAnalysisProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + Number(acc.current_balance || 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Saldo em Contas</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(summary.totalBankBalance)}</p>
              </div>
              <Wallet className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dívidas (Cartões)</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(summary.totalCreditCardDebt)}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fluxo de Caixa Líquido</p>
                <p className={`text-2xl font-bold ${summary.cashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {formatCurrency(summary.cashFlow)}
                </p>
              </div>
              <DollarSign className={`h-8 w-8 ${summary.cashFlow >= 0 ? 'text-success' : 'text-destructive'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contas Bancárias</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {bankAccounts.map((account) => {
            const balancePercentage = totalBalance > 0
              ? (Number(account.current_balance) / totalBalance) * 100
              : 0;

            return (
              <div key={account.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{account.name}</h4>
                    {account.bank_name && (
                      <Badge variant="outline">{account.bank_name}</Badge>
                    )}
                  </div>
                  <span className="font-semibold text-lg">
                    {formatCurrency(Number(account.current_balance || 0))}
                  </span>
                </div>

                <Progress value={balancePercentage} className="h-2" />

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>
                    {account.account_type && `${account.account_type} • `}
                    {account.account_number && `****${account.account_number.slice(-4)}`}
                  </span>
                  <span>{balancePercentage.toFixed(1)}% do total</span>
                </div>
              </div>
            );
          })}

          {bankAccounts.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma conta bancária cadastrada
            </p>
          )}
        </CardContent>
      </Card>

      {summary.cashFlow < 0 && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-8 w-8 text-destructive" />
              <div>
                <h4 className="font-semibold text-destructive mb-1">Atenção: Fluxo de Caixa Negativo</h4>
                <p className="text-sm text-muted-foreground">
                  Suas dívidas de cartão superam o saldo disponível em contas.
                  Considere reduzir gastos ou aumentar receitas.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
