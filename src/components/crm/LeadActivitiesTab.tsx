import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Phone, Mail, Calendar, CheckCircle2, Circle, Edit, Trash } from "lucide-react";
import { useActivitiesByLead, useCreateActivity, useUpdateActivity, useCompleteActivity, Activity } from "@/hooks/use-crm-activities";
import { ActivityDialog } from "./ActivityDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LeadActivitiesTabProps {
  leadId: string;
}

export function LeadActivitiesTab({ leadId }: LeadActivitiesTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const { data: activities = [], isLoading } = useActivitiesByLead(leadId);
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();
  const completeMutation = useCompleteActivity();

  const handleSave = (activityData: Partial<Activity>) => {
    if (editingActivity) {
      updateMutation.mutate({ id: editingActivity.id, lead_id: leadId, ...activityData });
    } else {
      createMutation.mutate(activityData as Omit<Activity, 'id' | 'user_id' | 'created_at' | 'updated_at'>);
    }
    setEditingActivity(null);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setDialogOpen(true);
  };

  const handleComplete = (activityId: string) => {
    completeMutation.mutate({ id: activityId, lead_id: leadId });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'call':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      default:
        return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getActivityLabel = (type: string) => {
    const labels = {
      call: 'Ligação',
      email: 'Email',
      meeting: 'Reunião',
      task: 'Tarefa',
      proposal: 'Proposta',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !activity.is_completed;
    if (filter === 'completed') return activity.is_completed;
    return true;
  });

  if (isLoading) {
    return <div>Carregando atividades...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as any)} className="w-auto">
          <TabsList>
            <TabsTrigger value="all">Todas ({activities.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pendentes ({activities.filter(a => !a.is_completed).length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas ({activities.filter(a => a.is_completed).length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Button
          onClick={() => {
            setEditingActivity(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Atividade
        </Button>
      </div>

      <div className="space-y-3">
        {filteredActivities.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            {filter === 'all' && 'Nenhuma atividade registrada'}
            {filter === 'pending' && 'Nenhuma atividade pendente'}
            {filter === 'completed' && 'Nenhuma atividade concluída'}
          </Card>
        ) : (
          filteredActivities.map((activity) => (
            <Card key={activity.id} className={`p-4 ${activity.is_completed ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {activity.is_completed ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        {getActivityIcon(activity.type)}
                        {getActivityLabel(activity.type)}
                      </Badge>
                      <h4 className={`font-medium ${activity.is_completed ? 'line-through' : ''}`}>
                        {activity.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-1">
                      {!activity.is_completed && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => handleComplete(activity.id)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(activity)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {activity.description && (
                    <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {activity.scheduled_at && (
                      <span>
                        Agendado: {format(new Date(activity.scheduled_at), "dd MMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    )}
                    {activity.completed_at && (
                      <span>
                        Concluído: {format(new Date(activity.completed_at), "dd MMM 'às' HH:mm", { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <ActivityDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        leadId={leadId}
        activity={editingActivity}
        onSave={handleSave}
      />
    </div>
  );
}
