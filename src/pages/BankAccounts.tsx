import { useState } from "react";
import { Plus, ArrowLeftRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBankAccounts } from "@/hooks/use-bank-accounts";
import { BankAccountDialog } from "@/components/bank-accounts/BankAccountDialog";
import { BankAccountCard } from "@/components/bank-accounts/BankAccountCard";
import { TransferDialog } from "@/components/bank-accounts/TransferDialog";
import type { BankAccount } from "@/hooks/use-bank-accounts";
import { AppLayout } from "@/components/layouts/AppLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BankAccounts() {
  const {
    bankAccounts,
    totalBalance,
    isLoading,
    createBankAccount,
    updateBankAccount,
    deleteBankAccount,
    transferBetweenAccounts,
    isCreating,
    isUpdating,
    isDeleting,
    isTransferring,
  } = useBankAccounts();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [transferDialogOpen, setTransferDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  const handleCreateOrUpdate = async (data: any) => {
    if (selectedAccount) {
      await updateBankAccount({ id: selectedAccount.id, ...data });
    } else {
      await createBankAccount(data);
    }
    setDialogOpen(false);
    setSelectedAccount(undefined);
  };

  const handleEdit = (account: BankAccount) => {
    setSelectedAccount(account);
    setDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (accountToDelete) {
      await deleteBankAccount(accountToDelete);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleNewAccount = () => {
    setSelectedAccount(undefined);
    setDialogOpen(true);
  };

  const handleTransfer = async (data: any) => {
    await transferBetweenAccounts(data);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <AppLayout className="py-4 md:py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6 md:mb-8">
          {/* Header - Mobile Responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Contas Bancárias</h1>
              <p className="text-muted-foreground text-sm md:text-base mt-1">
                Gerencie suas contas e acompanhe seus saldos
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => setTransferDialogOpen(true)} 
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Transferir</span>
                <span className="xs:hidden">Transfer.</span>
              </Button>
              <Button 
                onClick={handleNewAccount}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Plus className="mr-2 h-4 w-4" />
                <span className="hidden xs:inline">Nova Conta</span>
                <span className="xs:hidden">Nova</span>
              </Button>
            </div>
          </div>

          {/* Total Balance Card - Mobile Responsive */}
          <div className="bg-gradient-to-br from-primary to-primary/80 rounded-xl md:rounded-2xl p-4 md:p-8 text-white mb-6 md:mb-8">
            <div className="flex items-center gap-2 md:gap-3 mb-2">
              <Wallet className="h-5 w-5 md:h-6 md:w-6" />
              <p className="text-xs md:text-sm opacity-90">Saldo Total</p>
            </div>
            <p className="text-2xl md:text-4xl font-bold">{formatCurrency(totalBalance)}</p>
            <p className="text-xs md:text-sm opacity-75 mt-1 md:mt-2">
              em {bankAccounts.length} {bankAccounts.length === 1 ? "conta" : "contas"}
            </p>
          </div>

          {/* Accounts Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-48 md:h-64 bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : bankAccounts.length === 0 ? (
            <div className="text-center py-12 md:py-16">
              <Wallet className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold mb-2">
                Nenhuma conta cadastrada
              </h3>
              <p className="text-muted-foreground text-sm md:text-base mb-6">
                Comece adicionando sua primeira conta bancária
              </p>
              <Button onClick={handleNewAccount}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Primeira Conta
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {bankAccounts.map((account) => (
                <BankAccountCard
                  key={account.id}
                  account={account}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BankAccountDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleCreateOrUpdate}
        account={selectedAccount}
        isSubmitting={isCreating || isUpdating}
      />

      <TransferDialog
        open={transferDialogOpen}
        onOpenChange={setTransferDialogOpen}
        onSubmit={handleTransfer}
        isSubmitting={isTransferring}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar Conta</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar esta conta? Esta ação pode ser revertida
              posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
