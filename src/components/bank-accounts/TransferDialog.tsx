import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BankAccountSelector } from "./BankAccountSelector";
import { ArrowRight } from "lucide-react";

const transferSchema = z.object({
  fromAccountId: z.string().min(1, "Selecione a conta de origem"),
  toAccountId: z.string().min(1, "Selecione a conta de destino"),
  amount: z.number().positive("O valor deve ser maior que zero"),
  description: z.string().optional(),
}).refine((data) => data.fromAccountId !== data.toAccountId, {
  message: "As contas de origem e destino devem ser diferentes",
  path: ["toAccountId"],
});

type TransferFormData = z.infer<typeof transferSchema>;

interface TransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TransferFormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function TransferDialog({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
}: TransferDialogProps) {
  const form = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      fromAccountId: "",
      toAccountId: "",
      amount: 0,
      description: "",
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      form.reset({
        fromAccountId: "",
        toAccountId: "",
        amount: 0,
        description: "",
      });
    }
  }, [open, form]);

  const handleSubmit = async (data: TransferFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error("Erro na transferência:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Transferência entre Contas</DialogTitle>
          <DialogDescription>
            Transfira valores entre suas contas bancárias
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fromAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>De (Origem) *</FormLabel>
                  <FormControl>
                    <BankAccountSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione a conta de origem"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-center">
              <div className="p-2 rounded-full bg-primary/10">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
            </div>

            <FormField
              control={form.control}
              name="toAccountId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Para (Destino) *</FormLabel>
                  <FormControl>
                    <BankAccountSelector
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Selecione a conta de destino"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor *</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value || ''}
                      onChange={(v) => {
                        const parsed = v ? parseFloat(v) : 0;
                        field.onChange(isNaN(parsed) ? 0 : parsed);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Transferência para investimento"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Transferindo..." : "Transferir"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
