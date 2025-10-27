import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, Users, Star, Target, MessageCircle, AlertTriangle, Clock, Calendar, Trophy } from "lucide-react";
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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleWhatsAppContact = (phone: string, name: string) => {
    const cleanPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(
      `Olá ${name}! Obrigado pela sua avaliação. Como podemos melhorar ainda mais sua experiência?`
    );
    window.open(`https://wa.me/55${cleanPhone}?text=${message}`, '_blank');
  };

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

      {/* Cards de Métricas - Linha 1 */}
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
              {stats?.avgSatisfaction.toFixed(1) || "0.0"}
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

      {/* Cards de Métricas - Linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idade Média</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.avgAge.toFixed(0) || "0"} anos</div>
            <p className="text-xs text-muted-foreground">Perfil demográfico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Horário de Pico</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats?.peakHours && stats.peakHours.length > 0 ? (
              <>
                <div className="text-2xl font-bold">{stats.peakHours[0].hour}h</div>
                <p className="text-xs text-muted-foreground">
                  {stats.peakHours[0].count} avaliações
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.vipCustomers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Avaliaram 2+ vezes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Recentes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.recentNegative?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Últimas 24h (nota &lt; 3)</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Insights */}
      {stats?.recentNegative && stats.recentNegative.length > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Avaliações Negativas Recentes
            </CardTitle>
            <CardDescription>Últimas 24 horas - Requer atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentNegative.slice(0, 5).map((evaluation) => (
                <div 
                  key={evaluation.id} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-background rounded border"
                >
                  <div>
                    <p className="font-medium">{evaluation.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Nota: {evaluation.avgScore.toFixed(1)} - {format(new Date(evaluation.evaluation_date), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={() => handleWhatsAppContact(evaluation.customer_whatsapp, evaluation.customer_name)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contatar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Clientes VIP */}
      {stats?.vipCustomers && stats.vipCustomers.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardHeader>
            <CardTitle className="text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Clientes VIP
            </CardTitle>
            <CardDescription>Clientes que avaliaram mais de uma vez</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.vipCustomers.slice(0, 5).map((customer, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 bg-white dark:bg-background rounded border"
                >
                  <div>
                    <p className="font-medium">{customer.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.evaluation_count} avaliações - Média: {customer.avgScore.toFixed(1)}
                    </p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleWhatsAppContact(customer.customer_whatsapp, customer.customer_name)}
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contatar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos - Linha 1 */}
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
                  cy="45%"
                  labelLine={false}
                  label={(entry) => {
                    const total = (stats?.detractors || 0) + (stats?.neutrals || 0) + (stats?.promoters || 0);
                    if (entry.value === 0 || total === 0) return null;
                    const percentage = ((entry.value / total) * 100).toFixed(1);
                    return `${percentage}%`;
                  }}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => {
                    const total = (stats?.detractors || 0) + (stats?.neutrals || 0) + (stats?.promoters || 0);
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
                    return `${value} (${percentage}%)`;
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Linha 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Satisfação por Faixa Etária */}
        <Card>
          <CardHeader>
            <CardTitle>Satisfação por Faixa Etária</CardTitle>
            <CardDescription>Média de avaliação por idade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.satisfactionByAge || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" fill="hsl(var(--primary))" name="Média" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Avaliações por Dia da Semana */}
        <Card>
          <CardHeader>
            <CardTitle>Avaliações por Dia da Semana</CardTitle>
            <CardDescription>Volume de avaliações</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.weekdayStats || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--primary))" name="Avaliações" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos - Linha 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Distribuição por Faixa Etária */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Faixa Etária</CardTitle>
            <CardDescription>Quantidade de clientes por idade</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.ageDistribution || []} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ageGroup" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="hsl(var(--chart-2))" name="Clientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

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
                margin={{ left: 10 }}
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
      </div>

      {/* Histórico de Avaliações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Avaliações</CardTitle>
          <CardDescription>Todas as avaliações recebidas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Média Geral</TableHead>
                  <TableHead>NPS</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluations?.map((evaluation) => {
                  const avgScore = evaluation.evaluation_answers.length > 0
                    ? evaluation.evaluation_answers.reduce((sum, a) => sum + a.score, 0) / evaluation.evaluation_answers.length
                    : 0;

                  return (
                    <TableRow key={evaluation.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(evaluation.evaluation_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>{evaluation.customer_name}</TableCell>
                      <TableCell>{calculateAge(evaluation.customer_birth_date)} anos</TableCell>
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
                          onClick={() => handleWhatsAppContact(evaluation.customer_whatsapp, evaluation.customer_name)}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          WhatsApp
                        </Button>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
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
          </div>
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
