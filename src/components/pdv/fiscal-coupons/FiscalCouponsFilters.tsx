import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import type { DateRange } from "react-day-picker";
import type { FiscalCouponsFilter } from "@/hooks/use-fiscal-coupons";

interface Props {
  filter: FiscalCouponsFilter;
  onChange: (next: FiscalCouponsFilter) => void;
}

export function FiscalCouponsFilters({ filter, onChange }: Props) {
  const range: DateRange | undefined =
    filter.startDate || filter.endDate
      ? { from: filter.startDate, to: filter.endDate }
      : undefined;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[260px]">
        <label className="text-xs text-muted-foreground mb-1 block">Período</label>
        <DateRangePicker
          value={range}
          onChange={(r) => onChange({ ...filter, startDate: r?.from, endDate: r?.to })}
        />
      </div>

      <div className="min-w-[160px]">
        <label className="text-xs text-muted-foreground mb-1 block">Status</label>
        <Select
          value={filter.status || "all"}
          onValueChange={(v) => onChange({ ...filter, status: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="autorizada">Autorizadas</SelectItem>
            <SelectItem value="pendente">Pendentes</SelectItem>
            <SelectItem value="rejeitada">Rejeitadas</SelectItem>
            <SelectItem value="cancelada">Canceladas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[160px]">
        <label className="text-xs text-muted-foreground mb-1 block">Ambiente</label>
        <Select
          value={filter.ambiente || "all"}
          onValueChange={(v) => onChange({ ...filter, ambiente: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="producao">Produção</SelectItem>
            <SelectItem value="homologacao">Homologação</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[180px]">
        <label className="text-xs text-muted-foreground mb-1 block">Forma de pagamento</label>
        <Select
          value={filter.paymentMethod || "all"}
          onValueChange={(v) => onChange({ ...filter, paymentMethod: v })}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="dinheiro">Dinheiro</SelectItem>
            <SelectItem value="cartao_credito">Cartão Crédito</SelectItem>
            <SelectItem value="cartao_debito">Cartão Débito</SelectItem>
            <SelectItem value="pix">Pix</SelectItem>
            <SelectItem value="outros">Outros</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[220px]">
        <label className="text-xs text-muted-foreground mb-1 block">Busca</label>
        <Input
          placeholder="Nº, chave, CPF ou nome do cliente"
          value={filter.search || ""}
          onChange={(e) => onChange({ ...filter, search: e.target.value })}
        />
      </div>
    </div>
  );
}
