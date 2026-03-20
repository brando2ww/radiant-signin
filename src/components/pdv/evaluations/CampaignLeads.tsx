import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Users, Phone, Calendar } from "lucide-react";
import { useCampaignResponses } from "@/hooks/use-evaluation-campaigns";

interface Props {
  campaignId: string;
}

function npsLabel(score: number | null) {
  if (score === null || score === undefined) return null;
  if (score >= 9) return <Badge className="bg-green-600 text-white text-xs">Promotor</Badge>;
  if (score >= 7) return <Badge className="bg-yellow-500 text-white text-xs">Neutro</Badge>;
  return <Badge variant="destructive" className="text-xs">Detrator</Badge>;
}

export function CampaignLeads({ campaignId }: Props) {
  const { data: responses, isLoading } = useCampaignResponses(campaignId);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando leads...</p>;

  if (!responses || responses.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground space-y-2">
        <Users className="h-10 w-10 mx-auto opacity-40" />
        <p className="font-medium">Nenhum lead captado</p>
        <p className="text-sm">Os dados dos clientes aparecerão aqui após receberem respostas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium">{responses.length} leads captados</span>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="hidden md:table-cell">Nascimento</TableHead>
                <TableHead className="hidden md:table-cell">Data</TableHead>
                <TableHead>NPS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {responses.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.customer_name}</TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      {r.customer_whatsapp}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {r.customer_birth_date
                        ? new Date(r.customer_birth_date + "T00:00:00").toLocaleDateString("pt-BR")
                        : "—"}
                    </span>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    {npsLabel(r.nps_score)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
