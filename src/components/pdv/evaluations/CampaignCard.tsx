import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Users, Clock, HelpCircle, MoreVertical, Copy, Power, Trash2, ExternalLink, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { CampaignWithStats } from "@/hooks/use-evaluation-campaigns";
import { useUpdateCampaign, useDeleteCampaign } from "@/hooks/use-evaluation-campaigns";
import { EditCampaignDialog } from "./EditCampaignDialog";
import { deferMenuAction } from "@/lib/ui/defer-menu-action";

interface CampaignCardProps {
  campaign: CampaignWithStats;
  onClick: () => void;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `há ${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days}d`;
  return `há ${Math.floor(days / 30)}m`;
}

function getNpsColor(nps: number): string {
  if (nps >= 9) return "bg-emerald-500";
  if (nps >= 7) return "bg-yellow-500";
  return "bg-red-500";
}

function getNpsLabel(nps: number): string {
  if (nps >= 9) return "Excelente";
  if (nps >= 7) return "Bom";
  if (nps >= 5) return "Regular";
  return "Crítico";
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = `${window.location.origin}/avaliar/${campaign.id}`;
    navigator.clipboard.writeText(link);
    toast.success("Link copiado!");
  };

  const handleToggleActive = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateCampaign.mutate({ id: campaign.id, is_active: !campaign.is_active });
  };

  const handleDelete = () => {
    deleteCampaign.mutate(campaign.id, {
      onSuccess: () => setDeleteOpen(false),
      onError: () => {
        toast.error("Erro ao excluir campanha");
        setDeleteOpen(false);
      },
    });
  };

  const npsPercent = campaign.avg_nps !== null ? (campaign.avg_nps / 10) * 100 : 0;

  return (
    <>
      <Card
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 group relative"
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate">{campaign.name}</CardTitle>
              {campaign.description && (
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{campaign.description}</p>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Badge
                variant={campaign.is_active ? "default" : "secondary"}
                className="text-[10px] px-2 py-0"
              >
                {campaign.is_active ? "Ativa" : "Inativa"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); deferMenuAction(() => setEditOpen(true)); }}>
                    <Pencil className="h-4 w-4 mr-2" /> Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" /> Copiar link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => window.open(`/avaliar/${campaign.id}`, "_blank")}>
                    <ExternalLink className="h-4 w-4 mr-2" /> Abrir formulário
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleToggleActive}>
                    <Power className="h-4 w-4 mr-2" />
                    {campaign.is_active ? "Desativar" : "Ativar"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => { e.stopPropagation(); deferMenuAction(() => setDeleteOpen(true)); }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          {/* NPS indicator */}
          {campaign.avg_nps !== null ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">NPS Médio</span>
                <span className="font-semibold">
                  {(campaign.avg_nps ?? 0).toFixed(1)} — {getNpsLabel(campaign.avg_nps ?? 0)}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getNpsColor(campaign.avg_nps)}`}
                  style={{ width: `${npsPercent}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 rounded-md px-2.5 py-1.5">
              <Clock className="h-3.5 w-3.5" />
              Aguardando primeira resposta
            </div>
          )}

          {/* Stats row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {campaign.total_responses} {campaign.total_responses === 1 ? "resposta" : "respostas"}
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                {campaign.question_count} {campaign.question_count === 1 ? "pergunta" : "perguntas"}
              </span>
            </div>
            {campaign.last_response_at && (
              <span className="text-[11px]">
                {formatTimeAgo(campaign.last_response_at)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir campanha</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir "{campaign.name}"? Todas as respostas serão perdidas. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <EditCampaignDialog
        campaign={campaign}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </>
  );
}
