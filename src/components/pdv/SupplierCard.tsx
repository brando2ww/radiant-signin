import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Mail, Phone, MapPin, User } from "lucide-react";
import { PDVSupplier } from "@/hooks/use-pdv-suppliers";

interface SupplierCardProps {
  supplier: PDVSupplier;
  onEdit: (supplier: PDVSupplier) => void;
  onDelete: (id: string) => void;
}

export function SupplierCard({ supplier, onEdit, onDelete }: SupplierCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-lg">{supplier.name}</CardTitle>
          {supplier.company_name && (
            <p className="text-xs text-muted-foreground">
              {supplier.company_name}
            </p>
          )}
          {supplier.cnpj && (
            <p className="text-sm text-muted-foreground">
              CNPJ: {supplier.cnpj}
            </p>
          )}
          {!supplier.cnpj && supplier.cpf && (
            <p className="text-sm text-muted-foreground">
              CPF: {supplier.cpf}
            </p>
          )}
          {(supplier.state_registration || supplier.municipal_registration) && (
            <div className="flex gap-2 text-xs text-muted-foreground">
              {supplier.state_registration && <span>IE: {supplier.state_registration}</span>}
              {supplier.municipal_registration && <span>IM: {supplier.municipal_registration}</span>}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge variant={supplier.is_active ? "default" : "secondary"}>
            {supplier.is_active ? "Ativo" : "Inativo"}
          </Badge>
          {supplier.is_billing_address && (
            <Badge variant="outline" className="text-xs">
              Endereço de cobrança
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          {supplier.contact_name && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{supplier.contact_name}</span>
            </div>
          )}

          {supplier.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              <span>{supplier.phone}</span>
            </div>
          )}

          {supplier.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              <span className="truncate">{supplier.email}</span>
            </div>
          )}

          {(supplier.city || supplier.state) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">
                {[supplier.city, supplier.state].filter(Boolean).join(" - ")}
              </span>
            </div>
          )}

          {supplier.neighborhood && (
            <div className="text-xs text-muted-foreground ml-6">
              {supplier.neighborhood}
            </div>
          )}
        </div>

        {(supplier.payment_terms || supplier.delivery_time) && (
          <div className="border-t pt-3 space-y-1 text-xs text-muted-foreground">
            {supplier.payment_terms && (
              <div>
                <span className="font-medium">Pagamento:</span> {supplier.payment_terms.replace(/_/g, ' ')}
              </div>
            )}
            {supplier.delivery_time && (
              <div>
                <span className="font-medium">Entrega:</span> {supplier.delivery_time} {supplier.delivery_time_unit === 'hours' ? 'horas' : 'dias'}
              </div>
            )}
          </div>
        )}

        {supplier.notes && (
          <p className="text-sm text-muted-foreground border-t pt-3 line-clamp-2">
            {supplier.notes}
          </p>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(supplier)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(supplier.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
