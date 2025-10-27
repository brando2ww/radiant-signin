import { Clock, Mail, Phone, MoreVertical, Edit, Trash, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Lead } from "@/hooks/use-crm-leads";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

interface LeadCardProps {
  lead: Lead;
  onEdit: () => void;
  onDelete: () => void;
  onViewDetails: () => void;
  isDragging?: boolean;
}

export function LeadCard({ lead, onEdit, onDelete, onViewDetails, isDragging }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });

  const style = transform ? {
    transform: CSS.Transform.toString(transform),
  } : undefined;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'border-l-gray-400',
      medium: 'border-l-blue-500',
      high: 'border-l-orange-500',
      urgent: 'border-l-red-500',
    };
    return colors[priority as keyof typeof colors] || colors.medium;
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

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 cursor-move hover:shadow-lg transition-all border-l-4 ${getPriorityColor(lead.priority)} ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={(e) => {
        // Only trigger onViewDetails if not clicking on dropdown trigger
        if (!(e.target as HTMLElement).closest('[role="button"]')) {
          onViewDetails();
        }
      }}
    >
      <div className="flex items-start gap-2 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={lead.avatar_url} />
          <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">{lead.name}</h4>
          {lead.company && (
            <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            onClick={(e) => e.stopPropagation()}
            className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded"
          >
            <MoreVertical className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Ver detalhes
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-destructive"
            >
              <Trash className="mr-2 h-4 w-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h5 className="font-semibold text-sm mb-2 line-clamp-2">{lead.project_title}</h5>

      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-primary">
          {lead.estimated_value ? formatCurrency(lead.estimated_value) : 'Não definido'}
        </span>
        <Badge variant={getPriorityVariant(lead.priority)} className="text-xs">
          {lead.priority === 'low' ? 'Baixa' :
           lead.priority === 'medium' ? 'Média' :
           lead.priority === 'high' ? 'Alta' : 'Urgente'}
        </Badge>
      </div>

      {lead.tags && lead.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {lead.tags.slice(0, 2).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {lead.tags.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{lead.tags.length - 2}
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {lead.email && <Mail className="h-3 w-3" />}
          {lead.phone && <Phone className="h-3 w-3" />}
        </div>
        {lead.expected_close_date && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {format(new Date(lead.expected_close_date), 'dd/MM', { locale: ptBR })}
          </span>
        )}
      </div>
    </Card>
  );
}
