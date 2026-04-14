import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useEstablishmentId } from "@/hooks/use-establishment-id";
import { toast } from "sonner";

export interface EmployeeConsumption {
  id: string;
  user_id: string;
  employee_name: string;
  comanda_id: string | null;
  total: number;
  status: string;
  notes: string | null;
  created_at: string;
  closed_at: string | null;
}

export function usePDVEmployeeConsumption() {
  const { user } = useAuth();
  const { visibleUserId } = useEstablishmentId();
  const queryClient = useQueryClient();

  const { data: consumptions = [], isLoading } = useQuery({
    queryKey: ["pdv-employee-consumption", visibleUserId],
    queryFn: async () => {
      if (!visibleUserId) return [];
      const { data, error } = await supabase
        .from("pdv_employee_consumption")
        .select("*")
        .eq("user_id", visibleUserId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmployeeConsumption[];
    },
    enabled: !!visibleUserId,
  });

  const createConsumption = useMutation({
    mutationFn: async (data: { employee_name: string; notes?: string }) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data: newItem, error } = await supabase
        .from("pdv_employee_consumption")
        .insert({
          user_id: user.id,
          employee_name: data.employee_name,
          notes: data.notes || null,
          status: "aberta",
          total: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return newItem as EmployeeConsumption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-employee-consumption"] });
      toast.success("Consumo de funcionário criado!");
    },
    onError: (error) => {
      toast.error("Erro ao criar consumo: " + error.message);
    },
  });

  const updateConsumption = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<EmployeeConsumption> }) => {
      const { data, error } = await supabase
        .from("pdv_employee_consumption")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as EmployeeConsumption;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pdv-employee-consumption"] });
    },
    onError: (error) => {
      toast.error("Erro ao atualizar consumo: " + error.message);
    },
  });

  const closeConsumption = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "pago" | "descontado" }) => {
      const { data, error } = await supabase
        .from("pdv_employee_consumption")
        .update({
          status,
          closed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as EmployeeConsumption;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pdv-employee-consumption"] });
      toast.success(variables.status === "pago" ? "Consumo marcado como pago!" : "Consumo marcado como descontado!");
    },
    onError: (error) => {
      toast.error("Erro ao fechar consumo: " + error.message);
    },
  });

  const openConsumptions = consumptions.filter((c) => c.status === "aberta");
  const closedConsumptions = consumptions.filter((c) => c.status !== "aberta");

  return {
    consumptions,
    openConsumptions,
    closedConsumptions,
    isLoading,
    createConsumption: createConsumption.mutate,
    isCreating: createConsumption.isPending,
    updateConsumption: updateConsumption.mutate,
    closeConsumption: closeConsumption.mutate,
    isClosing: closeConsumption.isPending,
  };
}
