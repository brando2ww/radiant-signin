import { Routes, Route } from "react-router-dom";
import { BottomTabBar } from "@/components/garcom/BottomTabBar";
import { usePDVComandas } from "@/hooks/use-pdv-comandas";
import { useNavigate } from "react-router-dom";
import GarcomMesas from "./garcom/GarcomMesas";
import GarcomComandas from "./garcom/GarcomComandas";
import GarcomComandaDetalhe from "./garcom/GarcomComandaDetalhe";
import GarcomAdicionarItem from "./garcom/GarcomAdicionarItem";
import GarcomMesaDetalhe from "./garcom/GarcomMesaDetalhe";
import GarcomCozinha from "./garcom/GarcomCozinha";

export default function Garcom() {
  const navigate = useNavigate();
  const { createComanda } = usePDVComandas();

  const handleNewComanda = async () => {
    try {
      const comanda = await createComanda({});
      navigate(`/garcom/comanda/${comanda.id}`);
    } catch {
      // toast handled by hook
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route index element={<GarcomMesas />} />
        <Route path="comandas" element={<GarcomComandas />} />
        <Route path="comanda/:id" element={<GarcomComandaDetalhe />} />
        <Route path="comanda/:id/adicionar" element={<GarcomAdicionarItem />} />
        <Route path="mesa/:id" element={<GarcomMesaDetalhe />} />
        <Route path="cozinha" element={<GarcomCozinha />} />
      </Routes>
      <BottomTabBar onNewComanda={handleNewComanda} />
    </div>
  );
}
