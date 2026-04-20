import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Loader2, QrCode } from "lucide-react";
import { ChecklistConfigPanel } from "@/components/pdv/checklists/editor/ChecklistConfigPanel";
import { ChecklistItemsList } from "@/components/pdv/checklists/editor/ChecklistItemsList";
import { ChecklistMobilePreview } from "@/components/pdv/checklists/editor/ChecklistMobilePreview";
import { ChecklistQrPosterDialog } from "@/components/pdv/checklists/ChecklistQrPosterDialog";
import { useChecklists, useChecklistItems, type ChecklistSector, type ChecklistItemType } from "@/hooks/use-checklists";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface LocalItem {
  id?: string;
  title: string;
  item_type: ChecklistItemType;
  is_critical: boolean;
  is_required: boolean;
  requires_photo: boolean;
  sort_order: number;
  min_value: number | null;
  max_value: number | null;
  training_instruction: string | null;
  training_video_url: string | null;
  options: string[] | null;
}

export interface ChecklistConfig {
  name: string;
  sector: ChecklistSector;
  description: string;
  color: string;
  default_shift: string;
  is_active: boolean;
  qr_access_enabled: boolean;
}

export default function ChecklistEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === "novo";
  const { createChecklist, updateChecklist } = useChecklists();
  const { items: dbItems } = useChecklistItems(isNew ? null : id!);

  const [config, setConfig] = useState<ChecklistConfig>({
    name: "",
    sector: "cozinha",
    description: "",
    color: "#6366f1",
    default_shift: "todos",
    is_active: true,
    qr_access_enabled: true,
  });

  const [localItems, setLocalItems] = useState<LocalItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  // Load existing checklist data
  useEffect(() => {
    if (!isNew && id) {
      supabase
        .from("checklists")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) {
            setConfig({
              name: data.name,
              sector: data.sector,
              description: data.description || "",
              color: (data as any).color || "#6366f1",
              default_shift: (data as any).default_shift || "todos",
              is_active: data.is_active,
              qr_access_enabled: (data as any).qr_access_enabled ?? true,
            });
          }
        });
    }
  }, [id, isNew]);

  // Sync DB items to local state
  useEffect(() => {
    if (!isNew && dbItems.length > 0 && !loaded) {
      setLocalItems(
        dbItems.map((i) => ({
          id: i.id,
          title: i.title,
          item_type: i.item_type,
          is_critical: i.is_critical,
          is_required: i.is_required,
          requires_photo: i.requires_photo,
          sort_order: i.sort_order,
          min_value: i.min_value,
          max_value: i.max_value,
          training_instruction: i.training_instruction,
          training_video_url: i.training_video_url,
          options: (i as any).options || null,
        }))
      );
      setLoaded(true);
    }
  }, [dbItems, isNew, loaded]);

  const handleSave = async () => {
    if (!config.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      let checklistId = id;

      if (isNew) {
        const created = await createChecklist({
          name: config.name,
          sector: config.sector,
          description: config.description || null,
          color: config.color,
          default_shift: config.default_shift,
          is_active: config.is_active,
          qr_access_enabled: config.qr_access_enabled,
        } as any);
        checklistId = created.id;
      } else {
        updateChecklist({
          id: id!,
          name: config.name,
          sector: config.sector,
          description: config.description || null,
          color: config.color,
          default_shift: config.default_shift,
          is_active: config.is_active,
          qr_access_enabled: config.qr_access_enabled,
        } as any);
      }

      // Save items: delete existing and re-insert
      if (checklistId && checklistId !== "novo") {
        await supabase.from("checklist_items").delete().eq("checklist_id", checklistId);

        if (localItems.length > 0) {
          const itemsToInsert = localItems.map((item, idx) => ({
            checklist_id: checklistId!,
            title: item.title,
            item_type: item.item_type,
            is_critical: item.is_critical,
            is_required: item.is_required,
            requires_photo: item.requires_photo,
            sort_order: idx,
            min_value: item.min_value,
            max_value: item.max_value,
            training_instruction: item.training_instruction,
            training_video_url: item.training_video_url,
            options: item.options,
          }));
          const { error } = await supabase.from("checklist_items").insert(itemsToInsert);
          if (error) throw error;
        }
      }

      toast({ title: "Checklist salvo com sucesso! ✅" });
      navigate("/pdv/tarefas");
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const loadTemplateItems = useCallback((items: LocalItem[]) => {
    setLocalItems(items);
  }, []);

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Fixed Header */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/pdv/tarefas")}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          <div>
            <h1 className="text-lg font-semibold">
              {isNew ? "Novo Checklist" : "Editar Checklist"}
            </h1>
            {config.name && (
              <p className="text-sm text-muted-foreground">{config.name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setQrOpen(true)}
            disabled={isNew}
            title={isNew ? "Salve o checklist para gerar o QR Code" : "Gerar QR Code"}
          >
            <QrCode className="h-4 w-4 mr-2" /> QR Code
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Content - Two Columns */}
      <div className="flex-1 overflow-hidden flex">
        {/* Left Column - Config */}
        <div className="w-[380px] shrink-0 border-r border-border overflow-y-auto p-4">
          <ChecklistConfigPanel config={config} onChange={setConfig} />
        </div>

        {/* Right Column - Items + Preview */}
        <div className="flex-1 overflow-hidden flex">
          <div className="flex-1 overflow-y-auto p-4">
            <ChecklistItemsList
              items={localItems}
              onChange={setLocalItems}
              onLoadTemplate={loadTemplateItems}
              checklistConfig={config}
            />
          </div>

          {/* Mobile Preview - Hidden on smaller screens */}
          <div className="hidden xl:block w-[320px] shrink-0 border-l border-border overflow-y-auto p-4 bg-muted/30">
            <ChecklistMobilePreview items={localItems} config={config} />
          </div>
        </div>
      </div>

      {/* QR Poster Dialog */}
      {!isNew && id && (
        <ChecklistQrPosterDialog
          open={qrOpen}
          onOpenChange={setQrOpen}
          checklist={{ id, name: config.name, sector: config.sector, color: config.color }}
        />
      )}
    </div>
  );
}
