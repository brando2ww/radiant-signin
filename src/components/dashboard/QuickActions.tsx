import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QuickActions = () => {
  const actions = [
    {
      label: 'Nova Receita',
      icon: <TrendingUp className="h-5 w-5" />,
      href: '/transactions',
      variant: 'default' as const,
    },
    {
      label: 'Nova Despesa',
      icon: <TrendingDown className="h-5 w-5" />,
      href: '/transactions',
      variant: 'secondary' as const,
    },
    {
      label: 'Relatórios',
      icon: <BarChart3 className="h-5 w-5" />,
      href: '/reports',
      variant: 'outline' as const,
    },
  ];

  return (
    <Card className="animate-fade-in" style={{ animationDelay: '400ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              asChild
              className="h-auto py-4 flex-col gap-2 hover:scale-105 transition-transform"
            >
              <Link to={action.href}>
                {action.icon}
                <span className="text-xs">{action.label}</span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
