import { CheckSquare, Hash, Thermometer, Camera, Type, Star, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LocalItem, ChecklistConfig } from "@/pages/pdv/ChecklistEditor";

interface Props {
  items: LocalItem[];
  config: ChecklistConfig;
}

export function ChecklistMobilePreview({ items, config }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Preview Mobile
      </h3>
      <div className="rounded-2xl border-2 border-border bg-background overflow-hidden shadow-lg">
        {/* Phone Status Bar */}
        <div className="h-6 bg-foreground/5 flex items-center justify-center">
          <div className="w-16 h-1 rounded-full bg-foreground/20" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-border" style={{ backgroundColor: config.color + "15" }}>
          <h4 className="text-sm font-semibold truncate" style={{ color: config.color }}>
            {config.name || "Nome do Checklist"}
          </h4>
          <p className="text-[10px] text-muted-foreground">{items.length} itens</p>
        </div>

        {/* Items */}
        <div className="p-3 space-y-2 max-h-[400px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              Os itens aparecerão aqui
            </p>
          ) : (
            items.map((item, idx) => (
              <PreviewItem key={idx} item={item} color={config.color} />
            ))
          )}
        </div>

        {/* Bottom Bar */}
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <div className="w-full h-8 rounded-md bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-medium text-primary">Finalizar Checklist</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewItem({ item, color }: { item: LocalItem; color: string }) {
  return (
    <div className="rounded-lg border border-border p-2.5 space-y-1.5">
      <div className="flex items-start gap-2">
        <div className="mt-0.5">
          {item.item_type === "checkbox" && (
            <div className="h-4 w-4 rounded border-2 border-muted-foreground/40" />
          )}
          {item.item_type !== "checkbox" && (
            <div className="h-4 w-4 rounded flex items-center justify-center" style={{ color }}>
              {item.item_type === "temperature" && <Thermometer className="h-3.5 w-3.5" />}
              {item.item_type === "photo" && <Camera className="h-3.5 w-3.5" />}
              {item.item_type === "number" && <Hash className="h-3.5 w-3.5" />}
              {item.item_type === "text" && <Type className="h-3.5 w-3.5" />}
              {item.item_type === "stars" && <Star className="h-3.5 w-3.5" />}
              {item.item_type === ("multiple_choice" as any) && <ListChecks className="h-3.5 w-3.5" />}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium leading-tight">
            {item.title || "(sem título)"}
            {item.is_required && <span className="text-destructive ml-0.5">*</span>}
          </p>
          {item.is_critical && (
            <span className="text-[9px] text-destructive font-medium">⚠ Crítico</span>
          )}
        </div>
      </div>

      {/* Field Preview */}
      <div className="ml-6">
        {item.item_type === "number" && (
          <div className="h-7 rounded border border-border bg-muted/40 px-2 flex items-center">
            <span className="text-[10px] text-muted-foreground">Digitar número...</span>
          </div>
        )}
        {item.item_type === "temperature" && (
          <div className="h-7 rounded border border-border bg-muted/40 px-2 flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground">°C</span>
            {(item.min_value !== null || item.max_value !== null) && (
              <span className="text-[9px] text-muted-foreground">
                {item.min_value ?? "—"}° a {item.max_value ?? "—"}°
              </span>
            )}
          </div>
        )}
        {item.item_type === "text" && (
          <div className="h-12 rounded border border-border bg-muted/40 px-2 pt-1">
            <span className="text-[10px] text-muted-foreground">Escrever...</span>
          </div>
        )}
        {item.item_type === "photo" && (
          <div className="h-14 rounded border border-dashed border-border bg-muted/40 flex items-center justify-center">
            <Camera className="h-4 w-4 text-muted-foreground/50" />
          </div>
        )}
        {item.item_type === "stars" && (
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="h-4 w-4 text-muted-foreground/30" />
            ))}
          </div>
        )}
        {item.item_type === ("multiple_choice" as any) && item.options && (
          <div className="space-y-1">
            {item.options.map((opt, oi) => (
              <div key={oi} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-full border border-muted-foreground/40" />
                <span className="text-[10px]">{opt}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
