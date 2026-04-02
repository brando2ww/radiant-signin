import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDeliveryRecipes } from "@/hooks/use-delivery-recipes";
import { usePDVIngredients } from "@/hooks/use-pdv-ingredients";
import { Trash2, Plus, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeliveryRecipeManagerProps {
  productId: string;
  productPrice: number;
}

export function DeliveryRecipeManager({ productId, productPrice }: DeliveryRecipeManagerProps) {
  const { recipes, isLoading, addIngredient, updateQuantity, removeIngredient, calculateCMV, calculateMargin } = useDeliveryRecipes(productId);
  const { ingredients } = usePDVIngredients();

  const [selectedIngredientId, setSelectedIngredientId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");

  const availableIngredients = ingredients.filter(
    (ing) => !recipes.some((recipe) => recipe.ingredient_id === ing.id)
  );

  const cmv = calculateCMV(recipes);
  const margin = calculateMargin(productPrice, cmv);
  const isLowMargin = margin < 30;
  const isNegativeMargin = margin < 0;

  const handleAddIngredient = () => {
    if (!selectedIngredientId || !quantity || Number(quantity) <= 0) return;
    addIngredient({ productId, ingredientId: selectedIngredientId, quantity: Number(quantity) });
    setSelectedIngredientId("");
    setQuantity("");
  };

  const handleUpdateQuantity = (id: string, newQuantity: string) => {
    const numQuantity = Number(newQuantity);
    if (numQuantity > 0) updateQuantity({ id, quantity: numQuantity });
  };

  if (isLoading) {
    return <div className="p-4 text-center text-muted-foreground">Carregando receita...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3"><CardDescription>CMV Total</CardDescription></CardHeader>
          <CardContent><div className="text-2xl font-bold">R$ {cmv.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardDescription>Preço de Venda</CardDescription></CardHeader>
          <CardContent><div className="text-2xl font-bold">R$ {productPrice.toFixed(2)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardDescription>Margem de Lucro</CardDescription></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`text-2xl font-bold ${isNegativeMargin ? 'text-destructive' : isLowMargin ? 'text-warning' : 'text-success'}`}>
                {margin.toFixed(1)}%
              </div>
              {isNegativeMargin ? (
                <TrendingDown className="h-5 w-5 text-destructive" />
              ) : isLowMargin ? (
                <AlertTriangle className="h-5 w-5 text-warning" />
              ) : (
                <TrendingUp className="h-5 w-5 text-success" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {isNegativeMargin && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção!</strong> O preço de venda está abaixo do custo. Você está tendo prejuízo neste produto.
          </AlertDescription>
        </Alert>
      )}

      {isLowMargin && !isNegativeMargin && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Margem baixa!</strong> A margem de lucro está abaixo de 30%. Considere aumentar o preço ou reduzir custos.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Insumo</CardTitle>
          <CardDescription>Selecione os insumos que compõem este produto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Insumo</Label>
              <Select value={selectedIngredientId} onValueChange={setSelectedIngredientId}>
                <SelectTrigger><SelectValue placeholder="Selecione um insumo" /></SelectTrigger>
                <SelectContent>
                  {availableIngredients.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">Nenhum insumo disponível</div>
                  ) : (
                    availableIngredients.map((ingredient) => (
                      <SelectItem key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} ({ingredient.unit})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Label>Quantidade</Label>
              <Input type="number" step="0.001" placeholder="0.000" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddIngredient} disabled={!selectedIngredientId || !quantity}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ficha Técnica</CardTitle>
          <CardDescription>Insumos e custos que compõem este produto</CardDescription>
        </CardHeader>
        <CardContent>
          {recipes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum insumo adicionado à receita ainda</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Insumo</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead>Unidade</TableHead>
                    <TableHead className="text-right">Custo Unit.</TableHead>
                    <TableHead className="text-right">Custo Total</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipes.map((recipe) => (
                    <TableRow key={recipe.id}>
                      <TableCell className="font-medium">{recipe.ingredient_name}</TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          step="0.001"
                          className="w-24 ml-auto text-right"
                          value={recipe.quantity}
                          onChange={(e) => handleUpdateQuantity(recipe.id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell><Badge variant="outline">{recipe.ingredient_unit}</Badge></TableCell>
                      <TableCell className="text-right">R$ {recipe.ingredient_unit_cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">R$ {recipe.total_cost.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => removeIngredient({ id: recipe.id, productId })}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={4} className="text-right">CMV Total:</TableCell>
                    <TableCell className="text-right">R$ {cmv.toFixed(2)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
