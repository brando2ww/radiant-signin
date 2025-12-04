import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CurrencyInput } from '@/components/ui/currency-input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { creditCardSchema, CreditCardFormData } from '@/lib/validations/credit-card';
import { cardBrands } from '@/data/card-brands';
import { cardColors } from '@/data/card-colors';
import { CreditCard } from '@/hooks/use-credit-cards';
import { useEffect } from 'react';

interface CreditCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreditCardFormData) => void;
  card?: CreditCard | null;
  isLoading?: boolean;
}

export function CreditCardDialog({ 
  open, 
  onOpenChange, 
  onSubmit, 
  card,
  isLoading 
}: CreditCardDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreditCardFormData>({
    resolver: zodResolver(creditCardSchema),
    defaultValues: {
      name: '',
      brand: 'visa',
      last_four_digits: '',
      credit_limit: 0,
      due_day: 10,
      closing_day: 5,
      color: cardColors[0].gradient,
    },
  });

  const selectedColor = watch('color');

  useEffect(() => {
    if (card) {
      reset({
        name: card.name,
        brand: (card.brand as any) || 'visa',
        last_four_digits: card.last_four_digits || '',
        credit_limit: card.credit_limit || 0,
        due_day: card.due_day || 10,
        closing_day: card.closing_day || 5,
        color: card.color || cardColors[0].gradient,
      });
    } else {
      reset({
        name: '',
        brand: 'visa',
        last_four_digits: '',
        credit_limit: 0,
        due_day: 10,
        closing_day: 5,
        color: cardColors[0].gradient,
      });
    }
  }, [card, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {card ? 'Editar Cartão de Crédito' : 'Adicionar Cartão de Crédito'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Cartão</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ex: Nubank, Inter, C6"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Bandeira</Label>
            <Select
              value={watch('brand')}
              onValueChange={(value) => setValue('brand', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cardBrands.map((brand) => (
                  <SelectItem key={brand.value} value={brand.value}>
                    {brand.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brand && (
              <p className="text-sm text-destructive">{errors.brand.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_four_digits">Últimos 4 Dígitos (Opcional)</Label>
            <Input
              id="last_four_digits"
              {...register('last_four_digits')}
              placeholder="1234"
              maxLength={4}
            />
            {errors.last_four_digits && (
              <p className="text-sm text-destructive">{errors.last_four_digits.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="credit_limit">Limite de Crédito</Label>
            <CurrencyInput
              value={watch('credit_limit') || ''}
              onChange={(v) => setValue('credit_limit', v ? parseFloat(v) : 0)}
            />
            {errors.credit_limit && (
              <p className="text-sm text-destructive">{errors.credit_limit.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="closing_day">Dia de Fechamento</Label>
              <Input
                id="closing_day"
                type="number"
                min="1"
                max="31"
                {...register('closing_day', { valueAsNumber: true })}
              />
              {errors.closing_day && (
                <p className="text-sm text-destructive">{errors.closing_day.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_day">Dia de Vencimento</Label>
              <Input
                id="due_day"
                type="number"
                min="1"
                max="31"
                {...register('due_day', { valueAsNumber: true })}
              />
              {errors.due_day && (
                <p className="text-sm text-destructive">{errors.due_day.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor do Cartão</Label>
            <div className="flex gap-2 flex-wrap">
              {cardColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setValue('color', color.gradient)}
                  className={`h-10 w-10 rounded-lg bg-gradient-to-br ${color.gradient} transition-transform ${
                    selectedColor === color.gradient ? 'ring-2 ring-primary scale-110' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? 'Salvando...' : card ? 'Salvar Alterações' : 'Adicionar Cartão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
