import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  useDeliverySettings,
  useCreateOrUpdateSettings,
  DeliveryZone,
} from "@/hooks/use-delivery-settings";
import { CurrencyInput } from "@/components/ui/currency-input";

export const DeliverySettings = () => {
  const { data: settings } = useDeliverySettings();
  const updateSettings = useCreateOrUpdateSettings();

  const [minOrderValue, setMinOrderValue] = useState("30");
  const [defaultDeliveryFee, setDefaultDeliveryFee] = useState("5");
  const [estimatedTime, setEstimatedTime] = useState("45");
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [newZoneNeighborhood, setNewZoneNeighborhood] = useState("");
  const [newZoneFee, setNewZoneFee] = useState("");

  useEffect(() => {
    if (settings) {
      setMinOrderValue(settings.min_order_value?.toString() || "30");
      setDefaultDeliveryFee(settings.default_delivery_fee?.toString() || "5");
      setEstimatedTime(settings.estimated_preparation_time?.toString() || "45");
      setZones(settings.delivery_zones || []);
    }
  }, [settings]);

  const handleAddZone = () => {
    if (newZoneNeighborhood && newZoneFee) {
      setZones([
        ...zones,
        { neighborhood: newZoneNeighborhood, fee: Number(newZoneFee) },
      ]);
      setNewZoneNeighborhood("");
      setNewZoneFee("");
    }
  };

  const handleRemoveZone = (index: number) => {
    setZones(zones.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    updateSettings.mutate({
      min_order_value: Number(minOrderValue),
      default_delivery_fee: Number(defaultDeliveryFee),
      estimated_preparation_time: Number(estimatedTime),
      delivery_zones: zones as any,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="minOrderValue">Pedido Mínimo</Label>
              <CurrencyInput
                id="minOrderValue"
                value={minOrderValue}
                onChange={setMinOrderValue}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultDeliveryFee">Taxa Padrão</Label>
              <CurrencyInput
                id="defaultDeliveryFee"
                value={defaultDeliveryFee}
                onChange={setDefaultDeliveryFee}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estimatedTime">Tempo de Preparo (min)</Label>
              <Input
                id="estimatedTime"
                type="number"
                min="1"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zonas de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {zones.length > 0 && (
            <div className="space-y-2">
              {zones.map((zone, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div>
                    <p className="font-medium">{zone.neighborhood}</p>
                    <p className="text-sm text-muted-foreground">
                      R$ {Number(zone.fee).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => handleRemoveZone(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Input
              placeholder="Nome do bairro"
              value={newZoneNeighborhood}
              onChange={(e) => setNewZoneNeighborhood(e.target.value)}
            />
            <CurrencyInput
              value={newZoneFee}
              onChange={setNewZoneFee}
              className="w-32"
            />
            <Button onClick={handleAddZone} disabled={!newZoneNeighborhood || !newZoneFee}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Configure taxas de entrega específicas por bairro
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={updateSettings.isPending}>
          {updateSettings.isPending && (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          )}
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};