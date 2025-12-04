import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, Info, Bell, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  link?: string;
  icon?: string;
}

interface AlertsWidgetProps {
  alerts: Alert[];
}

export const AlertsWidget = ({ alerts: initialAlerts }: AlertsWidgetProps) => {
  const [alerts, setAlerts] = useState(initialAlerts);

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'error':
        return {
          icon: <AlertCircle className="h-5 w-5" />,
          borderColor: 'border-l-destructive',
          bgColor: 'bg-destructive/5',
          iconBg: 'bg-destructive/10',
          iconColor: 'text-destructive',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="h-5 w-5" />,
          borderColor: 'border-l-yellow-500',
          bgColor: 'bg-yellow-500/5',
          iconBg: 'bg-yellow-500/10',
          iconColor: 'text-yellow-600',
        };
      case 'info':
        return {
          icon: <Info className="h-5 w-5" />,
          borderColor: 'border-l-blue-500',
          bgColor: 'bg-blue-500/5',
          iconBg: 'bg-blue-500/10',
          iconColor: 'text-blue-600',
        };
      default:
        return {
          icon: <Info className="h-5 w-5" />,
          borderColor: 'border-l-muted',
          bgColor: 'bg-muted/5',
          iconBg: 'bg-muted/10',
          iconColor: 'text-muted-foreground',
        };
    }
  };

  return (
    <Card 
      className="overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-yellow-50/5 dark:to-yellow-900/5 backdrop-blur-sm"
      style={{ 
        animation: 'fade-slide-in 0.5s ease-out 800ms forwards',
        opacity: 0 
      }}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 text-white relative">
            <Bell className="h-4 w-4" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </div>
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-muted/30 flex items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Você está em dia!</p>
            </div>
          ) : (
            alerts.map((alert, index) => {
              const styles = getStyles(alert.type);
              return (
                <div
                  key={alert.id}
                  className={`relative flex items-start gap-3 p-3 rounded-xl ${styles.bgColor} border-l-4 ${styles.borderColor} group transition-all duration-300 hover:scale-[1.01]`}
                  style={{ 
                    animation: `slide-in-right 0.3s ease-out ${index * 50}ms forwards`,
                    opacity: 0,
                    transform: 'translateX(-10px)'
                  }}
                >
                  <div className={`p-2 rounded-lg ${styles.iconBg} ${styles.iconColor}`}>
                    {styles.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-2">{alert.message}</p>
                    {alert.link && (
                      <Link to={alert.link} className="text-xs text-primary hover:underline mt-1 inline-block">
                        Ver detalhes →
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-1 rounded-full hover:bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
