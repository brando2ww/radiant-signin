import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useChecklistOperators } from "@/hooks/use-checklist-operators";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import { CalendarIcon, Eye, EyeOff, Shuffle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { Database } from "@/integrations/supabase/types";

type OperatorRow = Database["public"]["Tables"]["checklist_operators"]["Row"];
type AccessLevel = Database["public"]["Enums"]["operator_access_level"];

const AVATAR_COLORS = [
  "#6366f1", "#ef4444", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#64748b",
];

const ACCESS_OPTIONS: { value: AccessLevel; label: string; desc: string }[] = [
  { value: "operador", label: "Operador", desc: "Só executa checklists" },
  { value: "lider", label: "Líder", desc: "Executa e acompanha equipe do setor" },
  { value: "gestor", label: "Gestor", desc: "Acesso total" },
];

const SHIFT_OPTIONS = [
  { value: "manha", label: "Manhã" },
  { value: "tarde", label: "Tarde" },
  { value: "noite", label: "Noite" },
  { value: "variavel", label: "Variável" },
];

interface FormValues {
  name: string;
  role: string;
  sector: ChecklistSector;
  pin: string;
  access_level: AccessLevel;
  is_active: boolean;
  avatar_color: string;
  default_shift: string;
  hired_at: string | null;
  notes: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  operators: OperatorRow[];
}

export function OperatorDrawer({ open, onOpenChange, editingId, operators }: Props) {
  const { createOperator, updateOperator } = useChecklistOperators();
  const editing = editingId ? operators.find((o) => o.id === editingId) : null;
  const [showPin, setShowPin] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "", role: "Colaborador", sector: "cozinha", pin: "",
      access_level: "operador", is_active: true, avatar_color: "#6366f1",
      default_shift: "variavel", hired_at: null, notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    if (editing) {
      form.reset({
        name: editing.name,
        role: editing.role,
        sector: editing.sector,
        pin: editing.pin,
        access_level: editing.access_level,
        is_active: editing.is_active,
        avatar_color: (editing as any).avatar_color || "#6366f1",
        default_shift: (editing as any).default_shift || "variavel",
        hired_at: (editing as any).hired_at || null,
        notes: (editing as any).notes || "",
      });
    } else {
      form.reset({
        name: "", role: "Colaborador", sector: "cozinha", pin: "",
        access_level: "operador", is_active: true, avatar_color: "#6366f1",
        default_shift: "variavel", hired_at: null, notes: "",
      });
    }
    setShowPin(false);
  }, [editing, open]);

  const generatePin = () => {
    const pin = String(Math.floor(1000 + Math.random() * 9000));
    form.setValue("pin", pin);
  };

  const onSubmit = async (values: FormValues) => {
    if (values.pin.length !== 4 || !/^\d{4}$/.test(values.pin)) {
      form.setError("pin", { message: "PIN deve ter exatamente 4 dígitos" });
      return;
    }
    const payload: any = { ...values };
    if (editing) {
      updateOperator({ id: editing.id, ...payload });
    } else {
      await createOperator(payload);
    }
    onOpenChange(false);
  };

  const watchColor = form.watch("avatar_color");
  const watchShift = form.watch("default_shift");
  const watchAccess = form.watch("access_level");
  const watchSector = form.watch("sector");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editing ? "Editar Colaborador" : "Novo Colaborador"}</SheetTitle>
          <SheetDescription>Preencha os dados do colaborador</SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 mt-6 pb-20">
            {/* Avatar color */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cor do avatar</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      watchColor === c ? "border-foreground scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => form.setValue("avatar_color", c)}
                  />
                ))}
              </div>
            </div>

            {/* Name */}
            <FormField control={form.control} name="name" rules={{ required: "Nome obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField control={form.control} name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl><Input placeholder="Ex: Cozinheiro" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Sector - visual buttons */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Setor</label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(SECTOR_LABELS) as ChecklistSector[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={cn(
                      "px-3 py-2 text-sm rounded-md border transition-all text-center",
                      watchSector === s
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 border-border hover:bg-muted"
                    )}
                    onClick={() => form.setValue("sector", s)}
                  >
                    {SECTOR_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* PIN */}
            <FormField control={form.control} name="pin" rules={{ required: "PIN obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN (4 dígitos)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input
                        maxLength={4}
                        inputMode="numeric"
                        pattern="\d{4}"
                        placeholder="0000"
                        type={showPin ? "text" : "password"}
                        {...field}
                      />
                    </FormControl>
                    <Button type="button" variant="outline" size="icon" onClick={() => setShowPin(!showPin)}>
                      {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={generatePin}>
                      <Shuffle className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Access level - visual cards */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Nível de acesso</label>
              <div className="space-y-2">
                {ACCESS_OPTIONS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-md border transition-all",
                      watchAccess === a.value
                        ? "bg-primary/10 border-primary"
                        : "bg-muted/30 border-border hover:bg-muted/50"
                    )}
                    onClick={() => form.setValue("access_level", a.value)}
                  >
                    <span className="font-medium text-sm">{a.label}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5">{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Default shift */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Turno padrão</label>
              <div className="grid grid-cols-4 gap-2">
                {SHIFT_OPTIONS.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    className={cn(
                      "px-3 py-2 text-sm rounded-md border transition-all text-center",
                      watchShift === s.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted/50 border-border hover:bg-muted"
                    )}
                    onClick={() => form.setValue("default_shift", s.value)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Hired at */}
            <FormField control={form.control} name="hired_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data de entrada</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(new Date(field.value), "dd/MM/yyyy") : "Selecionar data"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(d) => field.onChange(d ? format(d, "yyyy-MM-dd") : null)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                        locale={ptBR}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField control={form.control} name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observação interna</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Nota privada do gestor..." rows={3} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField control={form.control} name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-3 rounded-md border p-3">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div>
                    <FormLabel className="!mt-0">Colaborador ativo</FormLabel>
                    <p className="text-xs text-muted-foreground">Inativos não recebem agendamentos</p>
                  </div>
                </FormItem>
              )}
            />

            {/* Footer */}
            <div className="fixed bottom-0 right-0 w-full sm:max-w-lg bg-background border-t p-4 flex justify-end gap-2 z-10">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
