import { Routes, Route, Navigate } from "react-router-dom";
import { ModuleGuard } from "@/components/ModuleGuard";
import { PDVNavBar } from "@/components/pdv/PDVNavBar";
import PDVDashboard from "./pdv/Dashboard";
import PDVSalon from "./pdv/Salon";
import PDVBalcao from "./pdv/Balcao";
import PDVCashier from "./pdv/Cashier";
import PDVKitchen from "./pdv/Kitchen";
import PDVProducts from "./pdv/Products";
import PDVStock from "./pdv/Stock";
import PDVReports from "./pdv/Reports";

export default function PDV() {
  return (
    <ModuleGuard module="pdv">
      <div className="flex flex-col h-screen w-full">
        <PDVNavBar />
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route index element={<Navigate to="/pdv/dashboard" replace />} />
            <Route path="dashboard" element={<PDVDashboard />} />
            <Route path="salao" element={<PDVSalon />} />
            <Route path="balcao" element={<PDVBalcao />} />
            <Route path="caixa" element={<PDVCashier />} />
            <Route path="cozinha" element={<PDVKitchen />} />
            <Route path="produtos" element={<PDVProducts />} />
            <Route path="estoque" element={<PDVStock />} />
            <Route path="relatorios" element={<PDVReports />} />
          </Routes>
        </div>
      </div>
    </ModuleGuard>
  );
}
