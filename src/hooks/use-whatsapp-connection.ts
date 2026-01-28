import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type ConnectionStatus = 'disconnected' | 'connecting' | 'open';

export interface WhatsAppConnection {
  id: string;
  user_id: string;
  instance_name: string;
  phone_number: string | null;
  connection_status: ConnectionStatus;
  profile_name: string | null;
  profile_picture_url: string | null;
  connected_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface QRCodeResponse {
  status: 'pending' | 'connected';
  qrcode?: string;
  profile_name?: string | null;
  profile_picture_url?: string | null;
  phone_number?: string | null;
}

export interface StatusResponse {
  status: ConnectionStatus;
  profile_name?: string | null;
  profile_picture_url?: string | null;
  phone_number?: string | null;
}

export function useWhatsAppConnection() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const instanceName = user ? `velara-${user.id.slice(0, 8)}` : '';

  // Fetch current connection from database
  const { data: connection, isLoading } = useQuery({
    queryKey: ['whatsapp-connection', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await (supabase as any)
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching connection:', error);
        return null;
      }
      
      return data as WhatsAppConnection | null;
    },
    enabled: !!user,
  });

  const isConnected = connection?.connection_status === 'open';

  // Generate QR Code
  const generateQRCode = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('whatsapp-qrcode/generate', {
        body: { userId: user.id, instanceName }
      });

      if (error) throw error;
      return data as QRCodeResponse;
    },
    onSuccess: (data) => {
      if (data.status === 'connected') {
        toast.success('WhatsApp já está conectado!');
        queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      } else if (data.qrcode) {
        setQrCode(data.qrcode);
        startPolling();
      }
    },
    onError: (error) => {
      console.error('Error generating QR code:', error);
      toast.error('Erro ao gerar QR Code');
    }
  });

  // Check connection status
  const checkStatus = useCallback(async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-qrcode/status', {
        body: { userId: user.id, instanceName }
      });

      if (error) throw error;
      return data as StatusResponse;
    } catch (error) {
      console.error('Error checking status:', error);
      return null;
    }
  }, [user, instanceName]);

  // Start polling for connection status
  const startPolling = useCallback(() => {
    setIsPolling(true);

    // Clear any existing intervals
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
    }

    // Poll every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      const status = await checkStatus();
      
      if (status?.status === 'open') {
        stopPolling();
        setQrCode(null);
        toast.success('WhatsApp conectado com sucesso!');
        queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
      }
    }, 3000);

    // Timeout after 2 minutes
    pollingTimeoutRef.current = setTimeout(() => {
      stopPolling();
      setQrCode(null);
      toast.info('QR Code expirado. Gere um novo para continuar.');
    }, 120000);
  }, [checkStatus, queryClient]);

  // Stop polling
  const stopPolling = useCallback(() => {
    setIsPolling(false);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }
  }, []);

  // Disconnect WhatsApp
  const disconnect = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase.functions.invoke('whatsapp-qrcode/disconnect', {
        body: { userId: user.id, instanceName }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('WhatsApp desconectado');
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
    },
    onError: (error) => {
      console.error('Error disconnecting:', error);
      toast.error('Erro ao desconectar');
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  return {
    connection,
    isLoading,
    isConnected,
    qrCode,
    isPolling,
    isGenerating: generateQRCode.isPending,
    isDisconnecting: disconnect.isPending,
    generateQRCode: generateQRCode.mutate,
    disconnect: disconnect.mutate,
    stopPolling,
    setQrCode
  };
}
