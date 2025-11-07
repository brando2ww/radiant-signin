import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderTree } from "lucide-react";

export default function ChartOfAccounts() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Plano de Contas</h1>
          <p className="text-muted-foreground mt-1">
            Estrutura hierárquica de categorias contábeis
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-success" />
              <span className="text-2xl font-bold">0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">contas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold">0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">contas cadastradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Custos (CMV)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-warning" />
              <span className="text-2xl font-bold">0</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">contas cadastradas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estrutura de Contas</CardTitle>
          <CardDescription>Visualização hierárquica do plano de contas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma conta cadastrada ainda</p>
            <p className="text-sm mt-2">Configure seu plano de contas para categorizar transações</p>
            <Button variant="outline" className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Criar Estrutura Básica
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
