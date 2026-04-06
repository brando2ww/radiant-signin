import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip,
} from "recharts";
import { Search } from "lucide-react";

interface CriterionStat {
  questionId: string;
  questionText: string;
  nps: number;
  promoters: number;
  neutrals: number;
  detractors: number;
  total: number;
}

interface Props {
  criteria: CriterionStat[];
}

export default function NPSCriteriaSection({ criteria }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 5;

  const filtered = useMemo(() =>
    criteria.filter(c => c.questionText.toLowerCase().includes(search.toLowerCase())),
    [criteria, search]
  );

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const radarData = criteria.slice(0, 8).map((c, i) => ({
    subject: `Q${i + 1}`,
    nps: c.nps,
    fullMark: 100,
  }));

  if (criteria.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">NPS dos Critérios</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Radar */}
          <div>
            {radarData.length > 2 ? (
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[-100, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Radar name="NPS" dataKey="nps" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-12">Mínimo 3 critérios para radar</p>
            )}
          </div>

          {/* Table */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar pergunta..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(0); }}
                className="pl-8 h-9 text-sm"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-2">Questão</th>
                    <th className="pb-2 pr-2 text-center">NPS</th>
                    <th className="pb-2 pr-2 text-center">👍</th>
                    <th className="pb-2 pr-2 text-center">😐</th>
                    <th className="pb-2 pr-2 text-center">👎</th>
                    <th className="pb-2 text-center">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map(c => {
                    const npsColor = c.nps >= 50 ? "text-emerald-600" : c.nps >= 0 ? "text-amber-600" : "text-destructive";
                    return (
                      <tr key={c.questionId} className="border-b last:border-0">
                        <td className="py-2 pr-2 max-w-[180px] truncate">{c.questionText}</td>
                        <td className={`py-2 pr-2 text-center font-bold ${npsColor}`}>{c.nps}</td>
                        <td className="py-2 pr-2 text-center text-emerald-600">{c.promoters}</td>
                        <td className="py-2 pr-2 text-center text-amber-600">{c.neutrals}</td>
                        <td className="py-2 pr-2 text-center text-destructive">{c.detractors}</td>
                        <td className="py-2 text-center">{c.total}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="hover:text-foreground disabled:opacity-50">← Anterior</button>
                <span>{page + 1} / {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="hover:text-foreground disabled:opacity-50">Próximo →</button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
