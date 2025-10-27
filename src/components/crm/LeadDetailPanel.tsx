import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Lead, useUpdateLead } from "@/hooks/use-crm-leads";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, Building, Calendar, DollarSign, Edit, Trophy, X } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import confetti from "canvas-confetti";
import { ActivityTimeline } from "./ActivityTimeline";

interface LeadDetailPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  onEdit: () => void;
}

export function LeadDetailPanel({ open, onOpenChange, lead, onEdit }: LeadDetailPanelProps) {
  if (!lead) return null;

  const updateMutation = useUpdateLead();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPriorityVariant = (priority: string): "default" | "secondary" | "destructive" | "outline" => {
    const variants = {
      low: 'secondary' as const,
      medium: 'outline' as const,
      high: 'default' as const,
      urgent: 'destructive' as const,
    };
    return variants[priority as keyof typeof variants] || 'outline';
  };

  const fireConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleWin = async () => {
    await updateMutation.mutateAsync({
      id: lead.id,
      stage: 'won',
      status: 'converted',
      closed_date: new Date().toISOString(),
    });
    fireConfetti();
    setTimeout(() => onOpenChange(false), 1000);
  };

  const handleLoss = async () => {
    await updateMutation.mutateAsync({
      id: lead.id,
      stage: 'lost',
      status: 'archived',
      closed_date: new Date().toISOString(),
    });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Detalhes do Lead</span>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={lead.avatar_url} />
              <AvatarFallback className="text-lg">{lead.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{lead.name}</h3>
              {lead.position && lead.company && (
                <p className="text-sm text-muted-foreground">
                  {lead.position} na {lead.company}
                </p>
              )}
              <div className="flex gap-2 mt-2">
                <Badge variant={getPriorityVariant(lead.priority)}>
                  {lead.priority === 'low' ? 'Baixa' :
                   lead.priority === 'medium' ? 'Média' :
                   lead.priority === 'high' ? 'Alta' : 'Urgente'}
                </Badge>
                {lead.tags?.map((tag, index) => (
                  <Badge key={index} variant="outline">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Informações de Contato</h4>
            {lead.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${lead.email}`} className="hover:underline">
                  {lead.email}
                </a>
              </div>
            )}
            {lead.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${lead.phone}`} className="hover:underline">
                  {lead.phone}
                </a>
              </div>
            )}
            {lead.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{lead.company}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Sobre o Projeto</h4>
            <h5 className="font-medium">{lead.project_title}</h5>
            {lead.project_description && (
              <p className="text-sm text-muted-foreground">{lead.project_description}</p>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Valor Estimado</p>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-lg">
                  {lead.estimated_value ? formatCurrency(lead.estimated_value) : 'Não definido'}
                </span>
              </div>
            </div>
            {lead.expected_close_date && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Fechamento Previsto</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {format(new Date(lead.expected_close_date), "dd 'de' MMMM", { locale: ptBR })}
                  </span>
                </div>
              </div>
            )}
          </div>

          {lead.stage !== 'won' && lead.stage !== 'lost' && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Decisão Final</h4>
                <div className="flex gap-3">
                  <Button
                    onClick={handleWin}
                    className="flex-1 bg-success text-success-foreground hover:bg-success/90"
                    disabled={updateMutation.isPending}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Ganho
                  </Button>
                  <Button
                    onClick={handleLoss}
                    variant="destructive"
                    className="flex-1"
                    disabled={updateMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Perdido
                  </Button>
                </div>
              </div>
            </>
          )}

          {(lead.stage === 'won' || lead.stage === 'lost') && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Status Final</p>
                <Badge variant={lead.stage === 'won' ? 'default' : 'secondary'} className={lead.stage === 'won' ? 'bg-success text-success-foreground' : ''}>
                  {lead.stage === 'won' ? '🏆 Ganho' : '❌ Perdido'}
                </Badge>
                {lead.closed_date && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Fechado em {format(new Date(lead.closed_date), "dd/MM/yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </>
          )}

          {lead.source && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Origem do Lead</p>
              <Badge variant="secondary">{lead.source}</Badge>
            </div>
          )}

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold">Histórico de Atividades</h4>
            <ActivityTimeline leadId={lead.id} />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
