import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, List, CheckSquare, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = [
  {
    value: "stars",
    label: "Estrelas",
    description: "Avaliação de 1 a 5 estrelas",
    icon: Star,
    color: "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/30",
    iconColor: "text-yellow-500",
  },
  {
    value: "single_choice",
    label: "Escolha Única",
    description: "Cliente escolhe uma opção",
    icon: List,
    color: "border-blue-400 bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-500",
  },
  {
    value: "multiple_choice",
    label: "Múltipla Escolha",
    description: "Cliente escolhe várias opções",
    icon: CheckSquare,
    color: "border-purple-400 bg-purple-50 dark:bg-purple-950/30",
    iconColor: "text-purple-500",
  },
] as const;

const PLACEHOLDERS: Record<string, string> = {
  stars: "Ex: Como avalia a qualidade da comida?",
  single_choice: "Ex: Como conheceu nosso restaurante?",
  multiple_choice: "Ex: O que mais gostou na experiência?",
};

interface QuestionInitialData {
  id: string;
  question_text: string;
  question_type: string;
  options?: string[];
}

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    question_text: string;
    question_type: string;
    options?: string[];
  }) => void;
  isPending?: boolean;
  initialData?: QuestionInitialData | null;
}

export function QuestionFormDialog({ open, onOpenChange, onSubmit, isPending, initialData }: QuestionFormDialogProps) {
  const [type, setType] = useState("stars");
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState("");

  const isEditing = !!initialData;

  // Populate fields when initialData changes
  useState(() => {});
  // Use effect-like pattern via open + initialData
  const prevOpenRef = useState({ open: false, id: "" })[0];
  if (open && initialData && prevOpenRef.id !== initialData.id) {
    prevOpenRef.open = true;
    prevOpenRef.id = initialData.id;
    // Schedule state updates
    setTimeout(() => {
      setType(initialData.question_type);
      setText(initialData.question_text);
      setOptions(initialData.options || []);
      setNewOption("");
    }, 0);
  }
  if (!open && prevOpenRef.open) {
    prevOpenRef.open = false;
    prevOpenRef.id = "";
  }

  const isChoiceType = type !== "stars";
  const canSubmit = text.trim() && (!isChoiceType || options.length >= 2);

  const resetForm = () => {
    setType("stars");
    setText("");
    setOptions([]);
    setNewOption("");
  };

  const handleClose = (val: boolean) => {
    if (!val) resetForm();
    onOpenChange(val);
  };

  const handleAddOption = () => {
    const trimmed = newOption.trim();
    if (!trimmed || options.includes(trimmed)) return;
    setOptions((prev) => [...prev, trimmed]);
    setNewOption("");
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      question_text: text.trim(),
      question_type: type,
      options: isChoiceType ? options : undefined,
    });
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[560px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle>{isEditing ? "Editar Pergunta" : "Nova Pergunta"}</DialogTitle>
          <DialogDescription>
            Configure o tipo e o conteúdo da pergunta para seus clientes.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 space-y-5 pb-5">
          {/* Step 1 — Type selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tipo da pergunta</Label>
            <div className="grid grid-cols-3 gap-2">
              {QUESTION_TYPES.map((qt) => {
                const Icon = qt.icon;
                const selected = type === qt.value;
                return (
                  <button
                    key={qt.value}
                    type="button"
                    onClick={() => {
                      setType(qt.value);
                      if (qt.value === "stars") setOptions([]);
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 text-center transition-all hover:shadow-sm",
                      selected ? qt.color : "border-transparent bg-muted/40 hover:bg-muted/60"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", selected ? qt.iconColor : "text-muted-foreground")} />
                    <span className="text-xs font-semibold">{qt.label}</span>
                    <span className="text-[10px] text-muted-foreground leading-tight">{qt.description}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2 — Question text */}
          <div className="space-y-2">
            <Label htmlFor="question-text" className="text-sm font-medium">Texto da pergunta</Label>
            <Input
              id="question-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={PLACEHOLDERS[type]}
              maxLength={200}
            />
          </div>

          {/* Step 3 — Options (choice types only) */}
          {isChoiceType && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Opções de resposta</Label>
                <span className={cn(
                  "text-[11px]",
                  options.length < 2 ? "text-destructive" : "text-muted-foreground"
                )}>
                  {options.length} / mínimo 2
                </span>
              </div>

              {options.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {options.map((opt, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 text-xs bg-secondary border rounded-full px-2.5 py-1 font-medium"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => setOptions((prev) => prev.filter((_, i) => i !== idx))}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Adicionar opção..."
                  maxLength={100}
                  className="h-9 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddOption();
                    }
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleAddOption}
                  disabled={!newOption.trim()}
                  className="h-9 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Pré-visualização</Label>
            <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
              <p className="text-sm font-medium">
                {text || <span className="text-muted-foreground italic">Texto da pergunta...</span>}
              </p>
              {type === "stars" && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="h-6 w-6 text-yellow-400 fill-yellow-400/20" />
                  ))}
                </div>
              )}
              {type === "single_choice" && options.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-4 w-4 rounded-full border-2 border-muted-foreground/40 shrink-0" />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
              {type === "multiple_choice" && options.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {options.map((opt, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm">
                      <span className="h-4 w-4 rounded-sm border-2 border-muted-foreground/40 shrink-0" />
                      {opt}
                    </label>
                  ))}
                </div>
              )}
              {isChoiceType && options.length === 0 && (
                <p className="text-xs text-muted-foreground italic">Adicione opções para ver a prévia</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30">
          <Button variant="outline" onClick={() => handleClose(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isPending}>
            {isEditing ? "Salvar Alterações" : "Adicionar Pergunta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
