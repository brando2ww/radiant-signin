import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DeliveryNotification {
  id: string;
  type: "new_order" | "status_change" | "cancellation";
  orderId: string;
  orderNumber: string;
  customerName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const useDeliveryRealtimeOrders = (userId: string, onNewOrder?: () => void) => {
  const [notifications, setNotifications] = useState<DeliveryNotification[]>([]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("delivery-orders-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "delivery_orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const order = payload.new as any;
          
          const notification: DeliveryNotification = {
            id: crypto.randomUUID(),
            type: "new_order",
            orderId: order.id,
            orderNumber: order.order_number,
            customerName: order.customer_name,
            message: `Novo pedido #${order.order_number} de ${order.customer_name}`,
            timestamp: new Date(),
            read: false,
          };

          setNotifications((prev) => [notification, ...prev]);

          // Play notification sound
          playNotificationSound();

          // Show toast
          toast.success(`🔔 Novo Pedido #${order.order_number}`, {
            description: `Cliente: ${order.customer_name}`,
            duration: 5000,
          });

          // Callback for parent component
          if (onNewOrder) {
            onNewOrder();
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "delivery_orders",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const order = payload.new as any;
          const oldOrder = payload.old as any;

          // Only notify if status changed
          if (order.status !== oldOrder.status) {
            const notification: DeliveryNotification = {
              id: crypto.randomUUID(),
              type: order.status === "cancelled" ? "cancellation" : "status_change",
              orderId: order.id,
              orderNumber: order.order_number,
              customerName: order.customer_name,
              message: `Pedido #${order.order_number} - ${getStatusLabel(order.status)}`,
              timestamp: new Date(),
              read: false,
            };

            setNotifications((prev) => [notification, ...prev]);

            if (order.status === "cancelled") {
              toast.error(`Pedido #${order.order_number} cancelado`);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onNewOrder]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearAll,
  };
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    pending: "Aguardando confirmação",
    confirmed: "Confirmado",
    preparing: "Em preparo",
    ready: "Pronto para retirada/entrega",
    out_for_delivery: "Saiu para entrega",
    delivered: "Entregue",
    cancelled: "Cancelado",
  };
  return labels[status] || status;
};

const playNotificationSound = () => {
  try {
    // Create a simple notification sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // First beep
    oscillator.frequency.value = 800;
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);

    // Second beep
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator();
      const gainNode2 = audioContext.createGain();
      oscillator2.connect(gainNode2);
      gainNode2.connect(audioContext.destination);
      oscillator2.frequency.value = 1000;
      gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      oscillator2.start(audioContext.currentTime);
      oscillator2.stop(audioContext.currentTime + 0.1);
    }, 150);
  } catch (error) {
    console.error("Error playing notification sound:", error);
  }
};
