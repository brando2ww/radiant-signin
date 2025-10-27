import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfigTab } from "@/components/evaluations/ConfigTab";
import { ReportsTab } from "@/components/evaluations/ReportsTab";

const Evaluations = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Avaliações</h1>
        <p className="text-muted-foreground">
          Configure e acompanhe as avaliações do seu estabelecimento
        </p>
      </div>

      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="config" className="mt-6">
          <ConfigTab />
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Evaluations;
