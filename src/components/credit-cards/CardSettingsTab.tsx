import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard } from '@/hooks/use-credit-cards';
import { CreditCardFormData, creditCardSchema } from '@/lib/validations/credit-card';
import { cardBrands } from '@/data/card-brands';
import { cardColors } from '@/data/card-colors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { CurrencyInput } from '@/components/ui/currency-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Save, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CardSettingsTabProps {
  card: CreditCard;
  onUpdate: (id: string, data: CreditCardFormData) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  isUpdating?: boolean;
  onClose?: () => void;
}

export function CardSettingsTab({
  card,
  onUpdate,
  onDelete,
  onToggleActive,
  isUpdating = false,
  onClose,
}: CardSettingsTabProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const form = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: card.name,
      brand: (card.brand as CreditCardFormData['brand']) || 'other',
      last_four_digits: card.last_four_digits || '',
      credit_limit: card.credit_limit || 0,
      due_day: card.due_day || 1,
      closing_day: card.closing_day || 1,
      color: card.color || cardColors[0].value,
    },
  });

  const onSubmit = (data: CreditCardFormData) => {
    onUpdate(card.id, data);
  };

  const handleDelete = () => {
    onDelete(card.id);
    setDeleteDialogOpen(false);
    onClose?.();
  };

  const handleToggleActive = (checked: boolean) => {
    onToggleActive(card.id, checked);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Card Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Informações do Cartão
            </h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cartão</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Nubank Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bandeira</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cardBrands.map((brand) => (
                          <SelectItem key={brand.value} value={brand.value}>
                            {brand.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_four_digits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Últimos 4 dígitos</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0000"
                        maxLength={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Financial Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Configurações Financeiras
            </h3>

            <FormField
              control={form.control}
              name="credit_limit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Limite de Crédito</FormLabel>
                  <FormControl>
                    <CurrencyInput
                      value={field.value}
                      onChange={(value) => field.onChange(parseFloat(value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="closing_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Fechamento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="due_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dia de Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={31}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Color Customization */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Personalização
            </h3>

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor do Cartão</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {cardColors.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => field.onChange(color.value)}
                          className={cn(
                            'w-8 h-8 rounded-full border-2 transition-all',
                            field.value === color.value
                              ? 'border-foreground scale-110'
                              : 'border-transparent hover:scale-105'
                          )}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator />

          {/* Status Toggle */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Status
            </h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="card-active">Cartão Ativo</Label>
                <p className="text-sm text-muted-foreground">
                  Cartões inativos não aparecem nas estatísticas
                </p>
              </div>
              <Switch
                id="card-active"
                checked={card.is_active ?? true}
                onCheckedChange={handleToggleActive}
              />
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-3">
            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="destructive"
              className="w-full"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Cartão
            </Button>
          </div>
        </form>
      </Form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir cartão?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cartão "{card.name}"? Esta ação não
              pode ser desfeita e todas as transações associadas serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
