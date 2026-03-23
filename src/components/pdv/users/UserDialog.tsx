import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { RolePermissionsView, roleConfig } from "./RolePermissionsView";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, ChevronDown, ChevronUp } from "lucide-react";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    display_name: string;
    email: string;
    phone: string;
    role: string;
    password?: string;
  }) => void;
  editingUser?: {
    id: string;
    display_name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
  } | null;
  isLoading?: boolean;
}

export function UserDialog({ open, onOpenChange, onSave, editingUser, isLoading }: UserDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("garcom");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [discountPassword, setDiscountPassword] = useState("");
  const [maxDiscountPercent, setMaxDiscountPercent] = useState("100");

  const isEditing = !!editingUser;

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.display_name || "");
      setEmail(editingUser.email || "");
      setPhone(editingUser.phone || "");
      setRole(editingUser.role);
      setDiscountPassword((editingUser as any).discount_password || "");
      setMaxDiscountPercent(String((editingUser as any).max_discount_percent ?? 100));
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("garcom");
      setDiscountPassword("");
      setMaxDiscountPercent("100");
    }
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirm(false);
    setPermissionsOpen(false);
  }, [editingUser, open]);

  const passwordError = !isEditing && password.length > 0 && password.length < 6
    ? "Mínimo de 6 caracteres"
    : "";
  const confirmError = !isEditing && confirmPassword.length > 0 && confirmPassword !== password
    ? "As senhas não conferem"
    : "";

  const isValid = name.trim() &&
    (isEditing || (email.trim() && password.length >= 6 && confirmPassword === password));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      display_name: name,
      email,
      phone,
      role,
      ...(isEditing ? {} : { password }),
    });
  };

  const selectedConfig = roleConfig[role];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Usuário" : "Convidar Novo Usuário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column — personal data */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Dados Pessoais
              </h3>

              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do colaborador"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  E-mail {!isEditing && <span className="text-destructive">*</span>}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemplo.com"
                  required={!isEditing}
                  disabled={isEditing}
                />
                {isEditing && (
                  <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado.</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              {/* Password fields — only for new users */}
              {!isEditing && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-destructive">{passwordError}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha *</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repita a senha"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {confirmError && (
                      <p className="text-xs text-destructive">{confirmError}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right column — role selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Função
              </h3>

              <RadioGroup value={role} onValueChange={setRole} className="space-y-1.5">
                {Object.entries(roleConfig).map(([key, config]) => {
                  const RoleIcon = config.permissions[0]?.icon;
                  return (
                    <label
                      key={key}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all",
                        role === key
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:bg-muted/50"
                      )}
                    >
                      <RadioGroupItem value={key} className="shrink-0" />
                      {RoleIcon && (
                        <span className={cn("p-1.5 rounded-md shrink-0", config.color)}>
                          <RoleIcon className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium block">{config.label}</span>
                        <p className="text-[11px] text-muted-foreground leading-tight truncate">
                          {config.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>
          </div>

          {/* Collapsible permissions view */}
          {selectedConfig && (
            <Collapsible open={permissionsOpen} onOpenChange={setPermissionsOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2 border-t pt-4"
                >
                  {permissionsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Permissões de {selectedConfig.label}
                  <span className="text-xs font-normal">
                    ({selectedConfig.permissions.length} módulos)
                  </span>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2">
                <RolePermissionsView role={role} />
              </CollapsibleContent>
            </Collapsible>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading ? "Salvando..." : isEditing ? "Salvar Alterações" : "Criar Usuário"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
