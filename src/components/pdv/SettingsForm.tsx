import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const settingsSchema = z.object({
  service_fee_percentage: z.number().min(0).max(100),
  enable_service_fee: z.boolean(),
  auto_print_to_kitchen: z.boolean(),
  require_customer_identification: z.boolean(),
  requires_opening_balance: z.boolean(),
  allow_negative_balance: z.boolean(),
  integrate_with_delivery: z.boolean(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  defaultValues?: Partial<SettingsFormValues>;
  onSubmit: (values: SettingsFormValues) => void;
  isSubmitting: boolean;
}

export function SettingsForm({ defaultValues, onSubmit, isSubmitting }: SettingsFormProps) {
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      service_fee_percentage: 10,
      enable_service_fee: false,
      auto_print_to_kitchen: false,
      require_customer_identification: false,
      requires_opening_balance: true,
      allow_negative_balance: false,
      integrate_with_delivery: false,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Taxa de Serviço</CardTitle>
            <CardDescription>
              Configure a taxa de serviço dos pedidos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="enable_service_fee"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Habilitar Taxa de Serviço</FormLabel>
                    <FormDescription>
                      Aplicar taxa de serviço automaticamente
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("enable_service_fee") && (
              <FormField
                control={form.control}
                name="service_fee_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percentual da Taxa (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>
                      Percentual aplicado no total do pedido
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Operações</CardTitle>
            <CardDescription>
              Configurações de operação do PDV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormField
              control={form.control}
              name="auto_print_to_kitchen"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Impressão Automática na Cozinha</FormLabel>
                    <FormDescription>
                      Imprimir pedidos automaticamente na cozinha
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="require_customer_identification"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Identificação do Cliente</FormLabel>
                    <FormDescription>
                      Exigir nome do cliente ao criar pedidos
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caixa</CardTitle>
            <CardDescription>
              Configurações de gerenciamento de caixa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <FormField
              control={form.control}
              name="requires_opening_balance"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Exigir Saldo de Abertura</FormLabel>
                    <FormDescription>
                      Solicitar saldo inicial ao abrir o caixa
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="allow_negative_balance"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Permitir Saldo Negativo</FormLabel>
                    <FormDescription>
                      Permitir que o caixa fique com saldo negativo
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Integrações</CardTitle>
            <CardDescription>
              Configure integrações com outros módulos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="integrate_with_delivery"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Integrar com Delivery</FormLabel>
                    <FormDescription>
                      Sincronizar pedidos do delivery com o PDV
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
