import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PDVTable } from "@/hooks/use-pdv-tables";
import { PDVSector } from "@/hooks/use-pdv-sectors";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { SectorQuickDialog } from "./SectorQuickDialog";

interface TableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: PDVTable | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
  sectors?: PDVSector[];
  onCreateSector?: (name: string) => Promise<any>;
  isCreatingSector?: boolean;
}

const SHAPES = [
  { value: "square", label: "Quadrada" },
  { value: "round", label: "Redonda" },
  { value: "rectangle", label: "Retangular" },
];

export function TableDialog({
  open,
  onOpenChange,
  table,
  onSubmit,
  isSubmitting,
  sectors = [],
  onCreateSector,
  isCreatingSector = false,
}: TableDialogProps) {
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      table_number: table?.table_number || "",
      capacity: table?.capacity || 4,
      shape: table?.shape || "square",
      sector_id: table?.sector_id || "",
    },
  });

  // Reset form when table changes
  useEffect(() => {
    if (open) {
      form.reset({
        table_number: table?.table_number || "",
        capacity: table?.capacity || 4,
        shape: table?.shape || "square",
        sector_id: table?.sector_id || "",
      });
    }
  }, [open, table, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit({
      ...data,
      sector_id: data.sector_id || null,
      status: table?.status || "livre",
      position_x: table?.position_x || null,
      position_y: table?.position_y || null,
      current_order_id: table?.current_order_id || null,
    });
    form.reset();
  });

  const handleCreateSector = async (name: string) => {
    if (onCreateSector) {
      const newSector = await onCreateSector(name);
      if (newSector) {
        form.setValue("sector_id", newSector.id);
      }
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {table ? "Editar Mesa" : "Nova Mesa"}
            </DialogTitle>
            <DialogDescription>
              Configure as informações da mesa
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                control={form.control}
                name="table_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Mesa *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: 1, 2, A1..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Identificação da mesa no salão
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="4"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        onFocus={(e) => e.target.select()}
                      />
                    </FormControl>
                    <FormDescription>
                      Número de lugares disponíveis
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="shape"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Formato</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SHAPES.map((shape) => (
                            <SelectItem key={shape.value} value={shape.value}>
                              {shape.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Setor</FormLabel>
                      <div className="flex gap-2">
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <FormControl>
                            <SelectTrigger className="flex-1">
                              <SelectValue placeholder="Sem setor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">Sem setor</SelectItem>
                            {sectors.map((sector) => (
                              <SelectItem key={sector.id} value={sector.id}>
                                {sector.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {onCreateSector && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setSectorDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : table ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {onCreateSector && (
        <SectorQuickDialog
          open={sectorDialogOpen}
          onOpenChange={setSectorDialogOpen}
          onSubmit={handleCreateSector}
          isSubmitting={isCreatingSector}
        />
      )}
    </>
  );
}
