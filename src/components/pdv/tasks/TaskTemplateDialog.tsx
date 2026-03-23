import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOperationalTasks, type TaskTemplate, type ShiftConfig } from "@/hooks/use-operational-tasks";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shifts: ShiftConfig[];
  template?: TaskTemplate | null;
}

export function TaskTemplateDialog({ open, onOpenChange, shifts, template }: Props) {
  const { createTemplate, updateTemplate } = useOperationalTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shift, setShift] = useState(shifts[0]?.name || "Abertura");
  const [assignedTo, setAssignedTo] = useState("");
  const [requiresPhoto, setRequiresPhoto] = useState(false);

  useEffect(() => {
    if (template) {
      setTitle(template.title);
      setDescription(template.description || "");
      setShift(template.shift);
      setAssignedTo(template.assignedTo || "");
      setRequiresPhoto(template.requiresPhoto);
    } else {
      setTitle("");
      setDescription("");
      setShift(shifts[0]?.name || "Abertura");
      setAssignedTo("");
      setRequiresPhoto(false);
    }
  }, [template, shifts, open]);

  const handleSubmit = () => {
    if (!title.trim()) return;
    if (template) {
      updateTemplate({
        id: template.id,
        title,
        description: description || undefined,
        shift,
        assignedTo: assignedTo || undefined,
        requiresPhoto,
      });
    } else {
      createTemplate({
        title,
        description: description || undefined,
        shift,
        assignedTo: assignedTo || undefined,
        requiresPhoto,
        sortOrder: 0,
        isActive: true,
      });
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{template ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Ligar fogões" />
          </div>
          <div>
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalhes opcionais..." />
          </div>
          <div>
            <Label>Turno</Label>
            <Select value={shift} onValueChange={setShift}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {shifts.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name} ({s.start} - {s.end})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Responsável</Label>
            <Input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="Nome do responsável (opcional)" />
          </div>
          <div className="flex items-center justify-between">
            <Label>Exige foto para concluir</Label>
            <Switch checked={requiresPhoto} onCheckedChange={setRequiresPhoto} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            {template ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
