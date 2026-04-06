import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Search } from "lucide-react";
import { useCustomerEvaluations } from "@/hooks/use-customer-evaluations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface GroupedClient {
  name: string;
  whatsapp: string;
  totalEvaluations: number;
  avgNps: number | null;
  lastEvaluation: string;
  npsCategory: "promoter" | "neutral" | "detractor" | "none";
}

const PER_PAGE = 10;

export default function ClientsManagement() {
  const { data: evaluations, isLoading } = useCustomerEvaluations();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const clients = useMemo<GroupedClient[]>(() => {
    if (!evaluations?.length) return [];

    const grouped = new Map<string, typeof evaluations>();
    evaluations.forEach((e) => {
      const key = e.customer_whatsapp;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(e);
    });

    return Array.from(grouped.entries())
      .map(([whatsapp, evals]) => {
        const sorted = [...evals].sort((a, b) => b.evaluation_date.localeCompare(a.evaluation_date));
        const npsScores = evals.filter((e) => e.nps_score !== null).map((e) => e.nps_score!);
        const avgNps = npsScores.length > 0 ? npsScores.reduce((s, v) => s + v, 0) / npsScores.length : null;

        let npsCategory: GroupedClient["npsCategory"] = "none";
        if (avgNps !== null) {
          if (avgNps >= 9) npsCategory = "promoter";
          else if (avgNps >= 7) npsCategory = "neutral";
          else npsCategory = "detractor";
        }

        return {
          name: sorted[0].customer_name,
          whatsapp,
          totalEvaluations: evals.length,
          avgNps,
          lastEvaluation: sorted[0].evaluation_date,
          npsCategory,
        };
      })
      .sort((a, b) => b.totalEvaluations - a.totalEvaluations);
  }, [evaluations]);

  const filtered = useMemo(() => {
    if (!search.trim()) return clients;
    const q = search.toLowerCase();
    return clients.filter(
      (c) => c.name.toLowerCase().includes(q) || c.whatsapp.includes(q)
    );
  }, [clients, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const npsBadge = (cat: GroupedClient["npsCategory"], avg: number | null) => {
    if (cat === "none") return <Badge variant="outline">N/A</Badge>;
    const label = avg !== null ? avg.toFixed(1) : "";
    if (cat === "promoter") return <Badge className="bg-green-500/20 text-green-700 border-green-300">{label} Promotor</Badge>;
    if (cat === "neutral") return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-300">{label} Neutro</Badge>;
    return <Badge className="bg-red-500/20 text-red-700 border-red-300">{label} Detrator</Badge>;
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gestão de Clientes</h1>
        <p className="text-sm text-muted-foreground">
          {filtered.length} cliente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou WhatsApp..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="pl-10"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Nome</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">WhatsApp</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Avaliações</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">NPS Médio</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Última Avaliação</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-muted-foreground">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => (
                    <tr key={c.whatsapp} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{c.name}</td>
                      <td className="p-3 text-muted-foreground">{c.whatsapp}</td>
                      <td className="p-3 text-center text-foreground">{c.totalEvaluations}</td>
                      <td className="p-3 text-center">{npsBadge(c.npsCategory, c.avgNps)}</td>
                      <td className="p-3 text-muted-foreground">
                        {format(new Date(c.lastEvaluation), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={page === pageNum}
                    onClick={() => setPage(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            <PaginationItem>
              <PaginationNext
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
