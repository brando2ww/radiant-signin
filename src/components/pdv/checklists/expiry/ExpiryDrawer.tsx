import { useState, useEffect } from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { CATEGORIES, STORAGE_LOCATIONS, UNITS } from "@/hooks/use-product-expiry";
import type { ExpiryItem } from "@/hooks/use-product-expiry";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editItem?: ExpiryItem | null;
  prefill?: { product_name: string; category: string } | null;
  onSave: (data: any) => Promise<void>;
  isPending: boolean;
}

const emptyForm = {
  product_name: "",
  batch_id: "",
  expiry_date: "",
  category: "outros",
  storage_location: "",
  quantity: "1",
  unit: "unidades",
  unit_cost: "",
  temperature: "",
  notes: "",
};

export function ExpiryDrawer({ open, onOpenChange, editItem, prefill, onSave, isPending }: Props) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (editItem) {
      setForm({
        product_name: editItem.product_name,
        batch_id: editItem.batch_id || "",
        expiry_date: editItem.expiry_date,
        category: editItem.category || "outros",
        storage_location: editItem.storage_location || "",
        quantity: String(editItem.quantity || 1),
        unit: editItem.unit || "unidades",
        unit_cost: editItem.unit_cost ? String(editItem.unit_cost) : "",
        temperature: editItem.temperature ? String(editItem.temperature) : "",
        notes: editItem.notes || "",
      });
    } else if (prefill) {
      setForm({ ...emptyForm, product_name: prefill.product_name, category: prefill.category });
    } else {
      setForm(emptyForm);
    }
  }, [editItem, prefill, open]);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.product_name || !form.expiry_date) return;
    const data: any = {
      product_name: form.product_name,
      batch_id: form.batch_id || null,
      expiry_date: form.expiry_date,
      category: form.category,
      storage_location: form.storage_location || null,
      quantity: parseFloat(form.quantity) || 1,
      unit: form.unit,
      unit_cost: form.unit_cost ? parseFloat(form.unit_cost) : 0,
      temperature: form.temperature ? parseFloat(form.temperature) : null,
      notes: form.notes || null,
    };
    if (editItem) data.id = editItem.id;
    await onSave(data);
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 left-auto w-full max-w-md rounded-l-lg rounded-t-none mt-0">
        <DrawerHeader>
          <DrawerTitle>{editItem ? "Editar Produto" : "Registrar Produto"}</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 space-y-3 overflow-y-auto flex-1">
          <Input placeholder="Nome do produto" value={form.product_name} onChange={(e) => set("product_name", e.target.value)} />

          <Select value={form.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input placeholder="Lote (opcional)" value={form.batch_id} onChange={(e) => set("batch_id", e.target.value)} />
          <Input type="date" value={form.expiry_date} onChange={(e) => set("expiry_date", e.target.value)} />

          <div className="flex gap-2">
            <Input type="number" placeholder="Quantidade" value={form.quantity} onChange={(e) => set("quantity", e.target.value)} className="flex-1" />
            <Select value={form.unit} onValueChange={(v) => set("unit", v)}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <Select value={form.storage_location} onValueChange={(v) => set("storage_location", v)}>
            <SelectTrigger><SelectValue placeholder="Local de armazenamento" /></SelectTrigger>
            <SelectContent>
              {STORAGE_LOCATIONS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
            </SelectContent>
          </Select>

          <Input type="number" step="0.01" placeholder="Valor unitário estimado (R$)" value={form.unit_cost} onChange={(e) => set("unit_cost", e.target.value)} />
          <Input type="number" step="0.1" placeholder="Temperatura (°C) - opcional" value={form.temperature} onChange={(e) => set("temperature", e.target.value)} />
          <Textarea placeholder="Observação (opcional)" value={form.notes} onChange={(e) => set("notes", e.target.value)} rows={2} />
        </div>
        <DrawerFooter>
          <Button onClick={handleSubmit} disabled={isPending || !form.product_name || !form.expiry_date} className="w-full">
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {editItem ? "Atualizar" : "Salvar"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
