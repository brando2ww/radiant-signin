import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useChecklists, SECTOR_LABELS } from "@/hooks/use-checklists";
import { Loader2 } from "lucide-react";

const BUILTIN_TEMPLATES = [
  {
    name: "Abertura Cozinha",
    sector: "cozinha" as const,
    description: "Checklist padrão de abertura da cozinha",
    items: [
      { title: "Verificar validade dos insumos", item_type: "checkbox" as const, is_critical: true },
      { title: "Temperatura da câmara fria", item_type: "temperature" as const, min_value: -18, max_value: -12, is_critical: true },
      { title: "Temperatura do balcão refrigerado", item_type: "temperature" as const, min_value: 0, max_value: 5, is_critical: true },
      { title: "Limpeza das bancadas", item_type: "checkbox" as const },
      { title: "Higienização das mãos (foto)", item_type: "photo" as const, requires_photo: true },
      { title: "Equipamentos funcionando", item_type: "checkbox" as const },
      { title: "Organização do mise en place", item_type: "checkbox" as const },
    ],
  },
  {
    name: "Fechamento Cozinha",
    sector: "cozinha" as const,
    description: "Checklist padrão de fechamento da cozinha",
    items: [
      { title: "Limpeza geral do chão", item_type: "checkbox" as const },
      { title: "Equipamentos desligados", item_type: "checkbox" as const, is_critical: true },
      { title: "Gás desligado", item_type: "checkbox" as const, is_critical: true },
      { title: "Lixo retirado", item_type: "checkbox" as const },
      { title: "Temperatura câmara fria (final)", item_type: "temperature" as const, min_value: -18, max_value: -12, is_critical: true },
      { title: "Foto da cozinha limpa", item_type: "photo" as const, requires_photo: true },
    ],
  },
  {
    name: "Abertura Salão",
    sector: "salao" as const,
    description: "Checklist de abertura do salão",
    items: [
      { title: "Mesas organizadas e limpas", item_type: "checkbox" as const },
      { title: "Cardápios em todas as mesas", item_type: "checkbox" as const },
      { title: "Ar condicionado ligado", item_type: "checkbox" as const },
      { title: "Iluminação conferida", item_type: "checkbox" as const },
      { title: "Banheiros limpos (foto)", item_type: "photo" as const, requires_photo: true },
      { title: "Avaliação geral do ambiente", item_type: "stars" as const },
    ],
  },
  {
    name: "Abertura Caixa",
    sector: "caixa" as const,
    description: "Checklist de abertura do caixa",
    items: [
      { title: "Fundo de troco conferido", item_type: "number" as const },
      { title: "Máquina de cartão funcionando", item_type: "checkbox" as const, is_critical: true },
      { title: "Impressora fiscal funcionando", item_type: "checkbox" as const, is_critical: true },
      { title: "Sistema PDV operacional", item_type: "checkbox" as const, is_critical: true },
      { title: "Bobina de papel verificada", item_type: "checkbox" as const },
    ],
  },
  {
    name: "Abertura Bar",
    sector: "bar" as const,
    description: "Checklist de abertura do bar",
    items: [
      { title: "Estoque de bebidas conferido", item_type: "checkbox" as const },
      { title: "Gelo suficiente", item_type: "checkbox" as const },
      { title: "Copos e taças limpos", item_type: "checkbox" as const },
      { title: "Temperatura do refrigerador", item_type: "temperature" as const, min_value: 0, max_value: 5 },
      { title: "Guarnições preparadas (limão, etc)", item_type: "checkbox" as const },
    ],
  },
  {
    name: "Recebimento de Mercadorias",
    sector: "estoque" as const,
    description: "Checklist de conferência no recebimento",
    items: [
      { title: "Nota fiscal conferida", item_type: "checkbox" as const, is_critical: true },
      { title: "Quantidade conferida", item_type: "checkbox" as const, is_critical: true },
      { title: "Temperatura dos refrigerados", item_type: "temperature" as const, min_value: 0, max_value: 5, is_critical: true },
      { title: "Validade verificada", item_type: "checkbox" as const, is_critical: true },
      { title: "Condição da embalagem", item_type: "stars" as const },
      { title: "Foto da entrega", item_type: "photo" as const, requires_photo: true },
      { title: "Observações", item_type: "text" as const },
    ],
  },
  {
    name: "Fechamento Gerência",
    sector: "gerencia" as const,
    description: "Checklist de fechamento gerencial do dia",
    items: [
      { title: "Caixa fechado e conferido", item_type: "checkbox" as const, is_critical: true },
      { title: "Diferença de caixa (R$)", item_type: "number" as const },
      { title: "Faltas de funcionários registradas", item_type: "checkbox" as const },
      { title: "Reclamações do dia anotadas", item_type: "text" as const },
      { title: "Avaliação geral do dia", item_type: "stars" as const },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateLibraryDialog({ open, onOpenChange }: Props) {
  const { createChecklist } = useChecklists();
  const [loading, setLoading] = useState<string | null>(null);

  const handleUseTemplate = async (template: (typeof BUILTIN_TEMPLATES)[0]) => {
    setLoading(template.name);
    try {
      const checklist = await createChecklist({
        name: template.name,
        sector: template.sector,
        description: template.description,
      });

      // Insert items
      const { supabase } = await import("@/integrations/supabase/client");
      const items = template.items.map((item, idx) => ({
        checklist_id: checklist.id,
        title: item.title,
        item_type: item.item_type,
        is_critical: item.is_critical || false,
        is_required: true,
        requires_photo: item.requires_photo || false,
        sort_order: idx,
        min_value: (item as any).min_value ?? null,
        max_value: (item as any).max_value ?? null,
      }));
      await supabase.from("checklist_items").insert(items);

      onOpenChange(false);
    } catch {
      // toast handled by hook
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Templates Prontos</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 md:grid-cols-2">
          {BUILTIN_TEMPLATES.map((tpl) => (
            <Card key={tpl.name}>
              <CardContent className="py-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{tpl.name}</span>
                  <Badge variant="secondary">{SECTOR_LABELS[tpl.sector]}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{tpl.description}</p>
                <p className="text-xs text-muted-foreground">{tpl.items.length} itens</p>
                <Button
                  size="sm"
                  className="w-full"
                  disabled={loading === tpl.name}
                  onClick={() => handleUseTemplate(tpl)}
                >
                  {loading === tpl.name ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Usar Template
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
