import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, PackageX, Copy, Trash2 } from "lucide-react";
import { CATEGORIES } from "@/hooks/use-product-expiry";
import type { ExpiryItem } from "@/hooks/use-product-expiry";

interface Props {
  items: ExpiryItem[];
  onEdit: (item: ExpiryItem) => void;
  onDiscard: (id: string) => void;
  onDuplicate: (item: ExpiryItem) => void;
  onDelete: (id: string) => void;
}

function daysBadge(days: number) {
  if (days < 0) return <Badge variant="destructive" className="text-[10px]">{days}d</Badge>;
  if (days <= 1) return <Badge className="text-[10px] bg-orange-500 hover:bg-orange-600">{days}d</Badge>;
  if (days <= 3) return <Badge variant="secondary" className="text-[10px]">{days}d</Badge>;
  return <Badge variant="outline" className="text-[10px]">{days}d</Badge>;
}

function statusLabel(status: string) {
  const map: Record<string, { label: string; variant: "destructive" | "secondary" | "default" | "outline" }> = {
    vencido: { label: "Vencido", variant: "destructive" },
    critico: { label: "Crítico", variant: "destructive" },
    proximo_vencimento: { label: "Atenção", variant: "secondary" },
    valido: { label: "OK", variant: "default" },
  };
  const s = map[status] || { label: status, variant: "outline" as const };
  return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>;
}

export function ExpiryTable({ items, onEdit, onDiscard, onDuplicate, onDelete }: Props) {
  const getCat = (v: string | null) => CATEGORIES.find((c) => c.value === v);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Produto</TableHead>
          <TableHead>Categoria</TableHead>
          <TableHead>Lote</TableHead>
          <TableHead>Local</TableHead>
          <TableHead>Qtd</TableHead>
          <TableHead>Validade</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Dias</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const cat = getCat(item.category);
          return (
            <TableRow key={item.id} className={item.daysLeft < 0 ? "bg-destructive/5" : ""}>
              <TableCell className="font-medium text-sm">{item.product_name}</TableCell>
              <TableCell>
                {cat ? <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${cat.color}`}>{cat.label}</span> : "—"}
              </TableCell>
              <TableCell className="text-sm">{item.batch_id || "—"}</TableCell>
              <TableCell className="text-sm">{item.storage_location || "—"}</TableCell>
              <TableCell className="text-sm">{item.quantity || 1} {item.unit || ""}</TableCell>
              <TableCell className="text-sm">{item.expiry_date}</TableCell>
              <TableCell>{statusLabel(item.status)}</TableCell>
              <TableCell>{daysBadge(item.daysLeft)}</TableCell>
              <TableCell>
                <div className="flex gap-0.5">
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onDuplicate(item)}><Copy className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onDiscard(item.id)}><PackageX className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => onDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
        {!items.length && (
          <TableRow>
            <TableCell colSpan={9} className="text-center text-muted-foreground text-sm py-8">
              Nenhum produto encontrado.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
