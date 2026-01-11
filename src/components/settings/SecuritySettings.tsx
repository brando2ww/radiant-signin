import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { securitySettingsSchema, type SecuritySettings } from "@/lib/validations/settings";
import { useEffect, useState } from "react";
import { Trash2, ShieldCheck, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { use2FA } from "@/hooks/use-2fa";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SecuritySettingsProps {
  settings: SecuritySettings;
  onSave: (settings: SecuritySettings) => void;
  saving: boolean;
}

export function SecuritySettingsComponent({ settings, onSave, saving }: SecuritySettingsProps) {
  const form = useForm<SecuritySettings>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: settings,
  });

  const navigate = useNavigate();
  const { user } = useAuth();
  const { checkHasVerifiedWhatsApp } = use2FA();
  const [hasVerifiedWhatsApp, setHasVerifiedWhatsApp] = useState<boolean | null>(null);
  const [checkingWhatsApp, setCheckingWhatsApp] = useState(false);

  useEffect(() => {
    form.reset(settings);
  }, [settings, form]);

  // Check WhatsApp verification status
  useEffect(() => {
    const checkWhatsApp = async () => {
      if (!user) return;
      setCheckingWhatsApp(true);
      const verified = await checkHasVerifiedWhatsApp(user.id);
      setHasVerifiedWhatsApp(verified);
      setCheckingWhatsApp(false);
    };
    checkWhatsApp();
  }, [user, checkHasVerifiedWhatsApp]);

  const handleDeleteAccount = () => {
    // TODO: Implementar exclusão de conta
    console.log("Excluir conta");
  };

  const handleTwoFactorChange = async (enabled: boolean, onChange: (value: boolean) => void) => {
    if (enabled) {
      // Check if user has verified WhatsApp
      if (hasVerifiedWhatsApp === false) {
        toast.warning("Você precisa verificar seu WhatsApp primeiro para ativar o 2FA");
        navigate("/whatsapp");
        return;
      }
    }
    onChange(enabled);
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSave)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Autenticação
              </CardTitle>
              <CardDescription>Configure segurança e autenticação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Alert if WhatsApp not verified */}
              {hasVerifiedWhatsApp === false && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Para ativar a autenticação de dois fatores, você precisa primeiro{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto font-semibold"
                      onClick={() => navigate("/whatsapp")}
                    >
                      verificar seu WhatsApp
                    </Button>
                    .
                  </AlertDescription>
                </Alert>
              )}

              <FormField
                control={form.control}
                name="two_factor_enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center gap-2">
                        Autenticação de Dois Fatores (2FA)
                        {field.value && (
                          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-0.5 rounded-full">
                            Ativo
                          </span>
                        )}
                      </FormLabel>
                      <FormDescription>
                        {field.value
                          ? "Código será enviado para seu WhatsApp a cada login"
                          : "Adicione uma camada extra de segurança via WhatsApp"
                        }
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={(enabled) => handleTwoFactorChange(enabled, field.onChange)}
                        disabled={checkingWhatsApp || hasVerifiedWhatsApp === null}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="auto_logout_minutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logout Automático ({field.value} minutos)</FormLabel>
                    <FormDescription>Tempo de inatividade antes de desconectar</FormDescription>
                    <FormControl>
                      <Slider
                        min={5}
                        max={120}
                        step={5}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Privacidade</CardTitle>
              <CardDescription>Controle a exibição de informações sensíveis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="hide_values"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Ocultar Valores por Padrão</FormLabel>
                      <FormDescription>Exibir valores mascarados na interface</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="require_password_sensitive"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Senha para Operações Sensíveis</FormLabel>
                      <FormDescription>Solicitar senha para ações importantes</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
              <CardDescription>Ações irreversíveis - proceda com cautela</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir Conta Permanentemente
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Isso irá excluir permanentemente sua conta e remover todos os
                      seus dados de nossos servidores.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Sim, excluir minha conta
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => form.reset()}>
              Resetar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
