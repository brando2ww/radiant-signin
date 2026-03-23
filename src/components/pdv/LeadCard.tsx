import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, UserPlus, Star } from "lucide-react";
import { format, parseISO } from "date-fns";
import type { CustomerLead } from "@/hooks/use-pdv-customers";

interface LeadCardProps {
  lead: CustomerLead;
  onConvert: (lead: CustomerLead) => void;
  isConverting: boolean;
  alreadyCustomer: boolean;
}

function npsColor(score: number | null) {
  if (score === null) return "secondary";
  if (score >= 9) return "default";
  if (score >= 7) return "secondary";
  return "destructive";
}

function npsLabel(score: number | null) {
  if (score === null) return "—";
  if (score >= 9) return "Promotor";
  if (score >= 7) return "Neutro";
  return "Detrator";
}

export function LeadCard({ lead, onConvert, isConverting, alreadyCustomer }: LeadCardProps) {
  const formattedDate = (() => {
    try {
      return format(parseISO(lead.last_evaluation_date), "dd/MM/yyyy");
    } catch {
      return lead.last_evaluation_date;
    }
  })();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-foreground">{lead.customer_name}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" />
              <span>{lead.customer_whatsapp}</span>
            </div>
          </div>
          {lead.last_nps !== null && (
            <Badge variant={npsColor(lead.last_nps)} className="gap-1">
              <Star className="h-3 w-3" />
              NPS: {lead.last_nps} · {npsLabel(lead.last_nps)}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Última avaliação: {formattedDate}</span>
          <span>{lead.evaluation_count} avaliação(ões)</span>
        </div>

        {lead.campaign_names.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {lead.campaign_names.map((name) => (
              <Badge key={name} variant="outline" className="text-xs">{name}</Badge>
            ))}
          </div>
        )}

        <div className="pt-1 border-t">
          {alreadyCustomer ? (
            <Badge variant="secondary" className="text-xs">Já é cliente</Badge>
          ) : (
            <Button size="sm" variant="outline" onClick={() => onConvert(lead)} disabled={isConverting}>
              <UserPlus className="h-4 w-4 mr-1" />
              Converter em Cliente
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
