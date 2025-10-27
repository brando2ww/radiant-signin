import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useDeliverySettings, useCreateOrUpdateSettings, BusinessHours } from "@/hooks/use-delivery-settings";
import { Loader2 } from "lucide-react";

const weekDays = [
  { key: "monday", label: "Segunda-feira" },
  { key: "tuesday", label: "Terça-feira" },
  { key: "wednesday", label: "Quarta-feira" },
  { key: "thursday", label: "Quinta-feira" },
  { key: "friday", label: "Sexta-feira" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Domingo" },
];

export const BusinessHoursSettings = () => {
  const { data: settings } = useDeliverySettings();
  const updateSettings = useCreateOrUpdateSettings();
  const [hours, setHours] = useState<BusinessHours>({});

  useEffect(() => {
    if (settings?.business_hours) {
      setHours(settings.business_hours);
    }
  }, [settings]);

  const handleTimeChange = (day: string, field: "open" | "close", value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleToggleDay = (day: string, closed: boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        closed,
      },
    }));
  };

  const handleSave = () => {
    updateSettings.mutate({ business_hours: hours });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Horário de Funcionamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {weekDays.map(({ key, label }) => {
          const dayHours = hours[key] || { open: "18:00", close: "23:00", closed: false };
          
          return (
            <div key={key} className="flex items-center gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <Label className="font-medium">{label}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={dayHours.open}
                    onChange={(e) => handleTimeChange(key, "open", e.target.value)}
                    disabled={dayHours.closed}
                  />
                  <span className="text-muted-foreground">até</span>
                  <Input
                    type="time"
                    value={dayHours.close}
                    onChange={(e) => handleTimeChange(key, "close", e.target.value)}
                    disabled={dayHours.closed}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!dayHours.closed}
                    onCheckedChange={(checked) => handleToggleDay(key, !checked)}
                  />
                  <Label className="text-sm text-muted-foreground">
                    {dayHours.closed ? "Fechado" : "Aberto"}
                  </Label>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex justify-end pt-4">
          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending && (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            )}
            Salvar Horários
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
