import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { ModuleSelector } from "@/components/super-admin/ModuleSelector";
import { useTenants } from "@/hooks/use-tenants";

export default function TenantForm() {
  const navigate = useNavigate();
  const { createTenant, tenants } = useTenants();

  const [name, setName] = useState("");
  const [document, setDocument] = useState("");
  const [parentTenantId, setParentTenantId] = useState("");
  const [modules, setModules] = useState<string[]>(["pdv"]);
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordsMatch = adminPassword === confirmPassword;
  const isValid =
    name.trim() &&
    adminName.trim() &&
    adminEmail.trim() &&
    adminPassword.length >= 6 &&
    passwordsMatch &&
    modules.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    await createTenant.mutateAsync({
      name,
      document: document || undefined,
      modules,
      admin_name: adminName,
      admin_email: adminEmail,
      admin_phone: adminPhone || undefined,
      admin_password: adminPassword,
    });

    navigate("/admin/tenants");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/admin/tenants")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Novo Tenant</h1>
          <p className="text-sm text-muted-foreground">
            Crie uma empresa e seu usuário administrador
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados da Empresa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da empresa *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Restaurante Sabor & Arte"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document">CNPJ / CPF</Label>
              <Input
                id="document"
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="00.000.000/0000-00"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Módulos Habilitados</CardTitle>
          </CardHeader>
          <CardContent>
            <ModuleSelector selected={modules} onChange={setModules} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Administrador (Proprietário)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminName">Nome *</Label>
                <Input
                  id="adminName"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adminEmail">E-mail *</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="adminPhone">Telefone</Label>
              <Input
                id="adminPhone"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adminPassword">Senha *</Label>
                <div className="relative">
                  <Input
                    id="adminPassword"
                    type={showPassword ? "text" : "password"}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a senha"
                />
                {confirmPassword && !passwordsMatch && (
                  <p className="text-xs text-destructive">As senhas não conferem</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/tenants")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={!isValid || createTenant.isPending}>
            {createTenant.isPending ? "Criando..." : "Criar Tenant"}
          </Button>
        </div>
      </form>
    </div>
  );
}
