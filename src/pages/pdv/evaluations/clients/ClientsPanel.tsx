import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, UserCheck, BarChart3, UserPlus, TrendingUp } from "lucide-react";
import { useCustomerEvaluations } from "@/hooks/use-customer-evaluations";
import { format, startOfMonth, subMonths, getDay, getHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(142 71% 45%)",
  "hsl(280 67% 55%)",
];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

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

function calculateAge(birthDate: string): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age >= 0 && age <= 120 ? age : null;
}

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
    const engagementRate = totalUnique > 0 ? ((recurring / totalUnique) * 100).toFixed(1) : "0";

    // New this month
    const monthStart = startOfMonth(new Date());
    let newThisMonth = 0;
    grouped.forEach((evals) => {
      const sorted = [...evals].sort((a, b) => a.evaluation_date.localeCompare(b.evaluation_date));
      if (new Date(sorted[0].evaluation_date) >= monthStart) newThisMonth++;
    });

    // Monthly new clients (last 6 months)
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

    // Recurrence distribution
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

    // Hourly distribution (registration hour)
    const hourlyDist: { hour: string; count: number }[] = [];
    const hourCounts = Array(24).fill(0);
    evaluations.forEach((e) => {
      const h = getHours(new Date(e.created_at));
      hourCounts[h]++;
    });
    for (let h = 0; h < 24; h++) {
      hourlyDist.push({ hour: `${h}h`, count: hourCounts[h] });
    }

    // Day of week distribution
    const weekdayCounts = Array(7).fill(0);
    evaluations.forEach((e) => {
      const d = getDay(new Date(e.evaluation_date));
      weekdayCounts[d]++;
    });
    const weekdayDist = WEEKDAY_LABELS.map((label, i) => ({ day: label, count: weekdayCounts[i] }));

    // Age profile
    const ageBrackets = [
      { label: "18-25", min: 18, max: 25, count: 0 },
      { label: "26-35", min: 26, max: 35, count: 0 },
      { label: "36-45", min: 36, max: 45, count: 0 },
      { label: "46-60", min: 46, max: 60, count: 0 },
      { label: "60+", min: 61, max: 200, count: 0 },
    ];
    const seen = new Set<string>();
    evaluations.forEach((e) => {
      if (seen.has(e.customer_whatsapp)) return;
      seen.add(e.customer_whatsapp);
      const age = calculateAge(e.customer_birth_date);
      if (age === null) return;
      const b = ageBrackets.find((br) => age >= br.min && age <= br.max);
      if (b) b.count++;
    });
    const ageProfile = ageBrackets.map((b) => ({ faixa: b.label, count: b.count }));

    // Birthdays by month (unique clients)
    const bdayMonths = Array(12).fill(0);
    const seenBd = new Set<string>();
    evaluations.forEach((e) => {
      if (seenBd.has(e.customer_whatsapp)) return;
      seenBd.add(e.customer_whatsapp);
      if (!e.customer_birth_date) return;
      const bd = new Date(e.customer_birth_date);
      if (!isNaN(bd.getTime())) bdayMonths[bd.getMonth()]++;
    });
    const birthdaysByMonth = MONTH_LABELS.map((label, i) => ({ mes: label, count: bdayMonths[i] }));

    return {
      totalUnique, recurring, avgPerClient, newThisMonth, engagementRate,
      monthlyNew, recurrenceDist, hourlyDist, weekdayDist, ageProfile, birthdaysByMonth,
    };
  }, [evaluations]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const kpis = [
    { label: "Clientes Únicos", value: stats?.totalUnique ?? 0, icon: Users, color: "text-primary" },
    { label: "Recorrentes", value: stats?.recurring ?? 0, icon: UserCheck, color: "text-green-500" },
    { label: "Média/Cliente", value: (stats?.avgPerClient ?? 0).toFixed(1), icon: BarChart3, color: "text-blue-500" },
    { label: "Novos no Mês", value: stats?.newThisMonth ?? 0, icon: UserPlus, color: "text-purple-500" },
    { label: "Taxa Engajamento", value: `${stats?.engagementRate ?? 0}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Clientes</h1>
        <p className="text-sm text-muted-foreground">KPIs e visão geral dos clientes avaliadores</p>
      </div>

      {/* KPI Cards — 5 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <k.icon className={`h-4 w-4 ${k.color}`} />
                <span className="text-xs font-medium">{k.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: New clients + Recurrence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Novos Clientes por Mês</CardTitle></CardHeader>
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
          <CardHeader><CardTitle className="text-base">Distribuição de Recorrência</CardTitle></CardHeader>
          <CardContent>
            {stats?.recurrenceDist?.some((d) => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={stats.recurrenceDist} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={4} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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

      {/* Row 2: Hourly + Weekday */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Horário de Cadastro</CardTitle></CardHeader>
          <CardContent>
            {stats?.hourlyDist?.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.hourlyDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={1} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Cadastros" fill="hsl(142 71% 45%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Avaliações por Dia da Semana</CardTitle></CardHeader>
          <CardContent>
            {stats?.weekdayDist?.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.weekdayDist}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Avaliações" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Age profile + Birthdays by month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Perfil do Cliente (Faixa Etária)</CardTitle></CardHeader>
          <CardContent>
            {stats?.ageProfile?.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.ageProfile}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="faixa" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Clientes" fill="hsl(280 67% 55%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Sem dados</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Aniversariantes por Mês</CardTitle></CardHeader>
          <CardContent>
            {stats?.birthdaysByMonth?.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={stats.birthdaysByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Aniversariantes" fill="hsl(45 93% 47%)" radius={[4, 4, 0, 0]} />
                </BarChart>
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
