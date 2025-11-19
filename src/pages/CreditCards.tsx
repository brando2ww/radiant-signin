import { useState } from 'react';
import { SessionNavBar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ResponsivePageHeader } from '@/components/ui/responsive-page-header';
import { useCreditCards, CreditCard } from '@/hooks/use-credit-cards';
import { useCreditCardStats } from '@/hooks/use-credit-card-stats';
import { CreditCardStats } from '@/components/credit-cards/CreditCardStats';
import { CreditCardItem } from '@/components/credit-cards/CreditCardItem';
import { CreditCardDialog } from '@/components/credit-cards/CreditCardDialog';
import { DeleteCardDialog } from '@/components/credit-cards/DeleteCardDialog';
import { CreditCardDetailsDialog } from '@/components/credit-cards/CreditCardDetailsDialog';
import { CreditCardFormData } from '@/lib/validations/credit-card';
import { Skeleton } from '@/components/ui/skeleton';

export default function CreditCards() {
  const { cards, isLoading, createCard, updateCard, deleteCard, isCreating, isUpdating } = useCreditCards();
  const stats = useCreditCardStats(cards);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);

  const handleCreate = (data: CreditCardFormData) => {
    createCard(data);
    setDialogOpen(false);
  };

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setDialogOpen(true);
  };

  const handleUpdate = (data: CreditCardFormData) => {
    if (editingCard) {
      updateCard({ id: editingCard.id, data });
      setDialogOpen(false);
      setEditingCard(null);
    }
  };

  const handleDelete = (card: CreditCard) => {
    setSelectedCard(card);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedCard) {
      deleteCard(selectedCard.id);
      setDeleteDialogOpen(false);
      setSelectedCard(null);
    }
  };

  const handleViewDetails = (card: CreditCard) => {
    setSelectedCard(card);
    setDetailsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingCard(null);
  };

  return (
    <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 ml-0 md:ml-12">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Header */}
          <ResponsivePageHeader
            title="Cartões de Crédito"
            description="Gerencie seus cartões de crédito e acompanhe faturas"
            action={
              <Button onClick={() => setDialogOpen(true)} className="w-full md:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Novo Cartão
              </Button>
            }
          />

          {/* Stats */}
          {isLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          ) : (
            <CreditCardStats
              totalCards={stats.totalCards}
              totalInvoices={stats.totalInvoices}
              alerts={stats.alerts}
            />
          )}

          {/* Cards Grid */}
          <div>
            <h2 className="text-lg md:text-xl font-semibold mb-4">Meus Cartões</h2>
            
            {isLoading ? (
              <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
                <Skeleton className="h-96" />
              </div>
            ) : cards.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">
                  Você ainda não tem cartões cadastrados
                </p>
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Cartão
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                  <CreditCardItem
                    key={card.id}
                    card={card}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <CreditCardDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={editingCard ? handleUpdate : handleCreate}
        card={editingCard}
        isLoading={isCreating || isUpdating}
      />

      <DeleteCardDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        card={selectedCard}
      />

      <CreditCardDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        card={selectedCard}
      />
    </div>
  );
}
