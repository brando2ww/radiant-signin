import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, MessageCircle, Eye } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { EvaluationWithAnswers } from "@/hooks/use-customer-evaluations";

interface Props {
  evaluations: EvaluationWithAnswers[];
  onExportCSV: () => void;
  onViewDetail?: (id: string) => void;
}

export default function RecentResponsesTable({ evaluations, onExportCSV, onViewDetail }: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const perPage = 10;

  const filtered = useMemo(() =>
    evaluations.filter(e =>
      e.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      e.customer_whatsapp.includes(search)
    ),
    [evaluations, search]
  );

  const paged = filtered.slice(page * perPage, (page + 1) * perPage);
  const totalPages = Math.ceil(filtered.length / perPage);

  const getNpsLabel = (score: number | null) => {
    if (score === null) return { text: "—", className: "text-muted-foreground" };
    if (score >= 9) return { text: `${score} 😃`, className: "text-emerald-600 font-bold" };
    if (score >= 7) return { text: `${score} 😐`, className: "text-amber-600 font-bold" };
    return { text: `${score} 😡`, className: "text-destructive font-bold" };
  };

  const getLastComment = (e: EvaluationWithAnswers) => {
    // Priorizar nps_comment, depois comentários das respostas
    if ((e as any).nps_comment) return (e as any).nps_comment;
    const withComment = e.evaluation_answers.filter(a => a.comment);
    return withComment.length > 0 ? withComment[withComment.length - 1].comment : null;
  };

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, "");
    window.open(`https://wa.me/55${cleaned}`, "_blank");
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <CardTitle className="text-base">Respostas Recentes</CardTitle>
          <Button variant="outline" size="sm" onClick={onExportCSV} className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            Exportar CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou whatsapp..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="pl-8 h-9 text-sm"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-3">Horário</th>
                <th className="pb-2 pr-3">Cliente</th>
                <th className="pb-2 pr-3">WhatsApp</th>
                <th className="pb-2 pr-3 text-center">NPS</th>
                <th className="pb-2 pr-3">Comentário</th>
                <th className="pb-2 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paged.length > 0 ? paged.map(e => {
                const npsLabel = getNpsLabel(e.nps_score);
                const comment = getLastComment(e);
                return (
                  <tr key={e.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(e.evaluation_date), "dd/MM HH:mm", { locale: ptBR })}
                    </td>
                    <td className="py-2.5 pr-3 font-medium truncate max-w-[150px]">{e.customer_name}</td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground">{e.customer_whatsapp}</td>
                    <td className={`py-2.5 pr-3 text-center text-xs ${npsLabel.className}`}>{npsLabel.text}</td>
                    <td className="py-2.5 pr-3 text-xs text-muted-foreground truncate max-w-[200px]">
                      {comment || "—"}
                    </td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openWhatsApp(e.customer_whatsapp)}>
                          <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                        </Button>
                        {onViewDetail && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onViewDetail(e.id)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhuma resposta encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
            <span>Mostrando {page * perPage + 1}-{Math.min((page + 1) * perPage, filtered.length)} de {filtered.length}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="hover:text-foreground disabled:opacity-50">← Anterior</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="hover:text-foreground disabled:opacity-50">Próximo →</button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
