import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TrendingDown, Settings, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpenseLimitCardProps {
  currentSpending: number;
  limit: number;
  onUpdateLimit: (newLimit: number) => void;
}

export const ExpenseLimitCard = ({
  currentSpending,
  limit,
  onUpdateLimit,
}: ExpenseLimitCardProps) => {
  const [showDialog, setShowDialog] = useState(false);
  const [tempLimit, setTempLimit] = useState(limit > 0 ? limit.toString() : '');

  const percentageUsed = limit > 0 ? (currentSpending / limit) * 100 : 0;
  const exceeded = percentageUsed > 100;
  const amountOver = exceeded ? currentSpending - limit : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getLimitColor = (percentage: number) => {
    if (percentage >= 100) return 'text-destructive';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return '[&>div]:bg-destructive';
    if (percentage >= 80) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-green-500';
  };

  const handleSubmit = () => {
    const newLimit = Number(tempLimit);
    if (newLimit > 0) {
      onUpdateLimit(newLimit);
      setShowDialog(false);
    }
  };

  return (
    <>
      <Card className={cn(
        "glass-bg border-border/20 mb-4 md:mb-6 animate-fade-in",
        exceeded && "border-destructive",
        percentageUsed >= 80 && !exceeded && "border-yellow-500"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-destructive" />
              <CardTitle className="text-base">Limite de Controle - Despesas</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTempLimit(limit > 0 ? limit.toString() : '');
                setShowDialog(true);
              }}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {limit > 0 ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Gasto atual</span>
                  <span className={cn("font-medium", getLimitColor(percentageUsed))}>
                    {Math.min(percentageUsed, 100).toFixed(1)}%
                  </span>
                </div>
                
                <Progress 
                  value={Math.min(percentageUsed, 100)} 
                  className={cn("h-2", getProgressColor(percentageUsed))}
                />
                
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    {formatCurrency(currentSpending)}
                  </span>
                  <span className="text-muted-foreground">
                    de {formatCurrency(limit)}
                  </span>
                </div>
              </div>
              
              {percentageUsed >= 80 && percentageUsed < 100 && (
                <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle>Atenção ao Limite!</AlertTitle>
                  <AlertDescription>
                    Você está usando {percentageUsed.toFixed(0)}% do seu limite mensal de despesas.
                  </AlertDescription>
                </Alert>
              )}
              
              {exceeded && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Limite Ultrapassado!</AlertTitle>
                  <AlertDescription>
                    Suas despesas excederam o limite em {formatCurrency(amountOver)}
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-2">
              <p className="text-sm text-muted-foreground mb-2">
                Nenhum limite definido
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setTempLimit('');
                  setShowDialog(true);
                }}
              >
                Configurar Limite
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Limit Configuration Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Limite de Despesas</DialogTitle>
            <DialogDescription>
              Defina um limite mensal para controlar seus gastos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="limit-input">Limite Mensal (R$)</Label>
              <Input
                id="limit-input"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 5000.00"
                value={tempLimit}
                onChange={(e) => setTempLimit(e.target.value)}
              />
            </div>
            
            {/* Preview */}
            <div className="rounded-lg border p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">Preview</p>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Gasto atual:</span>
                  <span className="font-medium">{formatCurrency(currentSpending)}</span>
                </div>
                {tempLimit && Number(tempLimit) > 0 && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Novo limite:</span>
                      <span className="font-medium">{formatCurrency(Number(tempLimit))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Percentual usado:</span>
                      <span className={cn(
                        "font-medium",
                        getLimitColor((currentSpending / Number(tempLimit)) * 100)
                      )}>
                        {((currentSpending / Number(tempLimit)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={!tempLimit || Number(tempLimit) <= 0}>
              Salvar Limite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
