import { useState } from "react";
import { Plus, FileText, Send, CheckCircle2, Clock, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsivePageHeader } from "@/components/ui/responsive-page-header";
import { usePDVQuotations } from "@/hooks/use-pdv-quotations";
import { QuotationRequestCard } from "@/components/pdv/purchases/QuotationRequestCard";
import { QuotationRequestDialog } from "@/components/pdv/purchases/QuotationRequestDialog";

export default function Quotations() {
  const { quotations, isLoading, stats } = usePDVQuotations();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.request_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.items?.some((item) =>
        item.ingredient?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesStatus = statusFilter === "all" || q.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const statCards = [
    {
      title: "Total de Cotações",
      value: stats.total,
      icon: FileText,
    },
    {
      title: "Pendentes",
      value: stats.pending,
      icon: Clock,
    },
    {
      title: "Em Andamento",
      value: stats.inProgress,
      icon: Send,
    },
    {
      title: "Finalizadas",
      value: stats.completed,
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      <ResponsivePageHeader
        title="Cotações"
        subtitle="Solicite cotações de múltiplos fornecedores via WhatsApp"
      >
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Cotação
        </Button>
      </ResponsivePageHeader>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className="h-4 w-4" />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <p className="text-2xl font-bold">{stat.value}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por número ou ingrediente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os Status</SelectItem>
            <SelectItem value="pending">Pendentes</SelectItem>
            <SelectItem value="in_progress">Em Andamento</SelectItem>
            <SelectItem value="completed">Finalizadas</SelectItem>
            <SelectItem value="cancelled">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quotation List */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filteredQuotations.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma cotação encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchQuery || statusFilter !== "all"
                ? "Tente ajustar os filtros de busca"
                : "Crie sua primeira cotação para começar"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Cotação
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredQuotations.map((quotation) => (
            <QuotationRequestCard key={quotation.id} quotation={quotation} />
          ))}
        </div>
      )}

      <QuotationRequestDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
