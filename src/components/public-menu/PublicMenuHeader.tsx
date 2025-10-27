import { useBusinessSettings, usePublicSettings } from "@/hooks/use-public-menu";
import { Star, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PublicMenuHeaderProps {
  userId: string;
}

export const PublicMenuHeader = ({ userId }: PublicMenuHeaderProps) => {
  const { data: businessSettings } = useBusinessSettings(userId);
  const { data: deliverySettings } = usePublicSettings(userId);

  return (
    <div className="border-b bg-card">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-start gap-4">
          {businessSettings?.logo_url && (
            <img
              src={businessSettings.logo_url}
              alt="Logo"
              className="h-16 w-16 rounded-lg object-cover"
            />
          )}
          <div className="flex-1">
            <h1 className="text-2xl font-bold">
              {businessSettings?.business_name || "Restaurante"}
            </h1>
            {businessSettings?.business_slogan && (
              <p className="text-sm text-muted-foreground">
                {businessSettings.business_slogan}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.8</span>
                <span className="text-muted-foreground">(234)</span>
              </div>
              {deliverySettings?.estimated_preparation_time && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{deliverySettings.estimated_preparation_time} min</span>
                </div>
              )}
              {deliverySettings?.default_delivery_fee !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>Taxa: R$ {Number(deliverySettings.default_delivery_fee).toFixed(2)}</span>
                </div>
              )}
              {deliverySettings?.min_order_value !== undefined &&
                deliverySettings.min_order_value > 0 && (
                  <span className="text-muted-foreground">
                    Pedido mín: R$ {Number(deliverySettings.min_order_value).toFixed(2)}
                  </span>
                )}
              {deliverySettings?.is_open ? (
                <Badge className="bg-green-500">Aberto agora</Badge>
              ) : (
                <Badge variant="destructive">Fechado</Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
