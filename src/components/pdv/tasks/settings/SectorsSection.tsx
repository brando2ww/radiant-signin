import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  ChefHat, Utensils, DollarSign, Wine, Package, Briefcase,
} from "lucide-react";
import { SECTOR_COLORS } from "@/data/sector-colors";

export interface SectorConfig {
  key: string;
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  isCustom?: boolean;
}

const ICON_MAP: Record<string, any> = {
  ChefHat, Utensils, DollarSign, Wine, Package, Briefcase,
};

const DEFAULT_SECTORS: SectorConfig[] = [
  { key: "cozinha", name: "Cozinha", icon: "ChefHat", color: "#ef4444", isActive: true },
  { key: "salao", name: "Salão", icon: "Utensils", color: "#22c55e", isActive: true },
  { key: "caixa", name: "Caixa", icon: "DollarSign", color: "#3b82f6", isActive: true },
  { key: "bar", name: "Bar", icon: "Wine", color: "#a855f7", isActive: true },
  { key: "estoque", name: "Estoque", icon: "Package", color: "#f59e0b", isActive: true },
  { key: "gerencia", name: "Gerência", icon: "Briefcase", color: "#64748b", isActive: true },
];

interface Props {
  sectors: SectorConfig[];
  onChange: (sectors: SectorConfig[]) => void;
}

export function SectorsSection({ sectors, onChange }: Props) {
  const list = sectors.length > 0 ? sectors : DEFAULT_SECTORS;

  const update = (idx: number, field: keyof SectorConfig, value: any) => {
    const updated = [...list];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const addCustom = () => {
    onChange([...list, {
      key: `custom_${Date.now()}`,
      name: "Novo Setor",
      icon: "Briefcase",
      color: SECTOR_COLORS[list.length % SECTOR_COLORS.length].value,
      isActive: true,
      isCustom: true,
    }]);
  };

  return (
    <div className="space-y-3">
      {list.map((s, i) => {
        const IconComp = ICON_MAP[s.icon] || Briefcase;
        return (
          <div key={s.key} className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: s.color + "20" }}>
              <IconComp className="h-4 w-4" style={{ color: s.color }} />
            </div>
            <div className="flex-1">
              <Input
                value={s.name}
                onChange={(e) => update(i, "name", e.target.value)}
                className="h-8 text-sm font-medium border-0 p-0 focus-visible:ring-0"
              />
            </div>
            <div className="flex gap-1">
              {SECTOR_COLORS.slice(0, 6).map((c) => (
                <button
                  key={c.value}
                  onClick={() => update(i, "color", c.value)}
                  className="h-5 w-5 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c.value,
                    borderColor: s.color === c.value ? "hsl(var(--foreground))" : "transparent",
                  }}
                />
              ))}
            </div>
            <Switch checked={s.isActive} onCheckedChange={(v) => update(i, "isActive", v)} />
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={addCustom}>
        <Plus className="h-4 w-4 mr-1" /> Adicionar Setor
      </Button>
    </div>
  );
}
