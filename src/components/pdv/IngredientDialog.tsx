import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { BarcodeInput } from "@/components/ui/barcode-input";
import { Plus } from "lucide-react";
import { PDVIngredient } from "@/hooks/use-pdv-ingredients";
import { usePDVSuppliers, useCreateSupplier } from "@/hooks/use-pdv-suppliers";
import { useIngredientCategories } from "@/hooks/use-ingredient-categories";
import { usePDVSectors } from "@/hooks/use-pdv-sectors";
import { usePDVCostCenters } from "@/hooks/use-pdv-cost-centers";
import { CategoryQuickDialog } from "./CategoryQuickDialog";
import { SectorQuickDialog } from "./SectorQuickDialog";
import { CostCenterQuickDialog } from "./CostCenterQuickDialog";
import { SupplierDialog } from "./SupplierDialog";

interface IngredientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ingredient: PDVIngredient | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

const UNITS = [
  { value: "kg", label: "Quilograma (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "l", label: "Litro (l)" },
  { value: "ml", label: "Mililitro (ml)" },
  { value: "un", label: "Unidade (un)" },
  { value: "cx", label: "Caixa (cx)" },
  { value: "pct", label: "Pacote (pct)" },
  { value: "dz", label: "Duzia (dz)" },
];

const FISCAL_ORIGINS = [
  { value: "0", label: "0 - Nacional" },
  { value: "1", label: "1 - Estrangeira - Importacao Direta" },
  { value: "2", label: "2 - Estrangeira - Adquirida no Mercado Interno" },
  { value: "3", label: "3 - Nacional com mais de 40% de conteudo estrangeiro" },
  { value: "4", label: "4 - Nacional conforme processos produtivos basicos" },
  { value: "5", label: "5 - Nacional com menos de 40% de conteudo estrangeiro" },
  { value: "6", label: "6 - Estrangeira - Importacao Direta sem similar nacional" },
  { value: "7", label: "7 - Estrangeira - Adquirida no mercado interno sem similar" },
  { value: "8", label: "8 - Nacional com mais de 70% de conteudo estrangeiro" },
];

export function IngredientDialog({
  open,
  onOpenChange,
  ingredient,
  onSubmit,
  isSubmitting,
}: IngredientDialogProps) {
  const { suppliers } = usePDVSuppliers();
  const { mutate: createSupplier, isPending: isCreatingSupplier } = useCreateSupplier();
  const { categories, createCategory, isCreating: isCreatingCategory } = useIngredientCategories();
  const { sectors, createSector, isCreating: isCreatingSector } = usePDVSectors();
  const { costCenters, createCostCenter, isCreating: isCreatingCostCenter } = usePDVCostCenters();
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [sectorDialogOpen, setSectorDialogOpen] = useState(false);
  const [costCenterDialogOpen, setCostCenterDialogOpen] = useState(false);
  const [supplierDialogOpen, setSupplierDialogOpen] = useState(false);

  const activeSuppliers = suppliers.filter(s => s.is_active);

  const form = useForm({
    defaultValues: {
      code: ingredient?.code || "",
      name: ingredient?.name || "",
      category: ingredient?.category || "",
      unit: ingredient?.unit || "un",
      supplier_id: ingredient?.supplier_id || "none",
      current_stock: ingredient?.current_stock || 0,
      min_stock: ingredient?.min_stock || 0,
      max_stock: ingredient?.max_stock || 0,
      purchase_lot: ingredient?.purchase_lot || 0,
      expiration_date: ingredient?.expiration_date || "",
      unit_cost: ingredient?.unit_cost || 0,
      real_cost: ingredient?.real_cost || 0,
      selling_price: ingredient?.selling_price || 0,
      loss_percentage: ingredient?.loss_percentage || 0,
      icms_rate: ingredient?.icms_rate || 0,
      origin: ingredient?.origin || "0",
      ean: ingredient?.ean || "",
      ean_quantity: ingredient?.ean_quantity || 1,
      factory_code: ingredient?.factory_code || "",
      automatic_output: ingredient?.automatic_output || "none",
      sector: ingredient?.sector || "",
      cost_center: ingredient?.cost_center || "",
      observations: ingredient?.observations || "",
    },
  });

  useEffect(() => {
    if (open) {
      if (ingredient) {
        form.reset({
          code: ingredient.code || "",
          name: ingredient.name || "",
          category: ingredient.category || "",
          unit: ingredient.unit || "un",
          supplier_id: ingredient.supplier_id || "none",
          current_stock: ingredient.current_stock || 0,
          min_stock: ingredient.min_stock || 0,
          max_stock: ingredient.max_stock || 0,
          purchase_lot: ingredient.purchase_lot || 0,
          expiration_date: ingredient.expiration_date || "",
          unit_cost: ingredient.unit_cost || 0,
          real_cost: ingredient.real_cost || 0,
          selling_price: ingredient.selling_price || 0,
          loss_percentage: ingredient.loss_percentage || 0,
          icms_rate: ingredient.icms_rate || 0,
          origin: ingredient.origin || "0",
          ean: ingredient.ean || "",
          ean_quantity: ingredient.ean_quantity || 1,
          factory_code: ingredient.factory_code || "",
          automatic_output: ingredient.automatic_output || "none",
          sector: ingredient.sector || "",
          cost_center: ingredient.cost_center || "",
          observations: ingredient.observations || "",
        });
      } else {
        form.reset({
          code: "",
          name: "",
          category: "",
          unit: "un",
          supplier_id: "none",
          current_stock: 0,
          min_stock: 0,
          max_stock: 0,
          purchase_lot: 0,
          expiration_date: "",
          unit_cost: 0,
          real_cost: 0,
          selling_price: 0,
          loss_percentage: 0,
          icms_rate: 0,
          origin: "0",
          ean: "",
          ean_quantity: 1,
          factory_code: "",
          automatic_output: "none",
          sector: "",
          cost_center: "",
          observations: "",
        });
      }
    }
  }, [ingredient, open]);

  const handleSubmit = form.handleSubmit((data) => {
    const avgCost = data.unit_cost * (1 + data.loss_percentage / 100);
    const currentBalance = data.current_stock * avgCost;
    
    onSubmit({
      ...data,
      supplier_id: data.supplier_id === "none" ? null : data.supplier_id,
      category: data.category || null,
      sector: data.sector || null,
      cost_center: data.cost_center || null,
      average_cost: avgCost,
      current_balance: currentBalance,
    });
    form.reset();
  });

  const handleCreateCategory = async (name: string) => {
    await createCategory(name);
    form.setValue("category", name);
  };

  const handleCreateSector = async (name: string) => {
    await createSector({ name });
    form.setValue("sector", name);
  };

  const handleCreateCostCenter = async (name: string) => {
    await createCostCenter(name);
    form.setValue("cost_center", name);
  };

  const handleCreateSupplier = (data: any) => {
    createSupplier(data, {
      onSuccess: (newSupplier) => {
        form.setValue("supplier_id", newSupplier.id);
        setSupplierDialogOpen(false);
      },
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {ingredient ? "Editar Insumo" : "Novo Insumo"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="general">Gerais</TabsTrigger>
                  <TabsTrigger value="stock">Estoque</TabsTrigger>
                  <TabsTrigger value="costs">Custos</TabsTrigger>
                  <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
                  <TabsTrigger value="control">Controle</TabsTrigger>
                  <TabsTrigger value="notes">Obs</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Codigo</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Auto-gerado" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descricao *</FormLabel>
                          <FormControl>
                            <Input {...field} required />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Grupo/Categoria</FormLabel>
                          <div className="flex gap-2">
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (
                                  <SelectItem key={cat.id} value={cat.name}>
                                    {cat.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => setCategoryDialogOpen(true)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidade *</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {UNITS.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="supplier_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fornecedor</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um fornecedor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">Nenhum</SelectItem>
                              {activeSuppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setSupplierDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="stock" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="current_stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Atual *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="min_stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Minimo *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="max_stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estoque Maximo</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="purchase_lot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Lote de Compra</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiration_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Validade</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="costs" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="unit_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custo Unitario *</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || ''}
                              onChange={(v) => field.onChange(v ? parseFloat(v) : 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="real_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custo Real</FormLabel>
                          <FormControl>
                            <CurrencyInput
                              value={field.value || ''}
                              onChange={(v) => field.onChange(v ? parseFloat(v) : 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="selling_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor de Venda</FormLabel>
                        <FormControl>
                          <CurrencyInput
                            value={field.value || ''}
                            onChange={(v) => field.onChange(v ? parseFloat(v) : 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loss_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Perda % - {field.value}%</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={0.5}
                            value={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="fiscal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="icms_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ICMS %</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="origin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origem</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FISCAL_ORIGINS.map((origin) => (
                                <SelectItem key={origin.value} value={origin.value}>
                                  {origin.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ean"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EAN (Codigo de Barras)</FormLabel>
                          <FormControl>
                            <BarcodeInput {...field} placeholder="Digite ou escaneie" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ean_quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantidade por EAN</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="factory_code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codigo de Fabrica</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="control" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="automatic_output"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Saida Automatica</FormLabel>
                        <FormControl>
                          <RadioGroup
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id="none" />
                              <Label htmlFor="none">Nenhuma</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="sale" id="sale" />
                              <Label htmlFor="sale">Saida pela Venda</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="entry" id="entry" />
                              <Label htmlFor="entry">Saida pela Entrada</Label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="sector"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Setor</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {sectors.map((sector) => (
                                <SelectItem key={sector.id} value={sector.name}>
                                  {sector.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setSectorDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cost_center"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Centro de Custo</FormLabel>
                        <div className="flex gap-2">
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {costCenters.map((cc) => (
                                <SelectItem key={cc.id} value={cc.name}>
                                  {cc.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setCostCenterDialogOpen(true)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="notes" className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="observations"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observacoes Gerais</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            rows={8}
                            placeholder="Anotacoes, detalhes adicionais, instrucoes especiais..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : ingredient ? "Salvar" : "Criar"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <CategoryQuickDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        onSubmit={handleCreateCategory}
        isSubmitting={isCreatingCategory}
      />

      <SectorQuickDialog
        open={sectorDialogOpen}
        onOpenChange={setSectorDialogOpen}
        onSubmit={handleCreateSector}
        isSubmitting={isCreatingSector}
      />

      <CostCenterQuickDialog
        open={costCenterDialogOpen}
        onOpenChange={setCostCenterDialogOpen}
        onSubmit={handleCreateCostCenter}
        isSubmitting={isCreatingCostCenter}
      />

      <SupplierDialog
        open={supplierDialogOpen}
        onOpenChange={setSupplierDialogOpen}
        supplier={null}
        onSubmit={handleCreateSupplier}
        isSubmitting={isCreatingSupplier}
      />
    </>
  );
}
