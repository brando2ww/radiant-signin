import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckSquare, Hash, Thermometer, Camera, Type, Star, ListChecks,
  Plus, Trash2, Copy, ChevronUp, ChevronDown, Pencil, X, AlertTriangle,
  Library, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ITEM_TYPE_LABELS, type ChecklistItemType } from "@/hooks/use-checklists";
import { TemplateLibraryDialog } from "@/components/pdv/checklists/TemplateLibraryDialog";
import type { LocalItem, ChecklistConfig } from "@/pages/pdv/ChecklistEditor";

const TYPE_ICONS: Record<string, React.ElementType> = {
  checkbox: CheckSquare,
  number: Hash,
  temperature: Thermometer,
  photo: Camera,
  text: Type,
  stars: Star,
  multiple_choice: ListChecks,
};

const ALL_TYPES: ChecklistItemType[] = [
  "checkbox", "number", "temperature", "photo", "text", "stars", "multiple_choice" as ChecklistItemType,
];

const TYPE_LABELS_EXTENDED: Record<string, string> = {
  ...ITEM_TYPE_LABELS,
  multiple_choice: "Múltipla escolha",
};

interface Props {
  items: LocalItem[];
  onChange: (items: LocalItem[]) => void;
  onLoadTemplate: (items: LocalItem[]) => void;
  checklistConfig: ChecklistConfig;
}

