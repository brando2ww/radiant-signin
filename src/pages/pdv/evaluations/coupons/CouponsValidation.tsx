import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function CouponsValidation() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Validação de Cupons</h1>
        <p className="text-sm text-muted-foreground">Verifique e resgate cupons manualmente</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Em construção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Esta página permitirá digitar o código do cupom para validar e resgatar manualmente.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
