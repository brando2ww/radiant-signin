import { useState, useCallback, useMemo } from 'react';
import { useDashboardData } from './use-dashboard-data';

export interface Notification {
  id: string;
  type: 'error' | 'warning' | 'info';
  message: string;
  link?: string;
  read: boolean;
  timestamp: Date;
}

export function useNotifications() {
  const { alerts, isLoading } = useDashboardData();
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications: Notification[] = useMemo(() => {
    return alerts.map(alert => ({
      id: alert.id,
      type: alert.type,
      message: alert.message,
      link: alert.link,
      read: readIds.has(alert.id),
      timestamp: new Date(),
    }));
  }, [alerts, readIds]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setReadIds(prev => new Set([...prev, id]));
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds(new Set(notifications.map(n => n.id)));
  }, [notifications]);

  const clearAll = useCallback(() => {
    setReadIds(new Set(notifications.map(n => n.id)));
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
    isLoading,
  };
}
