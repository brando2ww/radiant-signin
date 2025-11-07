import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface PDVCustomer {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  cpf: string | null;
  email: string | null;
  birth_date: string | null;
  notes: string | null;
  total_spent: number;
  visit_count: number;
  last_visit: string | null;
  created_at: string;
  updated_at: string;
}

export function usePDVCustomers() {
  const { user } = useAuth();

  const { data: customers, isLoading } = useQuery({
    queryKey: ["pdv-customers", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("pdv_customers")
        .select("*")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data as PDVCustomer[];
    },
    enabled: !!user,
  });

  return {
    customers: customers || [],
    isLoading,
  };
}
