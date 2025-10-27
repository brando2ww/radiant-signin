import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const SeedDemoButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSeedDemo = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Criando cardápio demo...");

    try {
      const { data, error } = await supabase.functions.invoke("seed-demo-menu", {
        body: {},
      });

      if (error) throw error;

      if (data.success) {
        toast.success(
          `Cardápio criado com sucesso! ${data.data.categories} categorias, ${data.data.products} produtos, ${data.data.options} opções`,
          { id: toastId }
        );

        // Invalidar queries para recarregar os dados
        queryClient.invalidateQueries({ queryKey: ["delivery-categories"] });
        queryClient.invalidateQueries({ queryKey: ["delivery-products"] });
      } else {
        throw new Error(data.error || "Erro desconhecido");
      }
    } catch (error: any) {
      console.error("Erro ao criar cardápio demo:", error);
      toast.error(`Erro ao criar cardápio: ${error.message}`, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Carregar Cardápio Demo
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Carregar Cardápio Demonstrativo?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Isso criará automaticamente um cardápio completo com:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>5 categorias (Pizzas, Hambúrgueres, Massas, Bebidas, Sobremesas)</li>
              <li>18 produtos variados com imagens</li>
              <li>Opções configuradas (tamanhos, adicionais, complementos)</li>
              <li>Preços e promoções de exemplo</li>
            </ul>
            <p className="text-sm mt-4">
              Você poderá editar ou excluir qualquer item depois.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleSeedDemo} disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Cardápio"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
