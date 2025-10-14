import { useState } from 'react';
import { SessionNavBar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TransactionStats } from '@/components/transactions/TransactionStats';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { TransactionList } from '@/components/transactions/TransactionList';
import { TransactionDialog } from '@/components/transactions/TransactionDialog';
import { DeleteConfirmDialog } from '@/components/transactions/DeleteConfirmDialog';
import { useTransactions, FilterState, Transaction } from '@/hooks/use-transactions';
import { useTransactionStats } from '@/hooks/use-transaction-stats';
import { TransactionFormData } from '@/lib/validations/transaction';

export default function Transactions() {
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
    <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="flex-1 overflow-y-auto p-8 ml-12 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold mb-2">Receitas e Despesas</h1>
              <p className="text-muted-foreground">
                Registre e acompanhe todas as transações do seu MEI
              </p>
            </div>
            <Button onClick={handleNewTransaction}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Transação
            </Button>
          </div>

          {/* Stats Cards */}
          <TransactionStats
            totalIncome={stats.totalIncome}
            totalExpense={stats.totalExpense}
            balance={stats.balance}
            incomeTrend={stats.incomeTrend}
            expenseTrend={stats.expenseTrend}
            balanceTrend={stats.balanceTrend}
          />

          {/* Filters */}
          <TransactionFilters filters={filters} onFilterChange={setFilters} />

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
      </main>
    </div>
  );
}
