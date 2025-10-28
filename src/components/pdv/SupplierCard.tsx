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
          {supplier.cnpj && (
            <p className="text-sm text-muted-foreground">
              CNPJ: {supplier.cnpj}
            </p>
          )}
        </div>
        <Badge variant={supplier.is_active ? "default" : "secondary"}>
          {supplier.is_active ? "Ativo" : "Inativo"}
        </Badge>
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
              <span>
                {[supplier.city, supplier.state].filter(Boolean).join(" - ")}
              </span>
            </div>
          )}
        </div>

        {supplier.notes && (
          <p className="text-sm text-muted-foreground border-t pt-3">
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
