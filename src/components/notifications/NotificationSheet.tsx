import { Bell, AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/use-notifications';

interface NotificationSheetProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

export function NotificationSheet({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
}: NotificationSheetProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground flex-shrink-0" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2 relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
                </Badge>
              )}
            </SheetTitle>
          </div>
          {notifications.length > 0 && (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar todas
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClearAll}
              >
                Limpar
              </Button>
            </div>
          )}
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-4">
          <div className="space-y-3 pr-4">
            {notifications.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium">Nenhuma notificação</p>
                <p className="text-xs mt-1">Você está em dia com tudo!</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer",
                    notification.read 
                      ? "bg-muted/30 opacity-70" 
                      : "bg-muted/50 hover:bg-muted"
                  )}
                >
                  {getIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      !notification.read && "font-medium"
                    )}>
                      {notification.message}
                    </p>
                    {notification.link && (
                      <Link 
                        to={notification.link} 
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        Ver detalhes →
                      </Link>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
