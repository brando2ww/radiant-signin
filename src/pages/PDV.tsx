import { Routes, Route, Navigate } from "react-router-dom";
import { ModuleGuard } from "@/components/ModuleGuard";
import { PDVSidebar } from "@/components/pdv/PDVSidebar";
import { PDVUserMenu } from "@/components/pdv/PDVUserMenu";
import { PDVNotifications } from "@/components/pdv/PDVNotifications";
import { CashierStatus } from "@/components/pdv/CashierStatus";
import PDVDashboard from "./pdv/Dashboard";
import PDVSalon from "./pdv/Salon";
import PDVBalcao from "./pdv/Balcao";
import PDVCashier from "./pdv/Cashier";
import PDVKitchen from "./pdv/Kitchen";
import PDVProducts from "./pdv/Products";
import PDVStock from "./pdv/Stock";
import PDVSuppliers from "./pdv/Suppliers";
import PDVReports from "./pdv/Reports";
import PDVSettings from "./pdv/Settings";
import Invoices from "./pdv/Invoices";
import FinancialTransactions from "./pdv/financial/FinancialTransactions";
import AccountsPayable from "./pdv/financial/AccountsPayable";
import AccountsReceivable from "./pdv/financial/AccountsReceivable";
import CashFlow from "./pdv/financial/CashFlow";
import ChartOfAccounts from "./pdv/financial/ChartOfAccounts";
import CostCenters from "./pdv/financial/CostCenters";
import DRE from "./pdv/financial/DRE";
import ProductCMV from "./pdv/financial/ProductCMV";
import GeneralCMV from "./pdv/financial/GeneralCMV";

export default function PDV() {
  return (
    <ModuleGuard module="pdv">
      <div className="flex min-h-screen w-full">
        <PDVSidebar />
        
        <div className="flex flex-col flex-1 w-full ml-14">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-14 items-center px-4 gap-4">
              <div className="flex-1" />
              
              {/* Actions */}
              <div className="flex items-center gap-2">
                <CashierStatus />
                <PDVNotifications />
                <PDVUserMenu />
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route index element={<Navigate to="/pdv/dashboard" replace />} />
              
              {/* Financeiro */}
              <Route path="financeiro/lancamentos" element={<FinancialTransactions />} />
              <Route path="financeiro/contas-pagar" element={<AccountsPayable />} />
              <Route path="financeiro/contas-receber" element={<AccountsReceivable />} />
              <Route path="financeiro/fluxo-caixa" element={<CashFlow />} />
              <Route path="financeiro/plano-contas" element={<ChartOfAccounts />} />
              <Route path="financeiro/centros-custo" element={<CostCenters />} />
              <Route path="financeiro/dre" element={<DRE />} />
              <Route path="financeiro/cmv-produtos" element={<ProductCMV />} />
              <Route path="financeiro/cmv-geral" element={<GeneralCMV />} />
              
              {/* Frente de Caixa */}
              <Route path="salao" element={<PDVSalon />} />
              <Route path="balcao" element={<PDVBalcao />} />
              <Route path="caixa" element={<PDVCashier />} />
              <Route path="cozinha" element={<PDVKitchen />} />
              
              {/* Administrador */}
              <Route path="dashboard" element={<PDVDashboard />} />
              <Route path="produtos" element={<PDVProducts />} />
              <Route path="estoque" element={<PDVStock />} />
              <Route path="fornecedores" element={<PDVSuppliers />} />
              <Route path="notas-fiscais" element={<Invoices />} />
              <Route path="relatorios" element={<PDVReports />} />
              <Route path="configuracoes" element={<PDVSettings />} />
            </Routes>
          </main>
        </div>
      </div>
    </ModuleGuard>
  );
}
