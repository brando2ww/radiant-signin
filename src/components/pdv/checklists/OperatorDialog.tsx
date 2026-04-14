import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChecklistOperators } from "@/hooks/use-checklist-operators";
import { SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import type { Database } from "@/integrations/supabase/types";

type OperatorRow = Database["public"]["Tables"]["checklist_operators"]["Row"];
type AccessLevel = Database["public"]["Enums"]["operator_access_level"];

const ACCESS_OPTIONS: { value: AccessLevel; label: string }[] = [
  { value: "operador", label: "Operador — só executa" },
  { value: "lider", label: "Líder — executa e vê equipe" },
  { value: "gestor", label: "Gestor — acesso total" },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  operators: OperatorRow[];
}

interface FormValues {
  name: string;
  role: string;
  sector: ChecklistSector;
  pin: string;
  access_level: AccessLevel;
  is_active: boolean;
}

export function OperatorDialog({ open, onOpenChange, editingId, operators }: Props) {
  const { createOperator, updateOperator } = useChecklistOperators();
  const editing = editingId ? operators.find((o) => o.id === editingId) : null;

  const form = useForm<FormValues>({
    defaultValues: {
      name: "", role: "Colaborador", sector: "cozinha", pin: "", access_level: "operador", is_active: true,
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        role: editing.role,
        sector: editing.sector,
        pin: editing.pin,
        access_level: editing.access_level,
        is_active: editing.is_active,
      });
    } else {
      form.reset({ name: "", role: "Colaborador", sector: "cozinha", pin: "", access_level: "operador", is_active: true });
    }
  }, [editing, open]);

  const onSubmit = async (values: FormValues) => {
    if (values.pin.length !== 4 || !/^\d{4}$/.test(values.pin)) {
      form.setError("pin", { message: "PIN deve ter exatamente 4 dígitos numéricos" });
      return;
    }
    if (editing) {
      updateOperator({ id: editing.id, ...values });
    } else {
      await createOperator(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Colaborador" : "Novo Colaborador"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" rules={{ required: "Nome obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl><Input placeholder="Ex: Cozinheiro" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {(Object.keys(SECTOR_LABELS) as ChecklistSector[]).map((s) => (
                        <SelectItem key={s} value={s}>{SECTOR_LABELS[s]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="pin" rules={{ required: "PIN obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>PIN (4 dígitos)</FormLabel>
                  <FormControl>
                    <Input maxLength={4} inputMode="numeric" pattern="\d{4}" placeholder="0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="access_level"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Acesso</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ACCESS_OPTIONS.map((a) => (
                        <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="is_active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="!mt-0">Ativo</FormLabel>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit">{editing ? "Salvar" : "Cadastrar"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
