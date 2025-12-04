import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigTab } from "@/components/evaluations/ConfigTab";
import { PersonalizationTab } from "@/components/evaluations/PersonalizationTab";
import { ReportsTab } from "@/components/evaluations/ReportsTab";
import { AppLayout } from "@/components/layouts/AppLayout";

const Evaluations = () => {
  return (
    <AppLayout>
      <div className="container mx-auto py-6 px-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Avaliações</h1>
          <p className="text-muted-foreground">
            Configure e acompanhe as avaliações do seu estabelecimento
          </p>
        </div>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="config">Configuração</TabsTrigger>
            <TabsTrigger value="personalization">Personalização</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="mt-6">
            <ConfigTab />
          </TabsContent>

          <TabsContent value="personalization" className="mt-6">
            <PersonalizationTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Evaluations;
