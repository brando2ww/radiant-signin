import { Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const COMPARISON_FEATURES = [
  { category: "Transações", items: [
    { name: "Transações mensais", free: "50", pro: "Ilimitadas", enterprise: "Ilimitadas" },
    { name: "Categorias personalizadas", free: false, pro: true, enterprise: true },
    { name: "Tags e observações", free: true, pro: true, enterprise: true },
  ]},
  { category: "Cartões de Crédito", items: [
    { name: "Número de cartões", free: "1", pro: "5", enterprise: "Ilimitados" },
    { name: "Controle de faturas", free: true, pro: true, enterprise: true },
    { name: "Alertas de vencimento", free: false, pro: true, enterprise: true },
  ]},
  { category: "Relatórios", items: [
    { name: "Relatórios básicos", free: true, pro: true, enterprise: true },
    { name: "Gráficos avançados", free: false, pro: true, enterprise: true },
    { name: "Relatórios personalizados", free: false, pro: false, enterprise: true },
    { name: "Exportação de dados", free: false, pro: true, enterprise: true },
  ]},
  { category: "Integrações", items: [
    { name: "Importação CSV/OFX", free: false, pro: true, enterprise: true },
    { name: "Conexão bancária (Open Finance)", free: false, pro: false, enterprise: true },
    { name: "API de acesso", free: false, pro: false, enterprise: true },
  ]},
  { category: "Suporte", items: [
    { name: "Suporte por email", free: true, pro: true, enterprise: true },
    { name: "Suporte prioritário", free: false, pro: true, enterprise: true },
    { name: "Suporte 24/7 + WhatsApp", free: false, pro: false, enterprise: true },
    { name: "Consultor dedicado", free: false, pro: false, enterprise: true },
  ]},
];

export function ComparisonTable() {
  const renderCell = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <Check className="h-5 w-5 text-green-500 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground/30 mx-auto" />
      );
    }
    return <span className="text-sm font-medium">{value}</span>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação Detalhada de Recursos</CardTitle>
      </CardHeader>
      <CardContent className="px-2 md:px-6">
        <p className="text-xs text-muted-foreground mb-2 text-center md:hidden">
          ← Deslize para ver mais →
        </p>
        <div className="overflow-x-auto -mx-2 px-2 md:mx-0 md:px-0">
          <Table className="min-w-[500px]">
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/3">Recurso</TableHead>
                <TableHead className="text-center">Gratuito</TableHead>
                <TableHead className="text-center bg-primary/5">Profissional</TableHead>
                <TableHead className="text-center">Enterprise</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPARISON_FEATURES.map((category) => (
                <>
                  <TableRow key={category.category} className="bg-muted/50">
                    <TableCell colSpan={4} className="font-semibold text-sm">
                      {category.category}
                    </TableCell>
                  </TableRow>
                  {category.items.map((item, idx) => (
                    <TableRow key={`${category.category}-${idx}`}>
                      <TableCell className="font-medium text-sm">{item.name}</TableCell>
                      <TableCell className="text-center">{renderCell(item.free)}</TableCell>
                      <TableCell className="text-center bg-primary/5">{renderCell(item.pro)}</TableCell>
                      <TableCell className="text-center">{renderCell(item.enterprise)}</TableCell>
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
