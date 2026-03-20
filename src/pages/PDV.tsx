import { Routes, Route, Navigate } from "react-router-dom";
import { ModuleGuard } from "@/components/ModuleGuard";
import { PDVHeaderNav } from "@/components/pdv/PDVHeaderNav";
import { PDVUserMenu } from "@/components/pdv/PDVUserMenu";
import { PDVNotifications } from "@/components/pdv/PDVNotifications";
import { CashierStatus } from "@/components/pdv/CashierStatus";
import { Logo } from "@/components/ui/logo";
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
import DeliveryOrders from "./pdv/delivery/Orders";
import DeliveryMenu from "./pdv/delivery/Menu";
import DeliveryPersonalization from "./pdv/delivery/Personalization";
import DeliveryCoupons from "./pdv/delivery/Coupons";
import DeliverySettings from "./pdv/delivery/Settings";
import DeliveryReports from "./pdv/delivery/Reports";
import ComandasPage from "./pdv/Comandas";
import Quotations from "./pdv/purchases/Quotations";
import PurchaseOrders from "./pdv/purchases/PurchaseOrders";
import ShoppingList from "./pdv/purchases/ShoppingList";
import Integrations from "./pdv/Integrations";
import Users from "./pdv/Users";

export default function PDV() {
  return (
    <ModuleGuard module="pdv">
      <div className="flex flex-col min-h-screen w-full">
        {/* Header com navegação */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center px-4 gap-4">
            {/* Logo */}
            <Logo size="lg" className="shrink-0" />
            
            {/* Navegação */}
            <PDVHeaderNav />
            
            {/* Spacer */}
            <div className="flex-1" />
            
            {/* Ações */}
            <div className="flex items-center gap-2">
              <CashierStatus />
              <PDVNotifications />
              <PDVUserMenu />
            </div>
          </div>
        </header>

        {/* Conteúdo Principal */}
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
              <Route path="comandas" element={<ComandasPage />} />
              
              {/* Delivery */}
              <Route path="delivery/pedidos" element={<DeliveryOrders />} />
              <Route path="delivery/cardapio" element={<DeliveryMenu />} />
              <Route path="delivery/personalizacao" element={<DeliveryPersonalization />} />
              <Route path="delivery/cupons" element={<DeliveryCoupons />} />
              <Route path="delivery/configuracoes" element={<DeliverySettings />} />
              <Route path="delivery/relatorios" element={<DeliveryReports />} />
              
              {/* Administrador */}
              <Route path="dashboard" element={<PDVDashboard />} />
              <Route path="produtos" element={<PDVProducts />} />
              <Route path="estoque" element={<PDVStock />} />
              <Route path="fornecedores" element={<PDVSuppliers />} />
              <Route path="notas-fiscais" element={<Invoices />} />
              <Route path="relatorios" element={<PDVReports />} />
              <Route path="configuracoes" element={<PDVSettings />} />
              <Route path="usuarios/*" element={<Users />} />
              
              {/* Compras */}
              <Route path="compras/cotacoes" element={<Quotations />} />
              <Route path="compras/pedidos" element={<PurchaseOrders />} />
              <Route path="compras/lista" element={<ShoppingList />} />
              
              {/* Integrações */}
              <Route path="integracoes/*" element={<Integrations />} />
            </Routes>
          </main>
      </div>
    </ModuleGuard>
  );
}
