import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, ArrowRightLeft, Move, FileClock, DoorClosed } from "lucide-react";
import { usePDVPermissions } from "@/hooks/use-pdv-permissions";

export interface ActionMenuProps {
  onChangeTable?: () => void;
  onTransfer?: () => void;
  onCloseAttendance?: () => void;
  onHistory?: () => void;
  contextLabel?: string;
}

export function ActionMenu({
  onChangeTable,
  onTransfer,
  onCloseAttendance,
  onHistory,
  contextLabel = "Ações",
}: ActionMenuProps) {
  const { can } = usePDVPermissions();

  const showChange = onChangeTable && can("change_table");
  const showTransfer =
    onTransfer &&
    (can("transfer_comanda_to_comanda") ||
      can("transfer_table_to_table") ||
      can("transfer_table_to_comanda") ||
      can("transfer_comanda_to_table"));
  const showClose = onCloseAttendance && can("close_attendance");
  const showHistory = onHistory && can("view_history");

  if (!showChange && !showTransfer && !showClose && !showHistory) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label="Ações">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{contextLabel}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showChange && (
          <DropdownMenuItem onClick={onChangeTable}>
            <Move className="h-4 w-4 mr-2" /> Trocar mesa
          </DropdownMenuItem>
        )}
        {showTransfer && (
          <DropdownMenuItem onClick={onTransfer}>
            <ArrowRightLeft className="h-4 w-4 mr-2" /> Transferir consumo
          </DropdownMenuItem>
        )}
        {showClose && (
          <DropdownMenuItem onClick={onCloseAttendance}>
            <DoorClosed className="h-4 w-4 mr-2" /> Encerrar atendimento
          </DropdownMenuItem>
        )}
        {showHistory && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onHistory}>
              <FileClock className="h-4 w-4 mr-2" /> Ver histórico
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
