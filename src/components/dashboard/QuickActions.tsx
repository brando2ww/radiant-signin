import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, FileText, BarChart3, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions = () => {
  const actions = [
    {
      label: 'Nova Receita',
      description: 'Adicionar entrada',
      icon: <TrendingUp className="h-6 w-6" />,
      href: '/transactions',
      gradient: 'from-emerald-400 to-emerald-600',
      shadowColor: 'shadow-emerald-500/25',
      bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20',
    },
    {
      label: 'Nova Despesa',
      description: 'Registrar saída',
      icon: <TrendingDown className="h-6 w-6" />,
      href: '/transactions',
      gradient: 'from-rose-400 to-rose-600',
      shadowColor: 'shadow-rose-500/25',
      bgHover: 'hover:bg-rose-50 dark:hover:bg-rose-950/20',
    },
    {
      label: 'Nota Fiscal',
      description: 'Importar NF-e',
      icon: <FileText className="h-6 w-6" />,
      href: '/transactions',
      gradient: 'from-blue-400 to-blue-600',
      shadowColor: 'shadow-blue-500/25',
      bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-950/20',
    },
    {
      label: 'Relatórios',
      description: 'Ver análises',
      icon: <BarChart3 className="h-6 w-6" />,
      href: '/reports',
      gradient: 'from-yellow-400 to-yellow-600',
      shadowColor: 'shadow-yellow-500/25',
      bgHover: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/20',
    },
  ];

  return (
    <Card 
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-yellow-50/5 dark:to-yellow-900/5 backdrop-blur-sm"
      style={{ 
        animation: 'fade-slide-in 0.5s ease-out 500ms forwards',
        opacity: 0 
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
            <Zap className="h-4 w-4" />
          </div>
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Link
              key={action.label}
              to={action.href}
              className={`group relative overflow-hidden rounded-xl p-4 border border-border/30 ${action.bgHover} transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
              style={{ 
                animationDelay: `${600 + index * 50}ms`
              }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${action.gradient} text-white shadow-lg ${action.shadowColor} mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {action.icon}
              </div>
              <p className="font-semibold text-sm text-foreground">{action.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
              
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-xl`} />
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
