import { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Play, AlertTriangle, Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { DailyTask } from "@/hooks/use-daily-tasks";

interface Props {
  task: DailyTask | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (task: DailyTask) => void;
}

interface ItemDetail {
  id: string;
  title: string;
  itemType: string;
  isCritical: boolean;
  isRequired: boolean;
  requiresPhoto: boolean;
  completedAt: string | null;
  value: any;
}

export function TaskDetailDrawer({ task, open, onOpenChange, onStart }: Props) {
  const [items, setItems] = useState<ItemDetail[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!task || !open) return;
    setLoading(true);

    const fetchItems = async () => {
      // If there's an execution, get execution items with joined checklist_items
      if (task.executionId) {
        const { data } = await supabase
          .from("checklist_execution_items")
          .select("*, checklist_items(title, item_type, is_critical, is_required, requires_photo, sort_order)")
          .eq("execution_id", task.executionId);
        const mapped = (data || [])
          .map((ei: any) => ({
            id: ei.id,
            title: ei.checklist_items?.title || "",
            itemType: ei.checklist_items?.item_type || "checkbox",
            isCritical: ei.checklist_items?.is_critical || false,
            isRequired: ei.checklist_items?.is_required || false,
            requiresPhoto: ei.checklist_items?.requires_photo || false,
            completedAt: ei.completed_at,
            value: ei.value,
            sortOrder: ei.checklist_items?.sort_order ?? 0,
          }))
          .sort((a: any, b: any) => a.sortOrder - b.sortOrder);
        setItems(mapped);
      } else {
        // No execution yet — show checklist items as pending
        const { data } = await supabase
          .from("checklist_items")
          .select("*")
          .eq("checklist_id", task.checklistId)
          .order("sort_order");
        setItems(
          (data || []).map((i: any) => ({
            id: i.id,
            title: i.title,
            itemType: i.item_type,
            isCritical: i.is_critical,
            isRequired: i.is_required,
            requiresPhoto: i.requires_photo,
            completedAt: null,
            value: null,
          }))
        );
      }
      setLoading(false);
    };
    fetchItems();
  }, [task, open]);

  if (!task) return null;

  const completedCount = items.filter(i => i.completedAt).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{task.checklistName}</SheetTitle>
          <SheetDescription>
            <span className="capitalize">{task.sector}</span> · {task.startTime} → {task.deadlineTime}
            {task.assignedOperatorName && ` · ${task.assignedOperatorName}`}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium">{completedCount}/{items.length} itens</span>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (
            <div className="space-y-1">
              {items.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                    item.completedAt ? "bg-primary/5" : "bg-muted/30"
                  } ${item.isCritical ? "ring-1 ring-destructive/30" : ""}`}
                >
                  {item.completedAt ? (
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <span className="flex-1 truncate">{item.title}</span>
                  {item.isCritical && <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />}
                  {item.requiresPhoto && <Camera className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                  {item.isRequired && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0">Obrig.</Badge>
                  )}
                </div>
              ))}
            </div>
          )}

          {(task.status === "pending" || task.status === "overdue" || task.status === "in_progress") && (
            <Button className="w-full mt-4" onClick={() => { onOpenChange(false); onStart(task); }}>
              <Play className="h-4 w-4 mr-1" />
              {task.status === "in_progress" ? "Continuar execução" : "Iniciar execução"}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
