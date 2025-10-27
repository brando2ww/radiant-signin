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
import { DeliveryCategory, useDeleteCategory } from "@/hooks/use-delivery-categories";

interface DeleteCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: DeliveryCategory;
}

export const DeleteCategoryDialog = ({
  open,
  onOpenChange,
  category,
}: DeleteCategoryDialogProps) => {
  const deleteCategory = useDeleteCategory();

  const handleDelete = () => {
    if (category) {
      deleteCategory.mutate(category.id, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Categoria</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a categoria "{category?.name}"? 
            Todos os produtos desta categoria também serão excluídos. 
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
