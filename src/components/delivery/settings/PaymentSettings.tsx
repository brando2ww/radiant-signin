import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  useDeliverySettings,
  useCreateOrUpdateSettings,
} from "@/hooks/use-delivery-settings";

export const PaymentSettings = () => {
  const { data: settings } = useDeliverySettings();
  const updateSettings = useCreateOrUpdateSettings();

  const [acceptsPix, setAcceptsPix] = useState(true);
  const [pixKey, setPixKey] = useState("");
  const [acceptsCredit, setAcceptsCredit] = useState(true);
  const [acceptsDebit, setAcceptsDebit] = useState(true);
  const [acceptsCash, setAcceptsCash] = useState(true);

  useEffect(() => {
    if (settings) {
      setAcceptsPix(settings.accepts_pix ?? true);
      setPixKey(settings.pix_key || "");
      setAcceptsCredit(settings.accepts_credit ?? true);
      setAcceptsDebit(settings.accepts_debit ?? true);
      setAcceptsCash(settings.accepts_cash ?? true);
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      accepts_pix: acceptsPix,
      pix_key: pixKey || null,
      accepts_credit: acceptsCredit,
      accepts_debit: acceptsDebit,
      accepts_cash: acceptsCash,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Formas de Pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="acceptsPix">PIX</Label>
            <Switch
              id="acceptsPix"
              checked={acceptsPix}
              onCheckedChange={setAcceptsPix}
            />
          </div>

          {acceptsPix && (
            <div className="space-y-2 pl-4">
              <Label htmlFor="pixKey">Chave PIX</Label>
              <Input
                id="pixKey"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder="sua_chave@banco.com"
              />
              <p className="text-xs text-muted-foreground">
                Será exibida para os clientes
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label htmlFor="acceptsCredit">Cartão de Crédito (na entrega)</Label>
            <Switch
              id="acceptsCredit"
              checked={acceptsCredit}
              onCheckedChange={setAcceptsCredit}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="acceptsDebit">Cartão de Débito (na entrega)</Label>
            <Switch
              id="acceptsDebit"
              checked={acceptsDebit}
              onCheckedChange={setAcceptsDebit}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="acceptsCash">Dinheiro</Label>
            <Switch
              id="acceptsCash"
              checked={acceptsCash}
              onCheckedChange={setAcceptsCash}
            />
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Salvar Pagamentos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
