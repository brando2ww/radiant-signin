import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gift, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { useAllPrizeWins } from "@/hooks/use-all-prize-wins";
import { isBefore, parseISO, format, subMonths, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(142 71% 45%)", "hsl(0 84% 60%)"];

export default function CouponsPanel() {
  const { data: wins = [], isLoading } = useAllPrizeWins();
  const now = new Date();

  const stats = useMemo(() => {
    const total = wins.length;
    const redeemed = wins.filter((w) => w.is_redeemed).length;
    const expired = wins.filter((w) => !w.is_redeemed && isBefore(parseISO(w.coupon_expires_at), now)).length;
    const active = total - redeemed - expired;
    const rate = total > 0 ? ((redeemed / total) * 100).toFixed(1) : "0";
    return { total, redeemed, expired, active, rate };
  }, [wins]);

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

  const pieData = useMemo(() => [
    { name: "Ativos", value: stats.active },
    { name: "Resgatados", value: stats.redeemed },
    { name: "Expirados", value: stats.expired },
  ], [stats]);

  if (isLoading) {
    return <div className="p-4 md:p-6"><p className="text-muted-foreground">Carregando...</p></div>;
  }

  const kpis = [
    { label: "Total Emitidos", value: stats.total, icon: Gift, color: "text-primary" },
    { label: "Resgatados", value: stats.redeemed, icon: CheckCircle, color: "text-green-500" },
    { label: "Expirados", value: stats.expired, icon: XCircle, color: "text-destructive" },
    { label: "Taxa de Resgate", value: `${stats.rate}%`, icon: TrendingUp, color: "text-primary" },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Painel de Cupons</h1>
        <p className="text-sm text-muted-foreground">KPIs e visão geral dos cupons emitidos</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Cupons Emitidos por Mês</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Cupons" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Status dos Cupons</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
