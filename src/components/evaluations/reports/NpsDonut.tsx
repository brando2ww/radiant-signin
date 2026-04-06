import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = { promoter: "#22c55e", neutral: "#eab308", detractor: "#ef4444" };
const RADIAN = Math.PI / 180;

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface Props {
  promoters: number;
  neutrals: number;
  detractors: number;
  nps: number;
  title?: string;
}

export function NpsDonut({ promoters, neutrals, detractors, nps, title = "Distribuição NPS" }: Props) {
  const data = [
    { name: "Promotores (9-10)", value: promoters, color: COLORS.promoter },
    { name: "Neutros (7-8)", value: neutrals, color: COLORS.neutral },
    { name: "Detratores (0-6)", value: detractors, color: COLORS.detractor },
  ].filter(d => d.value > 0);

  if (data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          {title}
          <span className="text-lg font-bold text-primary">NPS: {nps}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3} dataKey="value" labelLine={false} label={renderLabel}>
              {data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
