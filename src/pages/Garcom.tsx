import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { BottomTabBar } from "@/components/garcom/BottomTabBar";
import { NewOrderSheet } from "@/components/garcom/NewOrderSheet";
import { ComandaDialog } from "@/components/pdv/ComandaDialog";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { usePDVCashier } from "@/hooks/use-pdv-cashier";
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
  const { activeSession } = usePDVCashier();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [comandaDialogOpen, setComandaDialogOpen] = useState(false);

  const handleSelectMesa = () => {
    setSheetOpen(false);
    navigate("/garcom");
  };

  const handleSelectComandaAvulsa = () => {
    setSheetOpen(false);
    if (!activeSession) {
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
    <div className="min-h-screen bg-background">
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
