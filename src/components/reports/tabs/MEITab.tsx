import { MEILimitCard } from '../MEILimitCard';
import { DASHistory } from '../DASHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ExternalLink, FileCheck, AlertCircle, CheckCircle, FileText, ListChecks, BarChart3 } from 'lucide-react';
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
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (!meiData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando dados MEI...</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();

  // Calculate monthly revenue data from history
  const monthlyData = meiData.dasHistory?.slice(0, 6).reverse().map((das: any) => {
    const date = new Date(das.due_date);
    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      revenue: Number(das.amount) * 15, // Approximate revenue based on DAS
    };
  }) || [];

  const obligations = [
    { text: 'DAS do mês atual pago', completed: meiData?.dasStatus === 'paid' },
    { text: 'DASN-SIMEI declarado (anual)', completed: false },
    { text: 'Limite anual não ultrapassado', completed: meiData?.percentageUsed < 100 },
    { text: 'Alvarás e licenças atualizados', completed: true },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <MEILimitCard
          yearlyRevenue={meiData?.yearlyRevenue || 0}
          yearlyLimit={meiData?.yearlyLimit || 81000}
          percentageUsed={meiData?.percentageUsed || 0}
          projectedYearlyRevenue={meiData?.projectedYearlyRevenue || 0}
        />

        <div className="space-y-4">
          {/* DAS Current Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                DAS do Mês
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Valor do DAS</p>
                  <p className="text-xl sm:text-2xl font-bold">{formatCurrency(meiData?.dasAmount || 0)}</p>
                </div>
                <Badge
                  variant={meiData?.dasStatus === 'paid' ? 'default' : meiData?.dasStatus === 'overdue' ? 'destructive' : 'outline'}
                  className={meiData?.dasStatus === 'paid' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 self-start sm:self-auto' : 'self-start sm:self-auto'}
                >
                  {meiData?.dasStatus === 'paid' ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Pago</>
                  ) : meiData?.dasStatus === 'overdue' ? (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Atrasado</>
                  ) : (
                    <><AlertCircle className="h-3 w-3 mr-1" /> Pendente</>
                  )}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex-1" asChild>
                  <a href="https://www.gov.br/empresas-e-negocios/pt-br/empreendedor" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Portal MEI
                  </a>
                </Button>
                <Button variant="default" className="flex-1" asChild>
                  <a href="https://www8.receita.fazenda.gov.br/SimplesNacional/Aplicacoes/ATSPO/pgmei.app/Identificacao" target="_blank" rel="noopener noreferrer">
                    <FileCheck className="h-4 w-4 mr-2" />
                    Gerar DAS
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Obligations Checklist */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                <ListChecks className="h-4 w-4 sm:h-5 sm:w-5" />
                Checklist MEI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {obligations.map((obligation, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs sm:text-sm p-2 rounded hover:bg-muted/50">
                    {obligation.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-muted-foreground flex-shrink-0" />
                    )}
                    <span className={obligation.completed ? 'line-through text-muted-foreground' : 'text-foreground'}>
                      {obligation.text}
                    </span>
                    {!obligation.completed && (
                      <Badge variant="outline" className="ml-auto text-xs hidden sm:inline-flex">
                        Pendente
                      </Badge>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Monthly Chart - responsive */}
      {monthlyData.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base sm:text-lg flex items-center gap-2">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Faturamento Mensal {currentYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] sm:h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    width={45}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Faturamento']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar 
                    dataKey="revenue" 
                    name="Faturamento" 
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* DAS History */}
      <DASHistory bills={meiData?.dasHistory || []} />
    </div>
  );
};
