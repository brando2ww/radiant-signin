import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Task } from "@/hooks/use-tasks";
import { format } from "date-fns";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  task?: Task;
  defaultDate?: Date;
  defaultHour?: number;
}

const categoryOptions = [
  { value: 'payment', label: 'Pagamento' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'reconciliation', label: 'Reconciliação' },
  { value: 'administrative', label: 'Administrativo' },
  { value: 'personal', label: 'Pessoal' },
  { value: 'other', label: 'Outro' },
];

const priorityOptions = [
  { value: 'low', label: 'Baixa' },
  { value: 'medium', label: 'Média' },
  { value: 'high', label: 'Alta' },
  { value: 'urgent', label: 'Urgente' },
];

const colorOptions = [
  { value: '#f97316', label: 'Laranja' },
  { value: '#3b82f6', label: 'Azul' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#a855f7', label: 'Roxo' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#eab308', label: 'Amarelo' },
];

export function TaskDialog({ open, onOpenChange, onSave, task, defaultDate, defaultHour }: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState<Task['category']>('other');
  const [color, setColor] = useState('#3b82f6');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStartDate(format(task.startTime, "yyyy-MM-dd"));
      setStartTime(format(task.startTime, "HH:mm"));
      setEndDate(format(task.endTime, "yyyy-MM-dd"));
      setEndTime(format(task.endTime, "HH:mm"));
      setCategory(task.category);
      setColor(task.color);
      setPriority(task.priority);
      setLocation(task.location || "");
      setTags(task.tags?.join(", ") || "");
    } else if (defaultDate && defaultHour !== undefined) {
      const date = format(defaultDate, "yyyy-MM-dd");
      const time = `${defaultHour.toString().padStart(2, "0")}:00`;
      setStartDate(date);
      setStartTime(time);
      setEndDate(date);
      setEndTime(`${(defaultHour + 1).toString().padStart(2, "0")}:00`);
    }
  }, [task, defaultDate, defaultHour]);

  const handleSave = () => {
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const taskData: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
      title,
      description: description || undefined,
      startTime: startDateTime,
      endTime: endDateTime,
      category,
      color,
      status: task?.status || 'pending',
      priority,
      location: location || undefined,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : undefined,
      relatedTransactionId: task?.relatedTransactionId,
      relatedBillId: task?.relatedBillId,
    };

    onSave(taskData);
    handleClose();
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setStartDate("");
    setStartTime("");
    setEndDate("");
    setEndTime("");
    setCategory('other');
    setColor('#3b82f6');
    setPriority('medium');
    setLocation("");
    setTags("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa"
            />
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-date">Data de Início *</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="start-time">Hora de Início *</Label>
              <Input
                id="start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="end-date">Data de Término *</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">Hora de Término *</Label>
              <Input
                id="end-time"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as Task['category'])}>
                <SelectTrigger id="category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Prioridade *</Label>
              <Select value={priority} onValueChange={(value) => setPriority(value as Task['priority'])}>
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorityOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="color">Cor</Label>
            <Select value={color} onValueChange={setColor}>
              <SelectTrigger id="color">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colorOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: option.value }}
                      />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Localização</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Adicione um local (opcional)"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Separadas por vírgula (ex: urgente, casa)"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!title || !startDate || !startTime || !endDate || !endTime}>
            {task ? 'Salvar' : 'Criar Tarefa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
