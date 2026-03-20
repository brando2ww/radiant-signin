import { useEffect, useState } from "react";
import { Building2, Users, Package, ToggleRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DashboardMetricCard } from "@/components/pdv/DashboardMetricCard";

interface DashboardStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  totalModules: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    totalModules: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const [tenantsRes, usersRes, modulesRes] = await Promise.all([
          supabase.from("tenants").select("id, is_active"),
          supabase.from("establishment_users").select("id", { count: "exact", head: true }),
          supabase.from("tenant_modules").select("id, module, is_active").eq("is_active", true),
        ]);

        const tenants = tenantsRes.data || [];
        const totalUsers = usersRes.count || 0;
        const modules = modulesRes.data || [];

        setStats({
          totalTenants: tenants.length,
          activeTenants: tenants.filter((t) => t.is_active).length,
          totalUsers,
          totalModules: modules.length,
        });
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Visão geral da plataforma
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardMetricCard
          title="Total de Tenants"
          value={stats.totalTenants}
          icon={Building2}
          isLoading={isLoading}
        />
        <DashboardMetricCard
          title="Tenants Ativos"
          value={stats.activeTenants}
          subtitle={
            stats.totalTenants > 0
              ? `${Math.round((stats.activeTenants / stats.totalTenants) * 100)}% do total`
              : undefined
          }
          icon={ToggleRight}
          isLoading={isLoading}
        />
        <DashboardMetricCard
          title="Total de Usuários"
          value={stats.totalUsers}
          icon={Users}
          isLoading={isLoading}
        />
        <DashboardMetricCard
          title="Módulos Ativos"
          value={stats.totalModules}
          icon={Package}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
