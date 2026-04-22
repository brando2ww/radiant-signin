import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreVertical, Pencil, UserX, UserCheck, Trash2 } from "lucide-react";
import { roleConfig } from "./RolePermissionsView";
import { cn } from "@/lib/utils";

interface UserCardProps {
  user: {
    id: string;
    display_name: string | null;
    email: string | null;
    phone: string | null;
    role: string;
    is_active: boolean;
  };
  onEdit: (user: any) => void;
  onToggleActive: (userId: string, isActive: boolean) => void;
  onDelete?: (userId: string) => void;
}

export function UserCard({ user, onEdit, onToggleActive, onDelete }: UserCardProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const config = roleConfig[user.role];
  const initials = (user.display_name || user.email || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <>
      <Card className={cn("transition-all", !user.is_active && "opacity-60")}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-sm truncate">
                  {user.display_name || "Sem nome"}
                </p>
                {!user.is_active && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Inativo</Badge>
                )}
              </div>
              {user.email && (
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              )}
              {user.phone && (
                <p className="text-xs text-muted-foreground">{user.phone}</p>
              )}
              <Badge className={cn("text-[10px] mt-1", config?.color)}>
                {config?.label || user.role}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleActive(user.id, !user.is_active)}>
                  {user.is_active ? (
                    <>
                      <UserX className="h-4 w-4 mr-2" />
                      Desativar
                    </>
                  ) : (
                    <>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Reativar
                    </>
                  )}
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setConfirmOpen(true)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>

      {onDelete && (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação é <strong>permanente</strong>. {user.display_name || user.email} perderá o
                acesso ao sistema imediatamente e o vínculo com o estabelecimento será apagado.
                Histórico de vendas e comandas é preservado.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(user.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
