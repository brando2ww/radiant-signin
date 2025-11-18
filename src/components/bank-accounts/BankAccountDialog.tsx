import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { BankAccount } from "@/hooks/use-bank-accounts";

const bankAccountSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  bank_name: z.string().optional(),
  agency: z.string().optional(),
  account_number: z.string().optional(),
  account_type: z.enum(["checking", "savings", "investment"]),
  initial_balance: z.number(),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface BankAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: BankAccountFormData) => Promise<void>;
  account?: BankAccount;
  isSubmitting?: boolean;
}

const accountTypeLabels = {
  checking: "Conta Corrente",
  savings: "Conta Poupança",
  investment: "Conta Investimento",
};

const colorOptions = [
  { value: "#3b82f6", label: "Azul" },
  { value: "#8b5cf6", label: "Roxo" },
  { value: "#ec4899", label: "Rosa" },
  { value: "#f97316", label: "Laranja" },
  { value: "#22c55e", label: "Verde" },
  { value: "#eab308", label: "Amarelo" },
  { value: "#06b6d4", label: "Ciano" },
  { value: "#ef4444", label: "Vermelho" },
];

export function BankAccountDialog({
  open,
  onOpenChange,
  onSubmit,
  account,
  isSubmitting,
}: BankAccountDialogProps) {
  const form = useForm<BankAccountFormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      name: "",
      bank_name: "",
      agency: "",
      account_number: "",
      account_type: "checking",
      initial_balance: 0,
      color: "#3b82f6",
      icon: "wallet",
    },
  });

  useEffect(() => {
    if (account) {
      form.reset({
        name: account.name,
        bank_name: account.bank_name || "",
        agency: account.agency || "",
        account_number: account.account_number || "",
        account_type: account.account_type,
        initial_balance: account.initial_balance,
        color: account.color || "#3b82f6",
        icon: account.icon || "wallet",
      });
    } else {
      form.reset({
        name: "",
        bank_name: "",
        agency: "",
        account_number: "",
        account_type: "checking",
        initial_balance: 0,
        color: "#3b82f6",
        icon: "wallet",
      });
    }
  }, [account, form, open]);

  const handleSubmit = async (data: BankAccountFormData) => {
    await onSubmit(data);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {account ? "Editar Conta Bancária" : "Nova Conta Bancária"}
          </DialogTitle>
          <DialogDescription>
            {account
              ? "Atualize as informações da sua conta bancária"
              : "Adicione uma nova conta bancária para gerenciar suas finanças"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Conta *</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Conta Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Banco</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Nubank" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Conta *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(accountTypeLabels).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="agency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agência</FormLabel>
                    <FormControl>
                      <Input placeholder="0001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="account_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Conta</FormLabel>
                    <FormControl>
                      <Input placeholder="12345-6" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="initial_balance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Inicial *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded"
                              style={{ backgroundColor: color.value }}
                            />
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                {isSubmitting ? "Salvando..." : account ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
