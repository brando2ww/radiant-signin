import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionNavBar } from "@/components/ui/sidebar";
import { MenuTab } from "@/components/delivery/MenuTab";
import { Package, ShoppingBag, Tag, Settings, BarChart3 } from "lucide-react";

const Delivery = () => {
  return (
    <div className="flex h-screen w-full">
      <SessionNavBar />
      <main className="ml-[3.05rem] flex h-screen grow flex-col overflow-auto">
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
              <div className="text-center text-muted-foreground py-8">
                Funcionalidade de Pedidos em breve...
              </div>
            </TabsContent>

            <TabsContent value="menu" className="mt-6">
              <MenuTab />
            </TabsContent>

            <TabsContent value="coupons" className="mt-6">
              <div className="text-center text-muted-foreground py-8">
                Funcionalidade de Cupons em breve...
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="text-center text-muted-foreground py-8">
                Funcionalidade de Configurações em breve...
              </div>
            </TabsContent>

            <TabsContent value="reports" className="mt-6">
              <div className="text-center text-muted-foreground py-8">
                Funcionalidade de Relatórios em breve...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Delivery;
