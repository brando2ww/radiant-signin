import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Activity } from "@/hooks/use-crm-activities";

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  activity?: Activity | null;
  onSave: (activity: Partial<Activity>) => void;
}

export function ActivityDialog({ open, onOpenChange, leadId, activity, onSave }: ActivityDialogProps) {
  const [formData, setFormData] = useState({
    type: 'task',
    title: '',
    description: '',
    scheduled_at: '',
    is_completed: false,
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        title: activity.title,
        description: activity.description || '',
        scheduled_at: activity.scheduled_at ? new Date(activity.scheduled_at).toISOString().slice(0, 16) : '',
        is_completed: activity.is_completed || false,
      });
    } else {
      setFormData({
        type: 'task',
        title: '',
        description: '',
        scheduled_at: '',
        is_completed: false,
      });
    }
  }, [activity, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const activityData: Partial<Activity> = {
      lead_id: leadId,
      type: formData.type as Activity['type'],
      title: formData.title,
      description: formData.description || undefined,
      scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : undefined,
      is_completed: formData.is_completed,
    };

    if (activity) {
      activityData.id = activity.id;
    }

    onSave(activityData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{activity ? 'Editar Atividade' : 'Nova Atividade'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">📞 Ligação</SelectItem>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="meeting">🤝 Reunião</SelectItem>
                  <SelectItem value="task">✅ Tarefa</SelectItem>
                  <SelectItem value="proposal">📄 Proposta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Ligar para apresentar proposta"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Detalhes da atividade..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Agendar para</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_completed"
                checked={formData.is_completed}
                onCheckedChange={(checked) => setFormData({ ...formData, is_completed: checked as boolean })}
              />
              <Label htmlFor="is_completed" className="cursor-pointer">
                Marcar como concluída
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {activity ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
