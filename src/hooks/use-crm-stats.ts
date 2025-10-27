import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CRMStats {
  totalLeads: number;
  totalValue: number;
  averageDealSize: number;
  conversionRate: number;
  leadsByStage: Record<string, number>;
  valueByStage: Record<string, number>;
  leadsThisMonth: number;
  dealsWonThisMonth: number;
  revenueThisMonth: number;
}

export function useCRMStats() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['crm-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: leads, error } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const activeLeads = leads.filter(l => l.status === 'active');
      const totalLeads = activeLeads.length;
      const totalValue = activeLeads.reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);
      const averageDealSize = totalLeads > 0 ? totalValue / totalLeads : 0;

      const wonLeads = leads.filter(l => l.stage === 'won');
      const lostLeads = leads.filter(l => l.stage === 'lost');
      const totalClosed = wonLeads.length + lostLeads.length;
      const conversionRate = totalClosed > 0 ? (wonLeads.length / totalClosed) * 100 : 0;

      const leadsByStage = activeLeads.reduce((acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const valueByStage = activeLeads.reduce((acc, lead) => {
        acc[lead.stage] = (acc[lead.stage] || 0) + (lead.estimated_value || 0);
        return acc;
      }, {} as Record<string, number>);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const leadsThisMonth = leads.filter(l => 
        new Date(l.created_at) >= startOfMonth
      ).length;

      const dealsWonThisMonth = wonLeads.filter(l =>
        l.closed_date && new Date(l.closed_date) >= startOfMonth
      ).length;

      const revenueThisMonth = wonLeads
        .filter(l => l.closed_date && new Date(l.closed_date) >= startOfMonth)
        .reduce((sum, lead) => sum + (lead.estimated_value || 0), 0);

      return {
        totalLeads,
        totalValue,
        averageDealSize,
        conversionRate,
        leadsByStage,
        valueByStage,
        leadsThisMonth,
        dealsWonThisMonth,
        revenueThisMonth,
      } as CRMStats;
    },
    enabled: !!user?.id,
  });
}
