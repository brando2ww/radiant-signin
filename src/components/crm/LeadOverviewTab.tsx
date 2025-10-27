import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, XCircle, TrendingUp, Calendar, Clock } from "lucide-react";
import { Lead } from "@/hooks/use-crm-leads";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LeadOverviewTabProps {
  lead: Lead;
  onMarkWon: () => void;
  onMarkLost: () => void;
}

export function LeadOverviewTab({ lead, onMarkWon, onMarkLost }: LeadOverviewTabProps) {
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

  const daysInPipeline = differenceInDays(new Date(), new Date(lead.created_at));
  const daysSinceLastContact = lead.last_contact_date 
    ? differenceInDays(new Date(), new Date(lead.last_contact_date))
    : null;
  const daysUntilExpectedClose = lead.expected_close_date
    ? differenceInDays(new Date(lead.expected_close_date), new Date())
    : null;

  const stageProgress = {
    'incoming': 20,
    'first_contact': 40,
    'discussion': 60,
    'negotiation': 80,
    'won': 100,
    'lost': 0,
  };

  const progress = stageProgress[lead.stage as keyof typeof stageProgress] || 0;

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Estimado</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lead.estimated_value ? formatCurrency(lead.estimated_value) : 'Não definido'}
            </div>
            {lead.win_probability && (
              <p className="text-xs text-muted-foreground">
                {lead.win_probability}% de probabilidade
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo no Funil</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{daysInPipeline} dias</div>
            {daysSinceLastContact !== null && (
              <p className="text-xs text-muted-foreground">
                Último contato há {daysSinceLastContact} dias
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fechamento Previsto</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {lead.expected_close_date ? (
              <>
                <div className="text-2xl font-bold">
                  {format(new Date(lead.expected_close_date), 'dd MMM', { locale: ptBR })}
                </div>
                {daysUntilExpectedClose !== null && (
                  <p className="text-xs text-muted-foreground">
                    {daysUntilExpectedClose > 0 
                      ? `Em ${daysUntilExpectedClose} dias`
                      : daysUntilExpectedClose === 0
                      ? 'Hoje'
                      : `Atrasado ${Math.abs(daysUntilExpectedClose)} dias`
                    }
                  </p>
                )}
              </>
            ) : (
              <div className="text-xl text-muted-foreground">Não definido</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progresso no Funil */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso no Funil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-sm">
            <span className={lead.stage === 'incoming' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              Novos
            </span>
            <span className={lead.stage === 'first_contact' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              Contato
            </span>
            <span className={lead.stage === 'discussion' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              Discussão
            </span>
            <span className={lead.stage === 'negotiation' ? 'font-semibold text-primary' : 'text-muted-foreground'}>
              Negociação
            </span>
            <span className={lead.stage === 'won' ? 'font-semibold text-success' : lead.stage === 'lost' ? 'font-semibold text-destructive' : 'text-muted-foreground'}>
              Fechamento
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Informações Principais */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Prioridade</span>
            <Badge variant={getPriorityVariant(lead.priority)}>
              {lead.priority === 'low' ? 'Baixa' :
               lead.priority === 'medium' ? 'Média' :
               lead.priority === 'high' ? 'Alta' : 'Urgente'}
            </Badge>
          </div>

          {lead.tags && lead.tags.length > 0 && (
            <div>
              <span className="text-sm text-muted-foreground mb-2 block">Tags</span>
              <div className="flex flex-wrap gap-1">
                {lead.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {lead.source && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Origem</span>
              <span className="text-sm font-medium">{lead.source}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      {lead.stage !== 'won' && lead.stage !== 'lost' && (
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button onClick={onMarkWon} className="flex-1 bg-success text-success-foreground hover:bg-success/90">
                <Trophy className="h-4 w-4 mr-2" />
                Marcar como Ganho
              </Button>
              <Button onClick={onMarkLost} variant="destructive" className="flex-1">
                <XCircle className="h-4 w-4 mr-2" />
                Marcar como Perdido
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
