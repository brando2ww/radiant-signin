import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUserModules } from "@/hooks/use-user-modules";
import { toast } from "sonner";

export function useFranchiseImport() {
  const { tenantId } = useUserModules();
  const queryClient = useQueryClient();

  // Get current tenant info including parent
  const { data: tenantInfo, isLoading: loadingTenant } = useQuery({
    queryKey: ["franchise-tenant-info", tenantId],
    queryFn: async () => {
      if (!tenantId) return null;
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, parent_tenant_id, owner_user_id")
        .eq("id", tenantId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const parentTenantId = tenantInfo?.parent_tenant_id;
  const isChildTenant = !!parentTenantId;

  // === CHILD TENANT: Get parent tenant info ===
  const { data: parentTenant } = useQuery({
    queryKey: ["franchise-parent-info", parentTenantId],
    queryFn: async () => {
      if (!parentTenantId) return null;
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, owner_user_id")
        .eq("id", parentTenantId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!parentTenantId,
  });

  // Get parent products (child view)
  const { data: parentProducts = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["franchise-parent-products", parentTenant?.owner_user_id],
    queryFn: async () => {
      if (!parentTenant?.owner_user_id) return [];
      const { data, error } = await supabase
        .from("pdv_products")
        .select("id, name, category, price_salon, price_balcao, price_delivery, image_url, is_available")
        .eq("user_id", parentTenant.owner_user_id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!parentTenant?.owner_user_id,
  });

  // Get parent tables (child view)
  const { data: parentTables = [], isLoading: loadingTables } = useQuery({
    queryKey: ["franchise-parent-tables", parentTenant?.owner_user_id],
    queryFn: async () => {
      if (!parentTenant?.owner_user_id) return [];
      const { data, error } = await supabase
        .from("pdv_tables")
        .select("id, table_number, capacity, shape, is_active")
        .eq("user_id", parentTenant.owner_user_id)
        .eq("is_active", true)
        .order("table_number");
      if (error) throw error;
      return data;
    },
    enabled: !!parentTenant?.owner_user_id,
  });

  // Get already-imported product IDs
  const { data: importedProductIds = [] } = useQuery({
    queryKey: ["franchise-imported-products", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("shared_products")
        .select("source_product_id")
        .eq("target_tenant_id", tenantId);
      if (error) throw error;
      return data.map((r) => r.source_product_id);
    },
    enabled: !!tenantId,
  });

  // Get already-imported table IDs
  const { data: importedTableIds = [] } = useQuery({
    queryKey: ["franchise-imported-tables", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("shared_table_layouts")
        .select("source_table_id")
        .eq("target_tenant_id", tenantId);
      if (error) throw error;
      return data.map((r) => r.source_table_id);
    },
    enabled: !!tenantId,
  });

  // === PARENT TENANT: Get child tenants ===
  const { data: childTenants = [], isLoading: loadingChildren } = useQuery({
    queryKey: ["franchise-child-tenants", tenantId],
    queryFn: async () => {
      if (!tenantId) return [];
      const { data, error } = await supabase
        .from("tenants")
        .select("id, name, document, is_active")
        .eq("parent_tenant_id", tenantId)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!tenantId && !isChildTenant,
  });

  const isParentTenant = !isChildTenant && childTenants.length > 0;
  const hasConnection = isChildTenant || isParentTenant;

  // Get own products (parent view - to share)
  const { data: ownProducts = [], isLoading: loadingOwnProducts } = useQuery({
    queryKey: ["franchise-own-products", tenantInfo?.owner_user_id],
    queryFn: async () => {
      if (!tenantInfo?.owner_user_id) return [];
      const { data, error } = await supabase
        .from("pdv_products")
        .select("id, name, category, price_salon, price_balcao, price_delivery, image_url, is_available")
        .eq("user_id", tenantInfo.owner_user_id)
        .order("name");
      if (error) throw error;
      return data;
    },
    enabled: isParentTenant && !!tenantInfo?.owner_user_id,
  });

  // Get own tables (parent view - to share)
  const { data: ownTables = [], isLoading: loadingOwnTables } = useQuery({
    queryKey: ["franchise-own-tables", tenantInfo?.owner_user_id],
    queryFn: async () => {
      if (!tenantInfo?.owner_user_id) return [];
      const { data, error } = await supabase
        .from("pdv_tables")
        .select("id, table_number, capacity, shape, is_active")
        .eq("user_id", tenantInfo.owner_user_id)
        .eq("is_active", true)
        .order("table_number");
      if (error) throw error;
      return data;
    },
    enabled: isParentTenant && !!tenantInfo?.owner_user_id,
  });

  // === CHILD MUTATIONS ===
  const importProducts = useMutation({
    mutationFn: async (productIds: string[]) => {
      const { data, error } = await supabase.functions.invoke("sync-shared-products", {
        body: { action: "import_products", target_tenant_id: tenantId, product_ids: productIds },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.cloned} produto(s) importado(s) com sucesso`);
      queryClient.invalidateQueries({ queryKey: ["franchise-imported-products"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao importar produtos"),
  });

  const importTables = useMutation({
    mutationFn: async (tableIds: string[]) => {
      const { data, error } = await supabase.functions.invoke("sync-shared-products", {
        body: { action: "import_tables", target_tenant_id: tenantId, table_ids: tableIds },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`${data.cloned} mesa(s) importada(s) com sucesso`);
      queryClient.invalidateQueries({ queryKey: ["franchise-imported-tables"] });
    },
    onError: (err: any) => toast.error(err.message || "Erro ao importar mesas"),
  });

  const importDeliverySettings = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sync-shared-products", {
        body: { action: "import_delivery_settings", target_tenant_id: tenantId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => toast.success("Configurações de delivery importadas com sucesso"),
    onError: (err: any) => toast.error(err.message || "Erro ao importar configurações"),
  });

  const syncExisting = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sync-shared-products", {
        body: { action: "sync_imported", target_tenant_id: tenantId },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => toast.success(`${data.synced} produto(s) sincronizado(s)`),
    onError: (err: any) => toast.error(err.message || "Erro ao sincronizar"),
  });

  // === PARENT MUTATIONS ===
  const shareProducts = useMutation({
    mutationFn: async ({ productIds, targetTenantIds }: { productIds: string[]; targetTenantIds: string[] }) => {
      const { data, error } = await supabase.functions.invoke("sync-shared-products", {
        body: {
          action: "share_products",
          source_tenant_id: tenantId,
          target_tenant_ids: targetTenantIds,
          product_ids: productIds,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => toast.success(`Produtos compartilhados com sucesso`),
    onError: (err: any) => toast.error(err.message || "Erro ao compartilhar produtos"),
  });

  const shareTables = useMutation({
    mutationFn: async ({ tableIds, targetTenantIds }: { tableIds: string[]; targetTenantIds: string[] }) => {
      const { data, error } = await supabase.functions.invoke("sync-shared-products", {
        body: {
          action: "share_tables",
          source_tenant_id: tenantId,
          target_tenant_ids: targetTenantIds,
          table_ids: tableIds,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => toast.success(`Mesas compartilhadas com sucesso`),
    onError: (err: any) => toast.error(err.message || "Erro ao compartilhar mesas"),
  });

  const syncAllChildren = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("sync-shared-products", {
        body: { action: "sync_products", source_tenant_id: tenantId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => toast.success(`Produtos sincronizados com as franquias`),
    onError: (err: any) => toast.error(err.message || "Erro ao sincronizar"),
  });

  return {
    // Connection state
    hasConnection,
    isChildTenant,
    isParentTenant,
    isLoading: loadingTenant || loadingChildren,
    // Child tenant data
    parentTenant,
    parentProducts,
    parentTables,
    importedProductIds,
    importedTableIds,
    loadingProducts,
    loadingTables,
    // Child mutations
    importProducts,
    importTables,
    importDeliverySettings,
    syncExisting,
    // Parent tenant data
    childTenants,
    ownProducts,
    ownTables,
    loadingOwnProducts,
    loadingOwnTables,
    // Parent mutations
    shareProducts,
    shareTables,
    syncAllChildren,
    // Legacy compat
    hasParentTenant: isChildTenant,
  };
}
