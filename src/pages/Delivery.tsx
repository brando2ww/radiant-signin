import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MenuTab } from "@/components/delivery/MenuTab";
import { OrdersTab } from "@/components/delivery/OrdersTab";
import { CouponsTab } from "@/components/delivery/CouponsTab";
import { SettingsTab } from "@/components/delivery/SettingsTab";
import { ReportsTab } from "@/components/delivery/ReportsTab";
import { Package, ShoppingBag, Tag, Settings, BarChart3 } from "lucide-react";
import { AppLayout } from "@/components/layouts/AppLayout";

const Delivery = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Delivery</h1>
          <p className="text-muted-foreground">
            Gerencie seu sistema de delivery completo
          </p>
        </div>

        <Tabs defaultValue="menu" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Pedidos</span>
            </TabsTrigger>
            <TabsTrigger value="menu" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Cardápio</span>
            </TabsTrigger>
            <TabsTrigger value="coupons" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Cupons</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-6">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="menu" className="mt-6">
            <MenuTab />
          </TabsContent>

          <TabsContent value="coupons" className="mt-6">
            <CouponsTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Delivery;
