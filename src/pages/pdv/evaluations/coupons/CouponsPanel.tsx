import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, CheckCircle, XCircle, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import { useAllPrizeWins } from "@/hooks/use-all-prize-wins";
import { useCustomerEvaluations } from "@/hooks/use-customer-evaluations";
import { isBefore, parseISO, format, subMonths, startOfMonth, addDays, getDay, getWeekOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(142 71% 45%)",
  "hsl(0 84% 60%)",
  "hsl(45 93% 47%)",
  "hsl(280 67% 55%)",
];

const WEEKDAY_LABELS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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

export default function CouponsPanel() {
  const { data: wins = [], isLoading } = useAllPrizeWins();
  const { data: evaluations = [] } = useCustomerEvaluations();
  const now = new Date();

  // Map evaluation_id -> birth_date for age profile
  const birthDateMap = useMemo(() => {
    const m = new Map<string, string>();
    evaluations.forEach((e) => m.set(e.id, e.customer_birth_date));
    return m;
  }, [evaluations]);

  const stats = useMemo(() => {
    const total = wins.length;
    const redeemed = wins.filter((w) => w.is_redeemed).length;
    const expired = wins.filter(
      (w) => !w.is_redeemed && isBefore(parseISO(w.coupon_expires_at), now)
    ).length;
    const active = total - redeemed - expired;
    const expiringSoon = wins.filter((w) => {
      if (w.is_redeemed) return false;
      const exp = parseISO(w.coupon_expires_at);
      return !isBefore(exp, now) && isBefore(exp, addDays(now, 7));
    }).length;
    const rate = total > 0 ? ((redeemed / total) * 100).toFixed(1) : "0";
    return { total, redeemed, expired, active, expiringSoon, rate };
  }, [wins]);

  // Monthly emission chart (last 6 months)
  const monthlyData = useMemo(() => {
    const months: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const m = subMonths(now, i);
      const start = startOfMonth(m);
      const nextStart = startOfMonth(subMonths(now, i - 1));
      const count = wins.filter((w) => {
        const d = parseISO(w.created_at);
        return d >= start && d < nextStart;
      }).length;
      months.push({ label: format(m, "MMM/yy", { locale: ptBR }), count });
    }
    return months;
  }, [wins]);

  // Pie data for status
  const pieData = useMemo(
    () => [
      { name: "Ativos", value: stats.active },
      { name: "Utilizados", value: stats.redeemed },
      { name: "Expirados", value: stats.expired },
    ],
    [stats]
  );

  // Usage by day of the week
  const weekdayData = useMemo(() => {
    const counts = Array(7).fill(0);
    wins
      .filter((w) => w.is_redeemed && w.redeemed_at)
      .forEach((w) => {
        const day = getDay(parseISO(w.redeemed_at!));
        counts[day]++;
      });
    return WEEKDAY_LABELS.map((label, i) => ({ day: label, count: counts[i] }));
  }, [wins]);

  // Distribution by week of month (created_at)
  const weekOfMonthData = useMemo(() => {
    const weeks = [
      { week: "Semana 1", count: 0 },
      { week: "Semana 2", count: 0 },
      { week: "Semana 3", count: 0 },
      { week: "Semana 4", count: 0 },
      { week: "Semana 5", count: 0 },
    ];
    wins.forEach((w) => {
      const wk = getWeekOfMonth(parseISO(w.created_at)) - 1;
      if (wk >= 0 && wk < 5) weeks[wk].count++;
    });
    return weeks.filter((w) => w.count > 0 || weeks.indexOf(w) < 4);
  }, [wins]);

  // Age profile of coupon winners
  const ageProfileData = useMemo(() => {
    const brackets = [
      { label: "18-25", min: 18, max: 25, count: 0 },
      { label: "26-35", min: 26, max: 35, count: 0 },
      { label: "36-45", min: 36, max: 45, count: 0 },
      { label: "46-60", min: 46, max: 60, count: 0 },
      { label: "60+", min: 61, max: 200, count: 0 },
    ];
    wins.forEach((w) => {
      const bd = birthDateMap.get(w.evaluation_id);
      if (!bd) return;
      const age = calculateAge(bd);
      if (age === null) return;
      const b = brackets.find((br) => age >= br.min && age <= br.max);
      if (b) b.count++;
    });
    return brackets.map((b) => ({ faixa: b.label, count: b.count }));
  }, [wins, birthDateMap]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  const kpis = [
    { label: "Total Emitidos", value: stats.total, icon: Gift, color: "text-primary" },
    { label: "Utilizados", value: stats.redeemed, icon: CheckCircle, color: "text-green-500" },
    { label: "Ativos", value: stats.active, icon: Clock, color: "text-blue-500" },
    { label: "Expirados", value: stats.expired, icon: XCircle, color: "text-destructive" },
    { label: "Vencendo em 7d", value: stats.expiringSoon, icon: AlertTriangle, color: "text-yellow-500" },
    { label: "Taxa de Utilização", value: `${stats.rate}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Central de Prêmios</h1>
        <p className="text-sm text-muted-foreground">
          KPIs e visão geral dos prêmios emitidos
        </p>
      </div>

      {/* KPI Cards — 6 cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 mb-2">
                <k.icon className={`h-5 w-5 ${k.color}`} />
                <span className="text-xs text-muted-foreground">{k.label}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 1: Status donut + Monthly bar */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Status dos Prêmios</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prêmios Emitidos por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Prêmios"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Weekday usage + Week of month */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilização por Dia da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            {weekdayData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Utilizações"
                    fill="hsl(142 71% 45%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sem dados de utilização
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emissão por Semana do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weekOfMonthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="week"
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="Prêmios"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Age profile */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Perfil Etário dos Premiados</CardTitle>
          </CardHeader>
          <CardContent>
            {ageProfileData.some((d) => d.count > 0) ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={ageProfileData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="faixa"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    name="Clientes"
                    fill="hsl(280 67% 55%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sem dados de idade
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
