import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { financialSettingsSchema, type FinancialSettings } from "@/lib/validations/settings";
import { useEffect } from "react";

interface FinancialSettingsProps {
  settings: FinancialSettings;
  onSave: (settings: FinancialSettings) => void;
  saving: boolean;
}

export function FinancialSettingsComponent({ settings, onSave, saving }: FinancialSettingsProps) {
  const form = useForm<FinancialSettings>({
    resolver: zodResolver(financialSettingsSchema),
    defaultValues: settings,
  });

  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Transações</CardTitle>
              <CardDescription>Personalize o comportamento padrão das transações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="default_payment_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento Preferencial</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: credit_card, debit_card, pix" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budget_alert_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alerta de Orçamento ({field.value}%)</FormLabel>
                    <FormDescription>Notificar quando ultrapassar este percentual</FormDescription>
                    <FormControl>
                      <Slider
                        min={50}
                        max={100}
                        step={5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rounding"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Arredondamento de Valores</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="up">Sempre para cima</SelectItem>
                        <SelectItem value="down">Sempre para baixo</SelectItem>
                        <SelectItem value="nearest">Mais próximo</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="monthly_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orçamento Mensal Geral</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        placeholder="0.00"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cartões de Crédito</CardTitle>
              <CardDescription>Configurações padrão para cartões de crédito</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="credit_card_due_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento Padrão</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="credit_card_closing_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Fechamento Padrão</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Resetar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
