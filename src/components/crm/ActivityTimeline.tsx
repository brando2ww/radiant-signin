import { useActivitiesByLead } from "@/hooks/use-crm-activities";
import { Phone, Mail, Calendar, FileText, CheckSquare, FileSignature } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityTimelineProps {
  leadId: string;
}

export function ActivityTimeline({ leadId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useActivitiesByLead(leadId);

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando atividades...</div>;
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        Nenhuma atividade registrada ainda
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    const icons = {
      call: Phone,
      email: Mail,
      meeting: Calendar,
      note: FileText,
      task: CheckSquare,
      proposal: FileSignature,
    };
    const Icon = icons[type as keyof typeof icons] || FileText;
    return <Icon className="h-4 w-4" />;
  };

  const getActivityColor = (type: string) => {
    const colors = {
      call: 'bg-blue-100 text-blue-700',
      email: 'bg-purple-100 text-purple-700',
      meeting: 'bg-green-100 text-green-700',
      note: 'bg-gray-100 text-gray-700',
      task: 'bg-orange-100 text-orange-700',
      proposal: 'bg-pink-100 text-pink-700',
    };
    return colors[type as keyof typeof colors] || colors.note;
  };

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div
              className={`p-2 rounded-full ${getActivityColor(activity.type)}`}
            >
              {getActivityIcon(activity.type)}
            </div>
            {index < activities.length - 1 && (
              <div className="w-0.5 h-full bg-border mt-2" />
            )}
          </div>

          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <h5 className="font-medium text-sm">{activity.title}</h5>
                <p className="text-xs text-muted-foreground mt-1">
                  {format(new Date(activity.created_at), "dd 'de' MMMM 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </p>
              </div>
              {activity.is_completed && (
                <span className="text-xs text-green-600 font-medium">Concluída</span>
              )}
            </div>
            {activity.description && (
              <p className="text-sm text-muted-foreground mt-2">{activity.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
