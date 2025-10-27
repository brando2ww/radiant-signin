import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDeliverySettings, useCreateOrUpdateSettings } from "@/hooks/use-delivery-settings";
import { toast } from "sonner";

const marketingSchema = z.object({
  meta_pixel_id: z.string().trim().optional().refine(
    (val) => !val || /^\d{15,16}$/.test(val),
    { message: "ID do Meta Pixel deve ter 15-16 dígitos numéricos" }
  ),
  google_tag_id: z.string().trim().optional().refine(
    (val) => !val || /^(GTM-[A-Z0-9]{7}|G-[A-Z0-9]{10})$/.test(val),
    { message: "ID deve ser no formato GTM-XXXXXXX ou G-XXXXXXXXXX" }
  ),
});

type MarketingFormData = z.infer<typeof marketingSchema>;

export const MarketingSettings = () => {
  const { data: settings, isLoading } = useDeliverySettings();
  const updateSettings = useCreateOrUpdateSettings();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<MarketingFormData>({
    resolver: zodResolver(marketingSchema),
    defaultValues: {
      meta_pixel_id: settings?.meta_pixel_id || "",
      google_tag_id: settings?.google_tag_id || "",
    },
    values: {
      meta_pixel_id: settings?.meta_pixel_id || "",
      google_tag_id: settings?.google_tag_id || "",
    },
  });

  const metaPixelValue = watch("meta_pixel_id");
  const googleTagValue = watch("google_tag_id");

  const onSubmit = (data: MarketingFormData) => {
    updateSettings.mutate({
      meta_pixel_id: data.meta_pixel_id || null,
      google_tag_id: data.google_tag_id || null,
    });
  };

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Meta Pixel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Meta Pixel (Facebook)</CardTitle>
              <CardDescription>
                Rastreie conversões de seus anúncios no Facebook e Instagram
              </CardDescription>
            </div>
            {metaPixelValue ? (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Ativo
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <X className="h-3 w-3" />
                Inativo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta_pixel_id">ID do Meta Pixel</Label>
            <Input
              id="meta_pixel_id"
              placeholder="123456789012345"
              {...register("meta_pixel_id")}
              className={errors.meta_pixel_id ? "border-destructive" : ""}
            />
            {errors.meta_pixel_id && (
              <p className="text-sm text-destructive">{errors.meta_pixel_id.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Encontre seu ID em: Meta Events Manager → Fonte de Dados → ID do Pixel
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Exemplo de código que será inserido:</p>
            <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{`<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${metaPixelValue || "SEU_PIXEL_ID"}');
</script>`}
            </pre>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open("https://business.facebook.com/events_manager2/list/pixel", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Meta Events Manager
          </Button>
        </CardContent>
      </Card>

      {/* Google Tag */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Google Tag</CardTitle>
              <CardDescription>
                Configure Google Tag Manager ou Google Analytics 4
              </CardDescription>
            </div>
            {googleTagValue ? (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Ativo
              </Badge>
            ) : (
              <Badge variant="secondary" className="gap-1">
                <X className="h-3 w-3" />
                Inativo
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="google_tag_id">ID do Google Tag</Label>
            <Input
              id="google_tag_id"
              placeholder="GTM-XXXXXXX ou G-XXXXXXXXXX"
              {...register("google_tag_id")}
              className={errors.google_tag_id ? "border-destructive" : ""}
            />
            {errors.google_tag_id && (
              <p className="text-sm text-destructive">{errors.google_tag_id.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use GTM-XXXXXXX para Tag Manager ou G-XXXXXXXXXX para Analytics 4
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Exemplo de código que será inserido:</p>
            <pre className="text-xs bg-background p-3 rounded border overflow-x-auto">
{googleTagValue?.startsWith('GTM-') ? 
`<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${googleTagValue || "GTM-XXXXXXX"}');
</script>` :
`<script async src="https://www.googletagmanager.com/gtag/js?id=${googleTagValue || "G-XXXXXXXXXX"}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${googleTagValue || "G-XXXXXXXXXX"}');
</script>`}
            </pre>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => window.open("https://tagmanager.google.com/", "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir Google Tag Manager
          </Button>
        </CardContent>
      </Card>

      {/* Eventos Rastreados */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Rastreados Automaticamente</CardTitle>
          <CardDescription>
            Os seguintes eventos são enviados para suas ferramentas quando configuradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { name: "PageView", description: "Quando o cliente acessa o cardápio", fb: "PageView", ga: "page_view" },
              { name: "ViewContent", description: "Quando o cliente vê detalhes de um produto", fb: "ViewContent", ga: "view_item" },
              { name: "AddToCart", description: "Quando o cliente adiciona ao carrinho", fb: "AddToCart", ga: "add_to_cart" },
              { name: "InitiateCheckout", description: "Quando o cliente inicia o checkout", fb: "InitiateCheckout", ga: "begin_checkout" },
              { name: "Purchase", description: "Quando o pedido é confirmado", fb: "Purchase", ga: "purchase" },
            ].map((event, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className="rounded-full bg-primary/10 p-1 mt-0.5">
                  <Check className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 space-y-1">
                  <h4 className="font-medium text-sm">{event.name}</h4>
                  <p className="text-xs text-muted-foreground">{event.description}</p>
                  <div className="flex gap-2 text-xs">
                    <Badge variant="outline" className="font-mono">{event.fb}</Badge>
                    <Badge variant="outline" className="font-mono">{event.ga}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={updateSettings.isPending}>
        {updateSettings.isPending ? "Salvando..." : "Salvar Configurações"}
      </Button>
    </form>
  );
};