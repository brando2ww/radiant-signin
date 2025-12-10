import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';
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
import { useNavigate } from 'react-router-dom';

export default function Transactions() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
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
    <AppLayout className="p-0 md:p-6 lg:p-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        {/* Mobile Header - Clean & Modern */}
        {isMobile ? (
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 px-4 py-3">
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)}
                className="h-9 w-9 rounded-full"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-lg font-semibold">Transações</h1>
              <Button 
                onClick={handleNewTransaction} 
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </div>
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

        <div className={isMobile ? "px-4 py-4 space-y-4" : "space-y-6"}>
          {/* Stats Cards - Hidden on mobile for cleaner look, or show compact version */}
          {!isMobile && (
            <TransactionStats
              totalIncome={stats.totalIncome}
              totalExpense={stats.totalExpense}
              balance={stats.balance}
            />
          )}

          {/* Mobile Stats Summary */}
          {isMobile && (
            <div className="flex items-center justify-between bg-card rounded-2xl p-4 shadow-sm">
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">Receitas</p>
                <p className="text-sm font-semibold text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalIncome)}
                </p>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">Despesas</p>
                <p className="text-sm font-semibold text-red-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalExpense)}
                </p>
              </div>
              <div className="w-px h-10 bg-border/50" />
              <div className="text-center flex-1">
                <p className="text-xs text-muted-foreground mb-1">Balanço</p>
                <p className={`text-sm font-semibold ${stats.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.balance)}
                </p>
              </div>
            </div>
          )}

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
        </div>

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
