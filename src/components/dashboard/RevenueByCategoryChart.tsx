import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import CountUp from 'react-countup';

interface RevenueCategory {
  name: string;
  value: number;
  color: string;
}

interface RevenueByCategoryChartProps {
  data: RevenueCategory[];
}

// Modern yellow/amber color palette
const MODERN_COLORS = [
  'hsl(43 96% 56%)',   // yellow-400
  'hsl(38 92% 50%)',   // yellow-500
  'hsl(32 95% 44%)',   // yellow-600
  'hsl(48 97% 77%)',   // yellow-200
  'hsl(46 97% 65%)',   // yellow-300
  'hsl(25 95% 53%)',   // orange
  'hsl(142 76% 36%)',  // green
  'hsl(217 91% 60%)',  // blue
];

export const RevenueByCategoryChart = ({ data }: RevenueByCategoryChartProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0
    }).format(value);
  };

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Assign modern colors to data
  const coloredData = data.map((item, index) => ({
    ...item,
    color: MODERN_COLORS[index % MODERN_COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-xl p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="font-semibold text-sm">{item.name}</span>
          </div>
          <p className="text-lg font-bold">{formatCurrency(item.value)}</p>
          <p className="text-xs text-muted-foreground">{percentage}% do total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card 
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-yellow-50/5 dark:to-yellow-900/5 backdrop-blur-sm"
      style={{ 
        animation: 'fade-slide-in 0.5s ease-out 1000ms forwards',
        opacity: 0 
      }}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
            <PieIcon className="h-4 w-4" />
          </div>
          Receitas por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* Donut Chart with center value */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coloredData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {coloredData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      strokeWidth={0}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-muted-foreground">Total</span>
              <span className="text-xl font-bold text-foreground">
                <CountUp end={total / 1000} decimals={1} duration={1.5} suffix="k" prefix="R$ " />
              </span>
            </div>
          </div>

          {/* Legend with mini bars */}
          <div className="flex-1 w-full space-y-2">
            {coloredData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              return (
                <div 
                  key={item.name}
                  className="flex items-center gap-3 group"
                  style={{ 
                    animation: `fade-slide-in 0.3s ease-out ${1100 + index * 50}ms forwards`,
                    opacity: 0
                  }}
                >
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium truncate">{item.name}</span>
                      <span className="text-sm font-semibold">{formatCurrency(item.value)}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 group-hover:opacity-80"
                        style={{ 
                          width: `${percentage}%`, 
                          backgroundColor: item.color 
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
