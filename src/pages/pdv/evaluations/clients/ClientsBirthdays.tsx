import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Cake } from "lucide-react";
import { useCustomerEvaluations } from "@/hooks/use-customer-evaluations";
import { differenceInDays, format, setYear, isAfter, isBefore, addDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
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
}

export default function ClientsBirthdays() {
  const { data: evaluations, isLoading } = useCustomerEvaluations();
  const [period, setPeriod] = useState("7");

  const clients = useMemo<BirthdayClient[]>(() => {
    if (!evaluations?.length) return [];

    const today = startOfDay(new Date());
    const periodDays = parseInt(period);
    const endDate = addDays(today, periodDays);

    // Group by whatsapp, take latest name/birth
    const grouped = new Map<string, { name: string; birthDate: string }>();
    evaluations.forEach((e) => {
      if (!e.customer_birth_date) return;
      const existing = grouped.get(e.customer_whatsapp);
      if (!existing || e.evaluation_date > (existing as any).evalDate) {
        grouped.set(e.customer_whatsapp, { name: e.customer_name, birthDate: e.customer_birth_date });
      }
    });

    const results: BirthdayClient[] = [];

    grouped.forEach(({ name, birthDate }, whatsapp) => {
      const birth = new Date(birthDate);
      if (isNaN(birth.getTime())) return;

      // Next birthday this year or next
      let nextBirthday = setYear(birth, today.getFullYear());
      nextBirthday = startOfDay(nextBirthday);
      if (isBefore(nextBirthday, today)) {
        nextBirthday = setYear(birth, today.getFullYear() + 1);
        nextBirthday = startOfDay(nextBirthday);
      }

      const daysUntil = differenceInDays(nextBirthday, today);

      if (daysUntil >= 0 && daysUntil <= periodDays) {
        const age = nextBirthday.getFullYear() - birth.getFullYear();
        results.push({ name, whatsapp, birthDate, age, daysUntil });
      }
    });

    return results.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [evaluations, period]);

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
            {clients.length} aniversariante{clients.length !== 1 ? "s" : ""} nos próximos {period} dias
          </p>
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
                  <th className="text-center p-3 font-medium text-muted-foreground">Faltam</th>
                </tr>
              </thead>
              <tbody>
                {clients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      <Cake className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      Nenhum aniversariante nos próximos {period} dias
                    </td>
                  </tr>
                ) : (
                  clients.map((c) => (
                    <tr key={c.whatsapp} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{c.name}</td>
                      <td className="p-3 text-muted-foreground">{c.whatsapp}</td>
                      <td className="p-3 text-center text-muted-foreground">
                        {format(new Date(c.birthDate), "dd/MM", { locale: ptBR })}
                      </td>
                      <td className="p-3 text-center text-foreground">{c.age} anos</td>
                      <td className="p-3 text-center">
                        {c.daysUntil === 0 ? (
                          <Badge className="bg-green-500/20 text-green-700 border-green-300">🎂 Hoje!</Badge>
                        ) : (
                          <Badge variant="outline">{c.daysUntil} dia{c.daysUntil !== 1 ? "s" : ""}</Badge>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
