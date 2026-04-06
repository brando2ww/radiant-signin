import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Eye } from "lucide-react";
import { useCustomerEvaluations, EvaluationWithAnswers } from "@/hooks/use-customer-evaluations";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { WhatsAppIcon } from "@/components/icons/WhatsAppIcon";
import { formatPhoneForWhatsApp } from "@/lib/whatsapp-message";
import ClientDetailDialog from "@/components/pdv/evaluations/ClientDetailDialog";
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
  birthDate: string | null;
  totalEvaluations: number;
  avgNps: number | null;
  firstEvaluation: string;
  lastEvaluation: string;
  npsCategory: "promoter" | "neutral" | "detractor" | "none";
  evaluations: EvaluationWithAnswers[];
}

const PER_PAGE = 10;

export default function ClientsManagement() {
  const { data: evaluations, isLoading } = useCustomerEvaluations();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedClient, setSelectedClient] = useState<GroupedClient | null>(null);

  const clients = useMemo<GroupedClient[]>(() => {
    if (!evaluations?.length) return [];

    const grouped = new Map<string, EvaluationWithAnswers[]>();
    evaluations.forEach((e) => {
      const key = e.customer_whatsapp;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(e);
    });

    return Array.from(grouped.entries())
      .map(([whatsapp, evals]) => {
        const sorted = [...evals].sort((a, b) => b.evaluation_date.localeCompare(a.evaluation_date));
        const sortedAsc = [...evals].sort((a, b) => a.evaluation_date.localeCompare(b.evaluation_date));
        const npsScores = evals.filter((e) => e.nps_score !== null).map((e) => e.nps_score!);
        const avgNps = npsScores.length > 0 ? npsScores.reduce((s, v) => s + v, 0) / npsScores.length : null;

        let npsCategory: GroupedClient["npsCategory"] = "none";
        if (avgNps !== null) {
          if (avgNps >= 9) npsCategory = "promoter";
          else if (avgNps >= 7) npsCategory = "neutral";
          else npsCategory = "detractor";
        }

        // Get birth date from any evaluation that has it
        const birthDate = evals.find((e) => e.customer_birth_date)?.customer_birth_date ?? null;

        return {
          name: sorted[0].customer_name,
          whatsapp,
          birthDate,
          totalEvaluations: evals.length,
          avgNps,
          firstEvaluation: sortedAsc[0].evaluation_date,
          lastEvaluation: sorted[0].evaluation_date,
          npsCategory,
          evaluations: sorted,
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

  const handleWhatsApp = (whatsapp: string) => {
    const phone = formatPhoneForWhatsApp(whatsapp);
    window.open(`https://wa.me/${phone}`, "_blank");
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
        <h1 className="text-2xl font-bold text-foreground">Base de Clientes</h1>
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
                  <th className="text-left p-3 font-medium text-muted-foreground hidden md:table-cell">Aniversário</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Avaliações</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">NPS Médio</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Cadastro</th>
                  <th className="text-left p-3 font-medium text-muted-foreground hidden lg:table-cell">Último Contato</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center p-8 text-muted-foreground">
                      Nenhum cliente encontrado
                    </td>
                  </tr>
                ) : (
                  paginated.map((c) => (
                    <tr key={c.whatsapp} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{c.name}</td>
                      <td className="p-3 text-muted-foreground">{c.whatsapp}</td>
                      <td className="p-3 text-muted-foreground hidden md:table-cell">
                        {c.birthDate
                          ? format(new Date(c.birthDate), "dd/MM/yyyy", { locale: ptBR })
                          : "—"}
                      </td>
                      <td className="p-3 text-center text-foreground">{c.totalEvaluations}</td>
                      <td className="p-3 text-center">{npsBadge(c.npsCategory, c.avgNps)}</td>
                      <td className="p-3 text-muted-foreground hidden lg:table-cell">
                        {format(new Date(c.firstEvaluation), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="p-3 text-muted-foreground hidden lg:table-cell">
                        {format(new Date(c.lastEvaluation), "dd/MM/yyyy", { locale: ptBR })}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleWhatsApp(c.whatsapp)}
                            title="Abrir WhatsApp"
                          >
                            <WhatsAppIcon size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedClient(c)}
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
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

      <ClientDetailDialog
        open={!!selectedClient}
        onOpenChange={(open) => { if (!open) setSelectedClient(null); }}
        client={selectedClient}
      />
    </div>
  );
}
