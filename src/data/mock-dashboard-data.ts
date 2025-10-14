// Dados mockados para desenvolvimento do dashboard

export const mockStats = {
  totalRevenue: 15000,
  totalExpenses: 8500,
  profit: 6500,
  balance: 12300,
  revenueTrend: { percentage: 15, direction: 'up' as const },
  expensesTrend: { percentage: 5, direction: 'down' as const },
  profitTrend: { percentage: 25, direction: 'up' as const },
};

export const mockCashFlowData = [
  { month: 'Mai', receitas: 12000, despesas: 7000, lucro: 5000 },
  { month: 'Jun', receitas: 13500, despesas: 7500, lucro: 6000 },
  { month: 'Jul', receitas: 14000, despesas: 8000, lucro: 6000 },
  { month: 'Ago', receitas: 13000, despesas: 8200, lucro: 4800 },
  { month: 'Set', receitas: 14500, despesas: 8300, lucro: 6200 },
  { month: 'Out', receitas: 15000, despesas: 8500, lucro: 6500 },
];

export const mockUpcomingBills = [
  { 
    id: '1',
    title: 'Energia Elétrica',
    amount: 150,
    dueDate: new Date('2025-10-18'),
    type: 'payable' as const,
    status: 'pending' as const,
    category: 'Operacional'
  },
  { 
    id: '2',
    title: 'Internet',
    amount: 100,
    dueDate: new Date('2025-10-20'),
    type: 'payable' as const,
    status: 'pending' as const,
    category: 'Operacional'
  },
  { 
    id: '3',
    title: 'Fornecedor XYZ',
    amount: 500,
    dueDate: new Date('2025-10-22'),
    type: 'payable' as const,
    status: 'pending' as const,
    category: 'Fornecedores'
  },
  { 
    id: '4',
    title: 'Cliente ABC',
    amount: 1200,
    dueDate: new Date('2025-10-25'),
    type: 'receivable' as const,
    status: 'pending' as const,
    category: 'Vendas'
  },
];

export const mockCreditCards = [
  {
    id: '1',
    name: 'Nubank',
    brand: 'mastercard',
    currentBalance: 1200,
    creditLimit: 5000,
    dueDay: 15,
    color: '#8A05BE',
    lastFourDigits: '1234'
  },
  {
    id: '2',
    name: 'Inter',
    brand: 'visa',
    currentBalance: 850,
    creditLimit: 3000,
    dueDay: 20,
    color: '#FF7A00',
    lastFourDigits: '5678'
  },
];

export const mockMonthlyGoals = {
  revenueGoal: 20000,
  currentRevenue: 15000,
  savingsGoal: 5000,
  currentSavings: 2000,
  investmentGoal: 2000,
  currentInvestment: 1800,
};

export const mockAlerts = [
  {
    id: '1',
    type: 'warning' as const,
    message: 'Fatura do Nubank vence em 3 dias',
    link: '/credit-cards',
    icon: 'credit-card'
  },
  {
    id: '2',
    type: 'info' as const,
    message: 'Limite MEI atingiu 80% (R$ 64.800)',
    link: '/reports',
    icon: 'alert-triangle'
  },
  {
    id: '3',
    type: 'error' as const,
    message: 'DAS de outubro ainda não foi pago',
    link: '/transactions',
    icon: 'alert-circle'
  },
];

export const mockRevenueByCategory = [
  { name: 'Vendas', value: 8000, color: '#22c55e' },
  { name: 'Serviços', value: 5000, color: '#3b82f6' },
  { name: 'Consultorias', value: 2000, color: '#a855f7' },
];

export const mockMEIInfo = {
  dasValue: 70.60,
  dasMonth: 'Outubro',
  dueDate: new Date('2025-10-20'),
  yearlyRevenue: 135000, // Faturamento acumulado no ano
  yearlyLimit: 81000, // Limite anual para MEI em 2025
  limitPercentage: 18.5, // Porcentagem do limite atingido
};
