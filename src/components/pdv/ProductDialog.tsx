import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PDVProduct } from "@/hooks/use-pdv-products";
import { useProductImageUpload } from "@/hooks/use-product-image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { Image as ImageIcon, Upload, X } from "lucide-react";
import { ProductRecipeManager } from "./ProductRecipeManager";
import { usePDVRecipes } from "@/hooks/use-pdv-recipes";

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: PDVProduct | null;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSubmit,
  isSubmitting,
}: ProductDialogProps) {
  const { uploadImage, isUploading } = useProductImageUpload();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { calculateCMV, recipes } = usePDVRecipes(product?.id);

  const form = useForm({
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      category: product?.category || "",
      image_url: product?.image_url || "",
      price_salon: product?.price_salon || 0,
      price_balcao: product?.price_balcao || 0,
      price_delivery: product?.price_delivery || 0,
      preparation_time: product?.preparation_time || 15,
      serves: product?.serves || 1,
      is_available: product?.is_available ?? true,
      is_sold_by_weight: product?.is_sold_by_weight ?? false,
      ncm: product?.ncm || "",
      cest: product?.cest || "",
      cfop: product?.cfop || "",
      origin: product?.origin || "",
      cst_icms: product?.cst_icms || "",
      csosn: product?.csosn || "",
      icms_rate: product?.icms_rate || 0,
      pis_cst: product?.pis_cst || "",
      pis_rate: product?.pis_rate || 0,
      cofins_cst: product?.cofins_cst || "",
      cofins_rate: product?.cofins_rate || 0,
      tax_unit: product?.tax_unit || "",
      ean: product?.ean || "",
    },
  });

  const currentPrice = form.watch("price_salon") || 0;
  const cmv = calculateCMV(recipes);

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        description: product.description || "",
        category: product.category,
        image_url: product.image_url || "",
        price_salon: product.price_salon,
        price_balcao: product.price_balcao || 0,
        price_delivery: product.price_delivery || 0,
        preparation_time: product.preparation_time,
        serves: product.serves,
        is_available: product.is_available,
        is_sold_by_weight: product.is_sold_by_weight,
        ncm: product.ncm || "",
        cest: product.cest || "",
        cfop: product.cfop || "",
        origin: product.origin || "",
        cst_icms: product.cst_icms || "",
        csosn: product.csosn || "",
        icms_rate: product.icms_rate || 0,
        pis_cst: product.pis_cst || "",
        pis_rate: product.pis_rate || 0,
        cofins_cst: product.cofins_cst || "",
        cofins_rate: product.cofins_rate || 0,
        tax_unit: product.tax_unit || "",
        ean: product.ean || "",
      });
    }
  }, [product, form]);

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
    form.reset();
    setPreviewImage(null);
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = await uploadImage(file);
      if (url) {
        form.setValue("image_url", url);
        setPreviewImage(url);
      }
    }
  };

  const currentImage = previewImage || form.watch("image_url");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
          <DialogDescription>
            Configure as informações do produto para o PDV
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
             <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Básico</TabsTrigger>
                <TabsTrigger value="pricing">Preços</TabsTrigger>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger value="recipe" disabled={!product}>
                        Receita
                      </TabsTrigger>
                    </TooltipTrigger>
                    {!product && (
                      <TooltipContent>
                        <p>Salve o produto primeiro para configurar a receita</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
                <TabsTrigger value="fiscal">Fiscal</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Imagem do Produto</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                          {currentImage ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                              <img
                                src={currentImage}
                                alt="Preview"
                                className="w-full h-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2"
                                onClick={() => {
                                  form.setValue("image_url", "");
                                  setPreviewImage(null);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 cursor-pointer transition-colors">
                              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                {isUploading ? (
                                  <>
                                    <Upload className="h-8 w-8 animate-pulse" />
                                    <span className="text-sm">Enviando...</span>
                                  </>
                                ) : (
                                  <>
                                    <ImageIcon className="h-8 w-8" />
                                    <span className="text-sm">
                                      Clique para fazer upload
                                    </span>
                                  </>
                                )}
                              </div>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                              />
                            </label>
                          )}
                        </div>
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
                      <FormLabel>Nome *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pizza Margherita" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva os ingredientes e características..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Pizzas, Bebidas..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preparation_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tempo de Preparo (min)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serves"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Serve (pessoas)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="pricing" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="price_salon"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Salão *</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value || ''}
                          onChange={(v) => field.onChange(v ? Number(v) : 0)}
                        />
                      </FormControl>
                      <FormDescription>
                        Preço para consumo no salão
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_balcao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Balcão</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value || ''}
                          onChange={(v) => field.onChange(v ? Number(v) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Preço para retirada no balcão
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_delivery"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Delivery</FormLabel>
                      <FormControl>
                        <CurrencyInput
                          value={field.value || ''}
                          onChange={(v) => field.onChange(v ? Number(v) : null)}
                        />
                      </FormControl>
                      <FormDescription>
                        Preço para entrega
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_available"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Disponível para venda</FormLabel>
                        <FormDescription>
                          Produto aparecerá nos canais de venda
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_sold_by_weight"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Vendido por peso</FormLabel>
                        <FormDescription>
                          Produto vendido em gramas/quilos
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="recipe" className="space-y-4 mt-4">
                {product ? (
                  <ProductRecipeManager 
                    productId={product.id} 
                    productPrice={currentPrice}
                  />
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Salve o produto primeiro para configurar a receita
                  </div>
                )}
              </TabsContent>

              <TabsContent value="fiscal" className="space-y-6 mt-4">
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identificação</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="ean"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>EAN / GTIN</FormLabel>
                          <FormControl>
                            <Input placeholder="7891234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="ncm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NCM</FormLabel>
                          <FormControl>
                            <Input placeholder="21069090" maxLength={8} {...field} />
                          </FormControl>
                          <FormDescription>8 dígitos</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="cest"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CEST</FormLabel>
                        <FormControl>
                          <Input placeholder="1700700" maxLength={7} {...field} />
                        </FormControl>
                        <FormDescription>Código Especificador da Substituição Tributária</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">ICMS</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="origin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origem</FormLabel>
                          <FormControl>
                            <Input placeholder="0" maxLength={1} {...field} />
                          </FormControl>
                          <FormDescription>0=Nacional, 1=Estrangeira importação direta...</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cfop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CFOP</FormLabel>
                          <FormControl>
                            <Input placeholder="5102" maxLength={4} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="cst_icms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CST ICMS</FormLabel>
                          <FormControl>
                            <Input placeholder="00" maxLength={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="csosn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CSOSN</FormLabel>
                          <FormControl>
                            <Input placeholder="102" maxLength={4} {...field} />
                          </FormControl>
                          <FormDescription>Simples Nacional</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="icms_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota ICMS %</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="18.00"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">PIS / COFINS</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="pis_cst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CST PIS</FormLabel>
                          <FormControl>
                            <Input placeholder="01" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="pis_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota PIS %</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="1.65"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cofins_cst"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CST COFINS</FormLabel>
                          <FormControl>
                            <Input placeholder="01" maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cofins_rate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alíquota COFINS %</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="7.60"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Unidade Tributável</h4>
                  <FormField
                    control={form.control}
                    name="tax_unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unidade</FormLabel>
                        <FormControl>
                          <Input placeholder="UN, KG, L, CX..." {...field} />
                        </FormControl>
                        <FormDescription>Unidade de medida tributável do produto</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
              <Button type="submit" disabled={isSubmitting || isUploading}>
                {isSubmitting ? "Salvando..." : product ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
