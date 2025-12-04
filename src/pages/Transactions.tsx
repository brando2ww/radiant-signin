import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, History } from 'lucide-react';
import { ResponsivePageHeader } from '@/components/ui/responsive-page-header';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { DeleteConfirmDialog } from '@/components/transactions/DeleteConfirmDialog';
import { useTransactions, FilterState, Transaction } from '@/hooks/use-transactions';
import { useTransactionStats } from '@/hooks/use-transaction-stats';
import { TransactionFormData } from '@/lib/validations/transaction';
import { AppLayout } from '@/components/layouts/AppLayout';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Transactions() {
  const isMobile = useIsMobile();
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'all',
    category: 'all',
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const {
    transactions,
    isLoading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isCreating,
    isUpdating,
  } = useTransactions(filters);

  const stats = useTransactionStats(transactions);

  const handleCreateOrUpdate = (data: TransactionFormData) => {
    if (selectedTransaction) {
      updateTransaction({ id: selectedTransaction.id, data });
    } else {
      createTransaction(data);
    }
    setDialogOpen(false);
    setSelectedTransaction(null);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDialogOpen(true);
  };

  const handleDeleteClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTransaction) {
      deleteTransaction(selectedTransaction.id);
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleNewTransaction = () => {
    setSelectedTransaction(null);
    setDialogOpen(true);
  };

  return (
    <AppLayout className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header */}
        {isMobile ? (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-primary" />
                <h1 className="text-xl font-bold">Transações</h1>
              </div>
              <Button onClick={handleNewTransaction} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Gerencie suas receitas e despesas
            </p>
          </div>
        ) : (
          <ResponsivePageHeader
            title="Receitas e Despesas"
            description="Registre e acompanhe todas as transações do seu MEI"
            action={
              <Button onClick={handleNewTransaction} className="w-full md:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Nova Transação
              </Button>
            }
          />
        )}

        {/* Stats Cards */}
        <TransactionStats
          totalIncome={stats.totalIncome}
          totalExpense={stats.totalExpense}
          balance={stats.balance}
        />

        {/* Filters */}
        <TransactionFilters 
          filters={filters} 
          onFilterChange={setFilters}
          transactionCount={transactions.length}
        />

        {/* Transaction List */}
        <TransactionList
          transactions={transactions}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />

        {/* Create/Edit Dialog */}
        <TransactionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={handleCreateOrUpdate}
          transaction={selectedTransaction}
          isSubmitting={isCreating || isUpdating}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleDeleteConfirm}
          transaction={selectedTransaction}
        />
      </div>
    </AppLayout>
  );
}
