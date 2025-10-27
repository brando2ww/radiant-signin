import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Star, Target } from "lucide-react";
import { useCustomerEvaluations, useEvaluationStats, useExportEvaluations } from "@/hooks/use-customer-evaluations";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EvaluationDetailDialog } from "./EvaluationDetailDialog";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

export const ReportsTab = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<string | null>(null);
  
  const startDate = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined;
  const endDate = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined;
  
  const { data: evaluations } = useCustomerEvaluations({ startDate, endDate });
  const stats = useEvaluationStats(startDate, endDate);
  const exportEvaluations = useExportEvaluations();

  const getNpsCategory = (nps: number) => {
    if (nps < 0) return { label: "Crítico", color: "destructive" };
    if (nps <= 30) return { label: "Ruim", color: "destructive" };
    if (nps <= 50) return { label: "Razoável", color: "default" };
    if (nps <= 75) return { label: "Bom", color: "default" };
    return { label: "Excelente", color: "default" };
  };

  const npsCategory = stats ? getNpsCategory(stats.nps) : null;

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex justify-between items-center">
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        <Button 
          onClick={() => exportEvaluations.mutate({ startDate, endDate })}
          disabled={exportEvaluations.isPending}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Avaliações</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEvaluations || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média Geral</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.avgSatisfaction.toFixed(1) || "0.0"} ⭐
            </div>
            <p className="text-xs text-muted-foreground">De 1 a 5 estrelas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">NPS Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgNps.toFixed(1) || "0.0"}</div>
            <p className="text-xs text-muted-foreground">De 0 a 10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classificação NPS</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.nps || 0}</div>
            {npsCategory && (
              <Badge variant={npsCategory.color as any}>{npsCategory.label}</Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Evolução */}
        <Card>
          <CardHeader>
            <CardTitle>Evolução da Satisfação</CardTitle>
            <CardDescription>Média diária de avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats?.evolutionData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => format(new Date(value), "dd/MM", { locale: ptBR })}
                />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgSatisfaction" 
                  stroke="hsl(var(--primary))" 
                  name="Satisfação"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição NPS */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição NPS</CardTitle>
            <CardDescription>Detratores, Neutros e Promotores</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Detratores (0-6)", value: stats?.detractors || 0 },
                    { name: "Neutros (7-8)", value: stats?.neutrals || 0 },
                    { name: "Promotores (9-10)", value: stats?.promoters || 0 },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Perguntas */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking de Perguntas</CardTitle>
          <CardDescription>Ordenado por média (pior para melhor)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={stats?.questionAverages || []} 
              layout="vertical"
              margin={{ left: 150 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 5]} />
              <YAxis dataKey="question_text" type="category" width={150} />
              <Tooltip />
              <Bar dataKey="average" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Histórico de Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Avaliações</CardTitle>
          <CardDescription>Todas as avaliações recebidas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Média Geral</TableHead>
                <TableHead>NPS</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations?.map((evaluation) => {
                const avgScore = evaluation.evaluation_answers.length > 0
                  ? evaluation.evaluation_answers.reduce((sum, a) => sum + a.score, 0) / evaluation.evaluation_answers.length
                  : 0;

                const maskedPhone = evaluation.customer_whatsapp.replace(
                  /(\d{2})(\d)(\d{4})(\d{4})/,
                  "($1) $2****-$4"
                );

                return (
                  <TableRow key={evaluation.id}>
                    <TableCell>
                      {format(new Date(evaluation.evaluation_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                    </TableCell>
                    <TableCell>{evaluation.customer_name}</TableCell>
                    <TableCell>{maskedPhone}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {avgScore.toFixed(1)} <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </TableCell>
                    <TableCell>
                      {evaluation.nps_score !== null ? (
                        <Badge>{evaluation.nps_score}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedEvaluationId(evaluation.id)}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Detalhes */}
      {selectedEvaluationId && (
        <EvaluationDetailDialog
          evaluationId={selectedEvaluationId}
          open={selectedEvaluationId !== null}
          onClose={() => setSelectedEvaluationId(null)}
        />
      )}
    </div>
  );
};
