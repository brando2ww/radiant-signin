import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { usePDVCashier } from "@/hooks/use-pdv-cashier";
import { OpenCashierDialog } from "@/components/pdv/OpenCashierDialog";
import { CloseCashierDialog } from "@/components/pdv/CloseCashierDialog";
import { CashMovementDialog } from "@/components/pdv/CashMovementDialog";
import { CashMovementsList } from "@/components/pdv/CashMovementsList";
import { Skeleton } from "@/components/ui/skeleton";
import { CashierHeader } from "@/components/pdv/cashier/CashierHeader";
import { CashierActionsSidebar } from "@/components/pdv/cashier/CashierActionsSidebar";
import { CashierSummaryFooter } from "@/components/pdv/cashier/CashierSummaryFooter";

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
  const [movementType, setMovementType] = useState<"sangria" | "reforco">("reforco");

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

  const handleOpenMovementDialog = (type: "sangria" | "reforco") => {
    setMovementType(type);
    setMovementDialog(true);
  };

  // Calcular valores
  const openingBalance = activeSession?.opening_balance || 0;
  const totalCash = activeSession?.total_cash || 0;
  const totalCard = activeSession?.total_card || 0;
  const totalPix = activeSession?.total_pix || 0;
  const totalWithdrawals = activeSession?.total_withdrawals || 0;
  const totalSales = activeSession?.total_sales || 0;
  
  // Calcular reforços a partir dos movimentos
  const totalReinforcements = movements
    .filter((m) => m.type === "reforco")
    .reduce((acc, m) => acc + m.amount, 0);

  const currentBalance = openingBalance + totalCash + totalReinforcements - totalWithdrawals;

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 min-h-[calc(100vh-3.5rem)] flex flex-col gap-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
          <Skeleton className="lg:col-span-3" />
          <Skeleton className="" />
        </div>
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-[calc(100vh-3.5rem)] flex flex-col gap-4">
      {/* Header */}
      <CashierHeader
        isOpen={!!activeSession}
        openedAt={activeSession?.opened_at || null}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Tabela de Movimentações */}
        <Card className="lg:col-span-3 flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Movimentações</CardTitle>
            <CardDescription>
              {activeSession
                ? "Histórico de entradas e saídas do caixa atual"
                : "Abra o caixa para registrar movimentações"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {activeSession ? (
              <div className="h-full overflow-auto">
                <CashMovementsList movements={movements} />
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center space-y-4 text-muted-foreground">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                    <Lock className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="font-medium">Caixa fechado</p>
                    <p className="text-sm">Clique em "Abrir Caixa" para começar</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar de Ações */}
        <Card>
          <CardContent className="p-4 h-full">
            <CashierActionsSidebar
              isOpen={!!activeSession}
              isLoading={isOpeningCashier || isClosingCashier || isAddingMovement}
              onOpenCashier={() => setOpenDialog(true)}
              onCloseCashier={() => setCloseDialog(true)}
              onAddReinforcement={() => handleOpenMovementDialog("reforco")}
              onAddWithdrawal={() => handleOpenMovementDialog("sangria")}
            />
          </CardContent>
        </Card>
      </div>

      {/* Footer com Resumo */}
      <CashierSummaryFooter
        openingBalance={openingBalance}
        totalCash={totalCash}
        totalCard={totalCard}
        totalPix={totalPix}
        totalWithdrawals={totalWithdrawals}
        totalReinforcements={totalReinforcements}
        totalSales={totalSales}
        currentBalance={currentBalance}
        isOpen={!!activeSession}
      />

      {/* Dialogs */}
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
        defaultType={movementType}
      />
    </div>
  );
}
