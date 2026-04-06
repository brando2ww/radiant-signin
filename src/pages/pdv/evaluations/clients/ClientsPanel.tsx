import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, BarChart3, UserPlus } from "lucide-react";
import { useCustomerEvaluations } from "@/hooks/use-customer-evaluations";
import { format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--destructive))"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-sm text-muted-foreground">
          {entry.name}: <span className="font-semibold text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function ClientsPanel() {
  const { data: evaluations, isLoading } = useCustomerEvaluations();

  const stats = useMemo(() => {
    if (!evaluations?.length) return null;

    const grouped = new Map<string, typeof evaluations>();
    evaluations.forEach((e) => {
      const key = e.customer_whatsapp;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(e);
    });

    const totalUnique = grouped.size;
    const recurring = Array.from(grouped.values()).filter((v) => v.length > 1).length;
    const avgPerClient = totalUnique > 0 ? evaluations.length / totalUnique : 0;

    // Novos no mês atual
    const monthStart = startOfMonth(new Date());
    let newThisMonth = 0;
    grouped.forEach((evals) => {
      const sorted = [...evals].sort((a, b) => a.evaluation_date.localeCompare(b.evaluation_date));
      if (new Date(sorted[0].evaluation_date) >= monthStart) newThisMonth++;
    });

    // Evolução novos clientes por mês (últimos 6 meses)
    const monthlyNew: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const mStart = startOfMonth(subMonths(new Date(), i));
      const mEnd = startOfMonth(subMonths(new Date(), i - 1));
      let count = 0;
      grouped.forEach((evals) => {
        const first = [...evals].sort((a, b) => a.evaluation_date.localeCompare(b.evaluation_date))[0];
        const d = new Date(first.evaluation_date);
        if (d >= mStart && d < mEnd) count++;
      });
      monthlyNew.push({ month: format(mStart, "MMM/yy", { locale: ptBR }), count });
    }

    // Distribuição de recorrência
    let one = 0, twoThree = 0, fourPlus = 0;
    grouped.forEach((evals) => {
      if (evals.length === 1) one++;
      else if (evals.length <= 3) twoThree++;
      else fourPlus++;
    });
    const recurrenceDist = [
      { name: "1 avaliação", value: one },
      { name: "2-3 avaliações", value: twoThree },
      { name: "4+ avaliações", value: fourPlus },
    ];

    return { totalUnique, recurring, avgPerClient, newThisMonth, monthlyNew, recurrenceDist };
  }, [evaluations]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Clientes</h1>
        <p className="text-sm text-muted-foreground">KPIs e visão geral dos clientes avaliadores</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Clientes Únicos</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.totalUnique ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserCheck className="h-4 w-4" />
              <span className="text-xs font-medium">Recorrentes</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.recurring ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BarChart3 className="h-4 w-4" />
              <span className="text-xs font-medium">Média/Cliente</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{(stats?.avgPerClient ?? 0).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <UserPlus className="h-4 w-4" />
              <span className="text-xs font-medium">Novos no Mês</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats?.newThisMonth ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Novos Clientes por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.monthlyNew?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.monthlyNew}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Novos clientes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Distribuição de Recorrência</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recurrenceDist?.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={stats.recurrenceDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.recurrenceDist.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