export function ChecklistItemsList({ items, onChange, onLoadTemplate, checklistConfig }: Props) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [templateOpen, setTemplateOpen] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const required = items.filter((i) => i.is_required).length;
  const critical = items.filter((i) => i.is_critical).length;

  const addItem = (type: ChecklistItemType) => {
    const newItem: LocalItem = {
      title: "",
      item_type: type,
      is_critical: false,
      is_required: true,
      requires_photo: type === ("photo" as ChecklistItemType),
      sort_order: items.length,
      min_value: null,
      max_value: null,
      training_instruction: null,
      training_video_url: null,
      options: type === ("multiple_choice" as ChecklistItemType) ? ["Opção 1", "Opção 2"] : null,
    };
    onChange([...items, newItem]);
    setEditingIdx(items.length);
  };

  const updateItem = (idx: number, patch: Partial<LocalItem>) => {
    const updated = items.map((item, i) => (i === idx ? { ...item, ...patch } : item));
    onChange(updated);
  };

  const removeItem = (idx: number) => {
    onChange(items.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const duplicateItem = (idx: number) => {
    const copy = { ...items[idx], id: undefined, title: `${items[idx].title} (cópia)` };
    const updated = [...items];
    updated.splice(idx + 1, 0, copy);
    onChange(updated);
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= items.length) return;
    const updated = [...items];
    [updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
    onChange(updated);
    setEditingIdx(newIdx);
  };

  useEffect(() => {
    if (editingIdx !== null && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [editingIdx]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold">Itens do Checklist</h2>
          {items.length > 0 && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>{items.length} itens</span>
              <span>·</span>
              <span>{required} obrigatórios</span>
              <span>·</span>
              <span>{critical} críticos</span>
            </div>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setTemplateOpen(true)}>
          <Library className="h-4 w-4 mr-2" /> Templates
        </Button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <ListChecks className="h-10 w-10 opacity-40" />
              <p className="text-sm font-medium">Adicione o primeiro item do checklist</p>
              <p className="text-xs">Use os botões abaixo para criar itens de diferentes tipos</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item, idx) => {
            const Icon = TYPE_ICONS[item.item_type] || CheckSquare;
            const isEditing = editingIdx === idx;

            if (isEditing) {
              return (
                <Card key={idx} className="border-primary">
                  <CardContent className="py-4 px-4 space-y-3">
                    <Input
                      ref={titleInputRef}
                      value={item.title}
                      onChange={(e) => updateItem(idx, { title: e.target.value })}
                      placeholder="Nome/instrução do item"
                      className="text-sm"
                    />

                    {/* Type Selector */}
                    <div className="space-y-1">
                      <Label className="text-xs">Tipo</Label>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_TYPES.map((t) => {
                          const TIcon = TYPE_ICONS[t] || CheckSquare;
                          return (
                            <button
                              key={t}
                              type="button"
                              onClick={() => updateItem(idx, {
                                item_type: t,
                                options: t === ("multiple_choice" as ChecklistItemType) ? (item.options || ["Opção 1", "Opção 2"]) : null,
                                requires_photo: t === ("photo" as ChecklistItemType),
                              })}
                              className={cn(
                                "flex items-center gap-1.5 rounded border px-2 py-1 text-xs transition-colors",
                                item.item_type === t
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground hover:bg-muted"
                              )}
                            >
                              <TIcon className="h-3.5 w-3.5" />
                              {TYPE_LABELS_EXTENDED[t]}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Temperature fields */}
                    {item.item_type === "temperature" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-xs">Mín (°C)</Label>
                          <Input
                            type="number"
                            value={item.min_value ?? ""}
                            onChange={(e) => updateItem(idx, { min_value: e.target.value ? Number(e.target.value) : null })}
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Máx (°C)</Label>
                          <Input
                            type="number"
                            value={item.max_value ?? ""}
                            onChange={(e) => updateItem(idx, { max_value: e.target.value ? Number(e.target.value) : null })}
                          />
                        </div>
                      </div>
                    )}

                    {/* Multiple choice options */}
                    {item.item_type === ("multiple_choice" as ChecklistItemType) && (
                      <div className="space-y-2">
                        <Label className="text-xs">Opções</Label>
                        {(item.options || []).map((opt, oi) => (
                          <div key={oi} className="flex gap-2">
                            <Input
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(item.options || [])];
                                newOpts[oi] = e.target.value;
                                updateItem(idx, { options: newOpts });
                              }}
                              className="text-sm"
                              placeholder={`Opção ${oi + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 shrink-0"
                              onClick={() => {
                                const newOpts = (item.options || []).filter((_, i) => i !== oi);
                                updateItem(idx, { options: newOpts });
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateItem(idx, { options: [...(item.options || []), `Opção ${(item.options || []).length + 1}`] })}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> Opção
                        </Button>
                      </div>
                    )}

                    {/* Switches */}
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={item.is_required} onCheckedChange={(v) => updateItem(idx, { is_required: v })} />
                        Obrigatório
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={item.is_critical} onCheckedChange={(v) => updateItem(idx, { is_critical: v })} />
                        Crítico
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <Switch checked={item.requires_photo} onCheckedChange={(v) => updateItem(idx, { requires_photo: v })} />
                        Foto obrigatória
                      </label>
                    </div>

                    {/* Training */}
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground font-medium">Modo treinamento</summary>
                      <div className="mt-2 space-y-2">
                        <Textarea
                          placeholder="Instrução para o colaborador..."
                          value={item.training_instruction || ""}
                          onChange={(e) => updateItem(idx, { training_instruction: e.target.value || null })}
                          rows={2}
                          className="text-xs"
                        />
                        <Input
                          placeholder="URL do vídeo explicativo"
                          value={item.training_video_url || ""}
                          onChange={(e) => updateItem(idx, { training_video_url: e.target.value || null })}
                          className="text-xs"
                        />
                      </div>
                    </details>

                    {/* Actions */}
                    <div className="flex justify-between pt-1">
                      <Button variant="destructive" size="sm" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" /> Excluir
                      </Button>
                      <Button size="sm" onClick={() => setEditingIdx(null)} disabled={!item.title.trim()}>
                        Concluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            }

            return (
              <Card
                key={idx}
                className="group hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => setEditingIdx(idx)}
              >
                <CardContent className="py-2.5 px-3 flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 opacity-40" />
                  <div
                    className="h-7 w-7 rounded flex items-center justify-center shrink-0"
                    style={{ backgroundColor: checklistConfig.color + "20", color: checklistConfig.color }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.title || "(sem título)"}</p>
                    <p className="text-xs text-muted-foreground">{TYPE_LABELS_EXTENDED[item.item_type]}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {item.is_critical && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Crítico</Badge>
                    )}
                    {item.is_required && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Obrigatório</Badge>
                    )}
                  </div>
                  {/* Hover Controls */}
                  <div className="hidden group-hover:flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(idx, -1)} disabled={idx === 0}>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => moveItem(idx, 1)} disabled={idx === items.length - 1}>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateItem(idx)}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(idx)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Quick Add Bar */}
      <div className="rounded-lg border border-dashed border-border p-3">
        <p className="text-xs text-muted-foreground mb-2 font-medium">Adicionar item:</p>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TYPES.map((t) => {
            const TIcon = TYPE_ICONS[t] || CheckSquare;
            return (
              <Button
                key={t}
                variant="outline"
                size="sm"
                className="text-xs h-8"
                onClick={() => addItem(t)}
              >
                <TIcon className="h-3.5 w-3.5 mr-1.5" />
                {TYPE_LABELS_EXTENDED[t]}
              </Button>
            );
          })}
        </div>
      </div>

      <TemplateLibraryDialog
        open={templateOpen}
        onOpenChange={setTemplateOpen}
        onLoadItems={onLoadTemplate}
        editorMode
      />
    </div>
  );
}
