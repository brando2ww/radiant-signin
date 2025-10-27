import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingDown, TrendingUp, Lock, Unlock, ArrowDownUp } from "lucide-react";
import { usePDVCashier } from "@/hooks/use-pdv-cashier";
import { OpenCashierDialog } from "@/components/pdv/OpenCashierDialog";
import { CloseCashierDialog } from "@/components/pdv/CloseCashierDialog";
import { CashMovementDialog } from "@/components/pdv/CashMovementDialog";
import { CashMovementsList } from "@/components/pdv/CashMovementsList";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PDVCashier() {
  const {
    activeSession,
    movements,
    isLoading,
    openCashier,
    isOpeningCashier,
    closeCashier,
    isClosingCashier,
    addMovement,
    isAddingMovement,
  } = usePDVCashier();

  const [openDialog, setOpenDialog] = useState(false);
  const [closeDialog, setCloseDialog] = useState(false);
  const [movementDialog, setMovementDialog] = useState(false);

  const handleOpenCashier = (openingBalance: number) => {
    openCashier({ openingBalance });
    setOpenDialog(false);
  };

  const handleCloseCashier = (closingBalance: number, notes?: string) => {
    if (!activeSession) return;
    closeCashier({ sessionId: activeSession.id, closingBalance, notes });
    setCloseDialog(false);
  };

  const handleAddMovement = (
    type: "sangria" | "reforco",
    amount: number,
    description?: string
  ) => {
    addMovement({ type, amount, description });
    setMovementDialog(false);
  };

  const currentBalance = activeSession
    ? activeSession.opening_balance +
      activeSession.total_cash -
      activeSession.total_withdrawals
    : 0;

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Caixa</h1>
          <p className="text-muted-foreground">
            {activeSession
              ? `Aberto em ${format(new Date(activeSession.opened_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`
              : "Controle de movimentações e fechamento de caixa"}
          </p>
        </div>
        <div className="flex gap-2">
          {activeSession ? (
            <>
              <Button variant="outline" onClick={() => setMovementDialog(true)}>
                <ArrowDownUp className="h-4 w-4 mr-2" />
                Movimentação
              </Button>
              <Button variant="destructive" onClick={() => setCloseDialog(true)}>
                <Lock className="h-4 w-4 mr-2" />
                Fechar Caixa
              </Button>
            </>
          ) : (
            <Button onClick={() => setOpenDialog(true)}>
              <Unlock className="h-4 w-4 mr-2" />
              Abrir Caixa
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {currentBalance.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSession ? "Em dinheiro no caixa" : "Caixa fechado"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Vendas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(activeSession?.total_sales || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Dinheiro: R$ {(activeSession?.total_cash || 0).toFixed(2)} | 
              Cartão: R$ {(activeSession?.total_card || 0).toFixed(2)} | 
              PIX: R$ {(activeSession?.total_pix || 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sangrias</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(activeSession?.total_withdrawals || 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {movements.filter((m) => m.type === "sangria").length} retiradas
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentações</CardTitle>
          <CardDescription>
            {activeSession
              ? "Histórico de entradas e saídas do caixa atual"
              : "Abra o caixa para registrar movimentações"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <CashMovementsList movements={movements} />
          ) : (
            <div className="min-h-[300px] flex items-center justify-center">
              <div className="text-center space-y-4 text-muted-foreground">
                <Lock className="h-12 w-12 mx-auto" />
                <div>
                  <p className="font-medium">Caixa fechado</p>
                  <p className="text-sm">Abra o caixa para começar</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <OpenCashierDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onOpen={handleOpenCashier}
        isOpening={isOpeningCashier}
      />

      <CloseCashierDialog
        open={closeDialog}
        onOpenChange={setCloseDialog}
        onClose={handleCloseCashier}
        isClosing={isClosingCashier}
        session={activeSession}
      />

      <CashMovementDialog
        open={movementDialog}
        onOpenChange={setMovementDialog}
        onAddMovement={handleAddMovement}
        isAdding={isAddingMovement}
      />
    </div>
  );
}
