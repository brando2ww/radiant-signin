import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/contexts/AuthContext";
import { Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskQRCodeDialog({ open, onOpenChange }: Props) {
  const { user } = useAuth();
  const url = `${window.location.origin}/tarefas/${user?.id}`;

  const copy = () => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copiado!" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>QR Code — Tarefas</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG value={url} size={200} />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            Imprima e cole na cozinha. A equipe escaneia para ver e marcar as tarefas do dia.
          </p>
          <Button variant="outline" size="sm" onClick={copy} className="w-full">
            <Copy className="h-4 w-4 mr-2" /> Copiar Link
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
