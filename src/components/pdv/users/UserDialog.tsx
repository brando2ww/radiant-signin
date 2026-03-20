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
import { cn } from "@/lib/utils";

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: {
    display_name: string;
    email: string;
    phone: string;
    role: string;
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

  useEffect(() => {
    if (editingUser) {
      setName(editingUser.display_name || "");
      setEmail(editingUser.email || "");
      setPhone(editingUser.phone || "");
      setRole(editingUser.role);
    } else {
      setName("");
      setEmail("");
      setPhone("");
      setRole("garcom");
    }
  }, [editingUser, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ display_name: name, email, phone, role });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Editar Usuário" : "Convidar Usuário"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do colaborador"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
              />
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
          </div>

          <div className="space-y-3">
            <Label>Função (Role)</Label>
            <RadioGroup value={role} onValueChange={setRole} className="space-y-2">
              {Object.entries(roleConfig).map(([key, config]) => (
                <label
                  key={key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    role === key
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                >
                  <RadioGroupItem value={key} />
                  <div className="flex-1">
                    <span className="text-sm font-medium">{config.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{config.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {role && (
            <div className="space-y-2 pt-2 border-t">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Permissões de {roleConfig[role]?.label}
              </Label>
              <RolePermissionsView role={role} />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!name || isLoading}>
              {isLoading ? "Salvando..." : editingUser ? "Salvar" : "Convidar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
