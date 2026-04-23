import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { BottomTabBar } from "@/components/garcom/BottomTabBar";
import { GarcomActionFab } from "@/components/garcom/GarcomActionFab";
import { NewOrderSheet } from "@/components/garcom/NewOrderSheet";
import { ComandaDialog } from "@/components/pdv/ComandaDialog";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { usePDVCashier } from "@/hooks/use-pdv-cashier";
import { toast } from "sonner";
import GarcomMesas from "./garcom/GarcomMesas";
import GarcomComandas from "./garcom/GarcomComandas";
import GarcomComandaDetalhe from "./garcom/GarcomComandaDetalhe";
import GarcomAdicionarItem from "./garcom/GarcomAdicionarItem";
import GarcomMesaDetalhe from "./garcom/GarcomMesaDetalhe";
import GarcomCozinha from "./garcom/GarcomCozinha";
import GarcomItens from "./garcom/GarcomItens";
import GarcomItemDetalhe from "./garcom/GarcomItemDetalhe";

export default function Garcom() {
  const navigate = useNavigate();
  const { createComanda, isCreating } = usePDVComandas();
  const { activeSession, isLoadingSession } = usePDVCashier();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [comandaDialogOpen, setComandaDialogOpen] = useState(false);

  const handleSelectMesa = () => {
    setSheetOpen(false);
    navigate("/garcom");
  };

  const handleSelectComandaAvulsa = () => {
    setSheetOpen(false);
    if (isLoadingSession) {
      toast.info("Carregando caixa...", { position: "top-center" });
      return;
    }
    if (!activeSession) {
      toast.error("Abra o caixa antes de criar uma comanda.", { position: "top-center" });
      return;
    }
    setComandaDialogOpen(true);
  };

  const handleCreateComanda = async (data: {
    customerName?: string;
    notes?: string;
    tableNumber?: number;
  }) => {
    const comanda = await createComanda({
      customerName: data.customerName,
      notes: data.notes,
    });
    navigate(`/garcom/comanda/${comanda.id}`);
  };

  return (
    <div data-garcom-root className="min-h-screen bg-background pb-28 font-montserrat">
      <Routes>
        <Route index element={<GarcomMesas />} />
        <Route path="comandas" element={<GarcomComandas />} />
        <Route path="comanda/:id" element={<GarcomComandaDetalhe />} />
        <Route path="comanda/:id/adicionar" element={<GarcomAdicionarItem />} />
        <Route path="mesa/:id" element={<GarcomMesaDetalhe />} />
        <Route path="itens" element={<GarcomItens />} />
        <Route path="itens/:id" element={<GarcomItemDetalhe />} />
        <Route path="cozinha" element={<GarcomCozinha />} />
      </Routes>
      <BottomTabBar onNewComanda={() => setSheetOpen(true)} />
      <GarcomActionFab />
      <NewOrderSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSelectMesa={handleSelectMesa}
        onSelectComandaAvulsa={handleSelectComandaAvulsa}
      />
      <ComandaDialog
        open={comandaDialogOpen}
        onOpenChange={setComandaDialogOpen}
        onSubmit={handleCreateComanda}
        isLoading={isCreating}
      />
    </div>
  );
}
