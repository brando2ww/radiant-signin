import { usePDVSettings } from "@/hooks/use-pdv-settings";
import { SettingsForm } from "@/components/pdv/SettingsForm";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Settings as SettingsIcon } from "lucide-react";

export default function PDVSettings() {
  const { settings, isLoading, updateSettings, isUpdating } = usePDVSettings();

  const handleSubmit = (values: any) => {
    updateSettings(values);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-9 w-48" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-[200px] w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do PDV</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações do seu ponto de venda
        </p>
      </div>

      {settings ? (
        <SettingsForm
          defaultValues={settings}
          onSubmit={handleSubmit}
          isSubmitting={isUpdating}
        />
      ) : (
        <Card>
          <CardContent className="min-h-[400px] flex flex-col items-center justify-center gap-4">
            <SettingsIcon className="h-16 w-16 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium">Configure seu PDV</h3>
              <p className="text-sm text-muted-foreground">
                Configure as informações do seu estabelecimento para começar
              </p>
            </div>
            <SettingsForm onSubmit={handleSubmit} isSubmitting={isUpdating} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
