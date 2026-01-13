import { useTheme } from "next-themes";
import { useSettings } from "@/hooks/use-settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Palette, Monitor, Sun, Moon, LayoutGrid } from "lucide-react";

export function VisualTab() {
  const { theme, setTheme } = useTheme();
  const { settings, saveSettings, saving } = useSettings();

  const handleThemeChange = (value: string) => {
    setTheme(value);
    saveSettings({
      general: { ...settings?.general, theme: value as "light" | "dark" | "system" }
    });
  };

  const handleDensityChange = (value: string) => {
    saveSettings({
      general: { ...settings?.general, density: value as "compact" | "normal" | "comfortable" }
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Tema
          </CardTitle>
          <CardDescription>
            Escolha o tema visual do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={theme} 
            onValueChange={handleThemeChange}
            className="space-y-3"
            disabled={saving}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="light" id="light" />
              <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer">
                <Sun className="h-4 w-4" />
                Claro
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="dark" id="dark" />
              <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer">
                <Moon className="h-4 w-4" />
                Escuro
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="system" id="system" />
              <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer">
                <Monitor className="h-4 w-4" />
                Sistema
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            Densidade
          </CardTitle>
          <CardDescription>
            Ajuste o espaçamento dos elementos na interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={settings?.general?.density || "normal"} 
            onValueChange={handleDensityChange}
            className="space-y-3"
            disabled={saving}
          >
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="compact" id="compact" />
              <Label htmlFor="compact" className="cursor-pointer">
                Compacto
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="normal" id="normal" />
              <Label htmlFor="normal" className="cursor-pointer">
                Normal
              </Label>
            </div>
            <div className="flex items-center space-x-3">
              <RadioGroupItem value="comfortable" id="comfortable" />
              <Label htmlFor="comfortable" className="cursor-pointer">
                Confortável
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
