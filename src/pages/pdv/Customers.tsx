import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Users, UserCheck, Megaphone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  usePDVCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
  useConvertLeadToCustomer,
  type UnifiedCustomer,
  type CustomerLead,
} from "@/hooks/use-pdv-customers";
import { CustomerCard } from "@/components/pdv/CustomerCard";
import { CustomerDialog } from "@/components/pdv/CustomerDialog";
import { CustomerFilters } from "@/components/pdv/CustomerFilters";
import { LeadCard } from "@/components/pdv/LeadCard";

export default function Customers() {
  const { customers, leads, isLoading } = usePDVCustomers();
  const { mutate: createCustomer, isPending: isCreating } = useCreateCustomer();
  const { mutate: updateCustomer, isPending: isUpdating } = useUpdateCustomer();
  const { mutate: deleteCustomer, isPending: isDeleting } = useDeleteCustomer();
  const { mutate: convertLead, isPending: isConverting } = useConvertLeadToCustomer();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<UnifiedCustomer | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [leadSearch, setLeadSearch] = useState("");

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase());
      const matchesSource = sourceFilter === "all" || c.source === sourceFilter;
      return matchesSearch && matchesSource;
    });
  }, [customers, search, sourceFilter]);

  const filteredLeads = useMemo(() => {
    if (!leadSearch) return leads;
    const q = leadSearch.toLowerCase();
    return leads.filter(
      (l) =>
        l.customer_name.toLowerCase().includes(q) ||
        l.customer_whatsapp.includes(q)
    );
  }, [leads, leadSearch]);

  // Check which lead phones already exist as customers
  const customerPhones = useMemo(() => {
    const set = new Set<string>();
    for (const c of customers) {
      if (c.phone) set.add(c.phone.replace(/\D/g, ""));
    }
    return set;
  }, [customers]);

  const handleCreate = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (customer: UnifiedCustomer) => {
    setSelectedCustomer(customer);
    setDialogOpen(true);
  };

  const handleSubmit = (data: any) => {
    if (selectedCustomer) {
      updateCustomer(
        { id: selectedCustomer.id, updates: data },
        { onSuccess: () => setDialogOpen(false) }
      );
    } else {
      createCustomer(data, { onSuccess: () => setDialogOpen(false) });
    }
  };

  const handleDelete = () => {
    if (deleteDialog) {
      deleteCustomer(deleteDialog, { onSuccess: () => setDeleteDialog(null) });
    }
  };

  const handleConvertLead = (lead: CustomerLead) => {
    convertLead(lead);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-5 w-80" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie todos os clientes do estabelecimento
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Tabs defaultValue="customers">
        <TabsList>
          <TabsTrigger value="customers" className="gap-2">
            <UserCheck className="h-4 w-4" />
            Clientes ({customers.length})
          </TabsTrigger>
          <TabsTrigger value="leads" className="gap-2">
            <Megaphone className="h-4 w-4" />
            Leads ({leads.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <CustomerFilters
            search={search}
            onSearchChange={setSearch}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            totalCount={customers.length}
            filteredCount={filteredCustomers.length}
          />

          {filteredCustomers.length === 0 ? (
            <Card>
              <CardContent className="min-h-[300px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">
                      {customers.length === 0 ? "Nenhum cliente cadastrado" : "Nenhum cliente encontrado"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {customers.length === 0
                        ? "Cadastre clientes manualmente ou eles aparecerão automaticamente via delivery"
                        : "Tente ajustar os filtros de busca"}
                    </p>
                  </div>
                  {customers.length === 0 && (
                    <Button onClick={handleCreate}>
                      <Plus className="h-4 w-4 mr-2" />
                      Cadastrar Cliente
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCustomers.map((customer) => (
                <CustomerCard
                  key={`${customer.source}-${customer.id}`}
                  customer={customer}
                  onEdit={handleEdit}
                  onDelete={(id) => setDeleteDialog(id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lead por nome ou WhatsApp..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {filteredLeads.length} leads capturados via avaliações
            </span>
          </div>

          {filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="min-h-[300px] flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Megaphone className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">Nenhum lead encontrado</h3>
                    <p className="text-sm text-muted-foreground">
                      Leads aparecem quando clientes preenchem avaliações
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.customer_whatsapp}
                  lead={lead}
                  onConvert={handleConvertLead}
                  isConverting={isConverting}
                  alreadyCustomer={customerPhones.has(lead.customer_whatsapp.replace(/\D/g, ""))}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={selectedCustomer}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <AlertDialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
