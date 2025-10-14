import {
  ShoppingBag,
  Wrench,
  DollarSign,
  Gift,
  Store,
  FileText,
  Lightbulb,
  Smartphone,
  Truck,
  Building2,
  Users,
  Settings,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react';

export const incomeCategories = [
  { value: 'vendas', label: 'Vendas de Produtos', icon: ShoppingBag },
  { value: 'servicos', label: 'Prestação de Serviços', icon: Wrench },
  { value: 'outros_recebimentos', label: 'Outros Recebimentos', icon: DollarSign },
  { value: 'bonificacoes', label: 'Bonificações', icon: Gift },
];

export const expenseCategories = [
  { value: 'fornecedores', label: 'Fornecedores', icon: Store },
  { value: 'tributarias', label: 'Tributárias (DAS, Impostos)', icon: FileText },
  { value: 'contas', label: 'Contas (Luz, Água, Internet)', icon: Lightbulb },
  { value: 'marketing', label: 'Marketing e Publicidade', icon: Smartphone },
  { value: 'transporte', label: 'Transporte e Logística', icon: Truck },
  { value: 'aluguel', label: 'Aluguel', icon: Building2 },
  { value: 'servicos_terceiros', label: 'Serviços Terceiros', icon: Users },
  { value: 'manutencao', label: 'Manutenção', icon: Settings },
  { value: 'taxas_bancarias', label: 'Taxas Bancárias', icon: CreditCard },
  { value: 'outros', label: 'Outros', icon: MoreHorizontal },
];

export const paymentMethods = [
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'debito', label: 'Cartão de Débito' },
  { value: 'credito', label: 'Cartão de Crédito' },
  { value: 'transferencia', label: 'Transferência Bancária' },
];

export const getCategoryIcon = (category: string, type: 'income' | 'expense') => {
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  return categories.find(c => c.value === category)?.icon || MoreHorizontal;
};

export const getCategoryLabel = (category: string, type: 'income' | 'expense') => {
  const categories = type === 'income' ? incomeCategories : expenseCategories;
  return categories.find(c => c.value === category)?.label || category;
};
