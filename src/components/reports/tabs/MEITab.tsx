import { MEILimitCard } from '../MEILimitCard';
import { DASHistory } from '../DASHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ExternalLink, FileCheck, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MEITabProps {
  meiData: any;
}

export const MEITab = ({ meiData }: MEITabProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Mock monthly data - in real app, aggregate from transactions
  const monthlyData = [
    { month: 'Jan', revenue: 5000 },
    { month: 'Fev', revenue: 6200 },
    { month: 'Mar', revenue: 5800 },
    { month: 'Abr', revenue: 7100 },
    { month: 'Mai', revenue: 6500 },
    { month: 'Jun', revenue: 6900 },
  ];

  const obligations = [
    { text: 'DAS do mês atual pago', completed: meiData?.dasStatus === 'paid' },
    { text: 'DASN-SIMEI declarado (anual)', completed: false },
    { text: 'Limite anual não ultrapassado', completed: meiData?.percentageUsed < 100 },
    { text: 'Alvarás e licenças atualizados', completed: true },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MEILimitCard
          yearlyRevenue={meiData?.yearlyRevenue || 0}
          yearlyLimit={meiData?.yearlyLimit || 81000}
          percentageUsed={meiData?.percentageUsed || 0}
          projectedYearlyRevenue={meiData?.projectedYearlyRevenue || 0}
        />

        <Card>
          <CardHeader>
            <CardTitle>DAS do Mês</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Valor do DAS</p>
                <p className="text-3xl font-bold">{formatCurrency(meiData?.dasAmount || 0)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-2">Status</p>
                {meiData?.dasStatus === 'paid' ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-semibold">Pago</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-semibold">Pendente</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-semibold">Checklist MEI</h4>
              {obligations.map((obligation, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded hover:bg-muted/50">
                  {obligation.completed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                  )}
                  <span className={obligation.completed ? 'line-through text-muted-foreground' : ''}>
                    {obligation.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" rel="noopener">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Portal do Empreendedor
                </a>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <a href="http://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao" target="_blank" rel="noopener">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Gerar DAS
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faturamento Mensal</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={formatCurrency} />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
              />
              <Legend />
              <Bar dataKey="revenue" name="Faturamento" fill="hsl(142, 71%, 45%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <DASHistory bills={meiData?.dasHistory || []} />
    </div>
  );
};
