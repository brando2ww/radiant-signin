import { useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Phone, Mail, FileText, Calendar, Store, Truck, Package, Clock } from "lucide-react";
import { usePDVCustomers, useUpdateCustomer } from "@/hooks/use-pdv-customers";
import { useCustomerOrders } from "@/hooks/use-customer-orders";
import { CustomerDialog } from "@/components/pdv/CustomerDialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusLabels: Record<string, string> = {
  open: "Aberto",
  preparing: "Preparando",
  ready: "Pronto",
  delivered: "Entregue",
  closed: "Fechado",
  cancelled: "Cancelado",
  pending: "Pendente",
  confirmed: "Confirmado",
  out_for_delivery: "Em entrega",
};

const statusColors: Record<string, string> = {
  closed: "bg-muted text-muted-foreground",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-destructive/10 text-destructive",
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  preparing: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  ready: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  out_for_delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
};

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const source = (searchParams.get("source") as "pdv" | "delivery") || "pdv";
  const navigate = useNavigate();
  const { customers } = usePDVCustomers();
  const updateCustomer = useUpdateCustomer();
  const [editOpen, setEditOpen] = useState(false);

  const customer = customers.find((c) => c.id === id);
  const { data: orders = [], isLoading: loadingOrders } = useCustomerOrders(id, source);

  if (!customer) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Button variant="ghost" onClick={() => navigate("/pdv/clientes")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <p className="text-muted-foreground">Cliente não encontrado.</p>
      </div>
    );
  }

  const handleEditSubmit = (data: any) => {
    updateCustomer.mutate(
      { id: customer.id, updates: { name: data.name, phone: data.phone || null, cpf: data.cpf || null, email: data.email || null, birth_date: data.birth_date || null, notes: data.notes || null } },
      { onSuccess: () => setEditOpen(false) }
    );
  };

  const SourceIcon = source === "pdv" ? Store : Truck;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/pdv/clientes")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{customer.name}</h1>
            <Badge variant="secondary" className="gap-1 mt-1">
              <SourceIcon className="h-3 w-3" />
              {source === "pdv" ? "PDV" : "Delivery"}
            </Badge>
          </div>
        </div>
        {source === "pdv" && (
          <Button onClick={() => setEditOpen(true)}>
            <Edit className="h-4 w-4 mr-2" /> Editar
          </Button>
        )}
      </div>

      {/* Info + Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {customer.phone && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 shrink-0" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.cpf && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 shrink-0" />
                <span>CPF: {customer.cpf}</span>
              </div>
            )}
            {customer.birth_date && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Nasc: {format(new Date(customer.birth_date), "dd/MM/yyyy")}</span>
              </div>
            )}
            {customer.notes && (
              <div className="pt-2 border-t text-muted-foreground">
                <p className="text-xs font-medium text-foreground mb-1">Observações</p>
                <p>{customer.notes}</p>
              </div>
            )}
            {!customer.phone && !customer.email && !customer.cpf && !customer.birth_date && (
              <p className="text-muted-foreground italic">Nenhum dado adicional cadastrado.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total gasto</span>
              <span className="font-semibold text-foreground">
                {customer.total_spent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visitas</span>
              <span className="font-semibold text-foreground">{customer.visit_count}</span>
            </div>
            {customer.last_visit && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última visita</span>
                <span className="font-semibold text-foreground">
                  {format(new Date(customer.last_visit), "dd/MM/yyyy")}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente desde</span>
              <span className="font-semibold text-foreground">
                {format(new Date(customer.created_at), "MMM/yyyy", { locale: ptBR })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pedidos registrados</span>
              <span className="font-semibold text-foreground">{orders.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Histórico de Pedidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOrders ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : orders.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-8">
              Nenhum pedido registrado para este cliente.
            </p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const OrderIcon = order.source === "pdv" ? Package : Truck;
                return (
                  <div
                    key={order.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="shrink-0">
                      <OrderIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-foreground">
                          Pedido #{order.order_number}
                        </span>
                        <Badge variant="outline" className={`text-xs ${statusColors[order.status] || ""}`}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {order.created_at
                          ? format(new Date(order.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                          : "—"}
                        {" · "}
                        {order.source === "pdv" ? "PDV" : "Delivery"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-foreground shrink-0">
                      {order.total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {source === "pdv" && (
        <CustomerDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          customer={customer}
          onSubmit={handleEditSubmit}
          isSubmitting={updateCustomer.isPending}
        />
      )}
    </div>
  );
}
