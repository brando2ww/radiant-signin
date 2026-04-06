import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cake, Eye, Search } from "lucide-react";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { useCustomerEvaluations } from "@/hooks/use-customer-evaluations";
import type { EvaluationWithAnswers } from "@/hooks/use-customer-evaluations";
import { differenceInDays, format, setYear, isBefore, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatPhoneForWhatsApp } from "@/lib/whatsapp-message";
import ClientDetailDialog from "@/components/pdv/evaluations/ClientDetailDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BirthdayClient {
  name: string;
  whatsapp: string;
  birthDate: string;
  age: number;
  daysUntil: number;
  firstEvaluation: string;
  lastEvaluation: string;
  totalEvaluations: number;
  avgNps: number | null;
  npsCategory: "promoter" | "neutral" | "detractor" | "none";
  evaluations: EvaluationWithAnswers[];
}

export default function ClientsBirthdays() {
  const { data: evaluations, isLoading } = useCustomerEvaluations();
  const [period, setPeriod] = useState("7");
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<BirthdayClient | null>(null);

  const clients = useMemo<BirthdayClient[]>(() => {
    if (!evaluations?.length) return [];

    const today = startOfDay(new Date());
    const periodDays = parseInt(period);

    // Group by whatsapp
    const grouped = new Map<string, { name: string; birthDate: string; evaluations: EvaluationWithAnswers[] }>();
    evaluations.forEach((e) => {
      if (!e.customer_birth_date) return;
      const existing = grouped.get(e.customer_whatsapp);
      if (existing) {
        existing.evaluations.push(e);
        if (e.evaluation_date > existing.evaluations[0].evaluation_date) {
          existing.name = e.customer_name;
        }
      } else {
        grouped.set(e.customer_whatsapp, { name: e.customer_name, birthDate: e.customer_birth_date, evaluations: [e] });
      }
    });

    const results: BirthdayClient[] = [];

    grouped.forEach(({ name, birthDate, evaluations: evals }, whatsapp) => {
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return;

      let nextBirthday = setYear(birth, today.getFullYear());
      nextBirthday = startOfDay(nextBirthday);
      if (isBefore(nextBirthday, today)) {
        nextBirthday = setYear(birth, today.getFullYear() + 1);
        nextBirthday = startOfDay(nextBirthday);
      }

      const daysUntil = differenceInDays(nextBirthday, today);

      if (daysUntil >= 0 && daysUntil <= periodDays) {
        const age = nextBirthday.getFullYear() - birth.getFullYear();
        const sorted = [...evals].sort((a, b) => a.evaluation_date.localeCompare(b.evaluation_date));
        const npsScores = evals.filter((e) => e.nps_score !== null).map((e) => e.nps_score!);
        const avgNps = npsScores.length > 0 ? npsScores.reduce((s, n) => s + n, 0) / npsScores.length : null;
        const npsCategory = avgNps === null ? "none" : avgNps >= 9 ? "promoter" : avgNps >= 7 ? "neutral" : "detractor";

        results.push({
          name,
          whatsapp,
          birthDate,
          age,
          daysUntil,
          firstEvaluation: sorted[0].evaluation_date,
          lastEvaluation: sorted[sorted.length - 1].evaluation_date,
          totalEvaluations: evals.length,
          avgNps,
          npsCategory,
          evaluations: sorted,
        });
      }
    });

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [evaluations, period]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter((c) => c.name.toLowerCase().includes(q) || c.whatsapp.includes(q));
  }, [clients, search]);

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Aniversariantes</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} aniversariante{filtered.length !== 1 ? "s" : ""} nos próximos {period} dias
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar nome ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Próximos 7 dias</SelectItem>
              <SelectItem value="15">Próximos 15 dias</SelectItem>
              <SelectItem value="30">Próximos 30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Aniversário</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Idade</th>
                  <th className="text-center p-3 font-medium text-muted-foreground hidden md:table-cell">Cadastro</th>
                  <th className="text-center p-3 font-medium text-muted-foreground hidden md:table-cell">Últ. Contato</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Faltam</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">
                      <Cake className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      Nenhum aniversariante nos próximos {period} dias
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => (
                    <tr key={c.whatsapp} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{c.name}</td>
                      <td className="p-3 text-muted-foreground">{c.whatsapp}</td>
                      <td className="p-3 text-center text-muted-foreground">
                        {format(new Date(c.birthDate), "dd/MM", { locale: ptBR })}
                      </td>
                      <td className="p-3 text-center text-foreground">{c.age} anos</td>
                      <td className="p-3 text-center text-muted-foreground hidden md:table-cell">
                        {format(new Date(c.firstEvaluation), "dd/MM/yy", { locale: ptBR })}
                      </td>
                      <td className="p-3 text-center text-muted-foreground hidden md:table-cell">
                        {format(new Date(c.lastEvaluation), "dd/MM/yy", { locale: ptBR })}
                      </td>
                      <td className="p-3 text-center">
                        {c.daysUntil === 0 ? (
                          <Badge className="bg-green-500/20 text-green-700 border-green-300">🎂 Hoje!</Badge>
                        ) : (
                          <Badge variant="outline">{c.daysUntil} dia{c.daysUntil !== 1 ? "s" : ""}</Badge>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => window.open(`https://wa.me/${formatPhoneForWhatsApp(c.whatsapp)}`, "_blank")}
                            title="WhatsApp"
                          >
                            <WhatsAppIcon size={16} className="text-green-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedClient(c)}
                            title="Detalhes"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ClientDetailDialog
        open={!!selectedClient}
        onOpenChange={(open) => !open && setSelectedClient(null)}
        client={
          selectedClient
            ? {
                name: selectedClient.name,
                whatsapp: selectedClient.whatsapp,
                birthDate: selectedClient.birthDate,
                totalEvaluations: selectedClient.totalEvaluations,
                avgNps: selectedClient.avgNps,
                firstEvaluation: selectedClient.firstEvaluation,
                lastEvaluation: selectedClient.lastEvaluation,
                npsCategory: selectedClient.npsCategory,
                evaluations: selectedClient.evaluations,
              }
            : null
        }
      />
    </div>
  );
}
