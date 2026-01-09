import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertTriangle } from 'lucide-react';
interface MEIWidgetProps {
  dasValue: number;
  dasMonth: string;
  dueDate: Date;
  yearlyRevenue: number;
  yearlyLimit: number;
}
export const MEIWidget = ({
  dasValue,
  dasMonth,
  dueDate,
  yearlyRevenue,
  yearlyLimit
}: MEIWidgetProps) => {
  const limitPercentage = yearlyRevenue / yearlyLimit * 100;
  const isNearLimit = limitPercentage >= 80;
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  return;
};