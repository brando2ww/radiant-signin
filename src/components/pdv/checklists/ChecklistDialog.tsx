import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useChecklists, SECTOR_LABELS, type ChecklistSector } from "@/hooks/use-checklists";
import type { Database } from "@/integrations/supabase/types";

type ChecklistRow = Database["public"]["Tables"]["checklists"]["Row"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  checklists: ChecklistRow[];
}

interface FormValues {
  name: string;
  sector: ChecklistSector;
  description: string;
}

export function ChecklistDialog({ open, onOpenChange, editingId, checklists }: Props) {
  const { createChecklist, updateChecklist, isCreating } = useChecklists();
  const editing = editingId ? checklists.find((c) => c.id === editingId) : null;

  const form = useForm<FormValues>({
    defaultValues: { name: "", sector: "cozinha", description: "" },
  });

  useEffect(() => {
    if (editing) {
      form.reset({ name: editing.name, sector: editing.sector, description: editing.description || "" });
    } else {
      form.reset({ name: "", sector: "cozinha", description: "" });
    }
  }, [editing, open]);

  const onSubmit = async (values: FormValues) => {
    if (editing) {
      updateChecklist({ id: editing.id, ...values });
    } else {
      await createChecklist(values);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Checklist" : "Novo Checklist"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: "Nome obrigatório" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl><Input placeholder="Ex: Abertura Cozinha" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
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
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="submit" disabled={isCreating}>{editing ? "Salvar" : "Criar"}</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
