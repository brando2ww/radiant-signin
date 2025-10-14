import { CreditCard } from 'lucide-react';

export const cardBrands = [
  { value: 'visa', label: 'Visa', icon: CreditCard },
  { value: 'mastercard', label: 'Mastercard', icon: CreditCard },
  { value: 'elo', label: 'Elo', icon: CreditCard },
  { value: 'amex', label: 'American Express', icon: CreditCard },
  { value: 'hipercard', label: 'Hipercard', icon: CreditCard },
  { value: 'other', label: 'Outro', icon: CreditCard },
];

export const getBrandLabel = (brand: string) => {
  return cardBrands.find(b => b.value === brand)?.label || brand;
};
