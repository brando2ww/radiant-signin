import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink, Link2Off, Plus, RefreshCw, Send, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tenant, useTenants } from "@/hooks/use-tenants";
import { toast } from "sonner";

interface FranchiseSectionProps {
  tenantId: string;
  allTenants: Tenant[];
}

export function FranchiseSection({ tenantId, allTenants }: FranchiseSectionProps) {
  const navigate = useNavigate();
  const {
    fetchChildTenants,
    linkChildTenant,
    unlinkChildTenant,
    fetchTenantProducts,
    fetchTenantTables,
    shareProducts,
    syncProducts,
    shareTables,
  } = useTenants();

  const [children, setChildren] = useState<Tenant[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Link dialog
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedChildId, setSelectedChildId] = useState("");

  // Share selections
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedTableIds, setSelectedTableIds] = useState<string[]>([]);
  const [targetChildIds, setTargetChildIds] = useState<string[]>([]);
  const [allChildren, setAllChildren] = useState(false);

  const [sharing, setSharing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [sharingTables, setSharingTables] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ch, prods, tbls] = await Promise.all([
        fetchChildTenants(tenantId),
        fetchTenantProducts(tenantId),
        fetchTenantTables(tenantId),
      ]);
      setChildren(ch);
      setProducts(prods);
      setTables(tbls);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [tenantId]);

  // Available tenants to link (not already children, not self, not already parent of something else in this chain)
  const availableToLink = allTenants.filter(
    (t) =>
      t.id !== tenantId &&
      !t.parent_tenant_id &&
      !children.some((c) => c.id === t.id)
  );

  const handleLink = async () => {
    if (!selectedChildId) return;
    try {
      await linkChildTenant(tenantId, selectedChildId);
      toast.success("Franquia vinculada!");
      setShowLinkDialog(false);
      setSelectedChildId("");
      loadData();
    } catch {
      toast.error("Erro ao vincular franquia");
    }
  };

  const handleUnlink = async (childId: string) => {
    try {
      await unlinkChildTenant(childId);
      toast.success("Franquia desvinculada!");
      loadData();
    } catch {
      toast.error("Erro ao desvincular");
    }
  };

  const getTargets = () => (allChildren ? children.map((c) => c.id) : targetChildIds);

  const handleShareProducts = async () => {
    const targets = getTargets();
    if (!selectedProductIds.length || !targets.length) {
      toast.error("Selecione produtos e franquias destino");
      return;
    }
    setSharing(true);
    try {
      const result = await shareProducts(tenantId, targets, selectedProductIds);
      toast.success(`${result.cloned} produto(s) compartilhado(s)!`);
      setSelectedProductIds([]);
    } catch (e: any) {
      toast.error(e.message || "Erro ao compartilhar");
    } finally {
      setSharing(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await syncProducts(tenantId);
      toast.success(`${result.synced} produto(s) sincronizado(s)!`);
    } catch (e: any) {
      toast.error(e.message || "Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const handleShareTables = async () => {
    const targets = getTargets();
    if (!selectedTableIds.length || !targets.length) {
      toast.error("Selecione mesas e franquias destino");
      return;
    }
    setSharingTables(true);
    try {
      const result = await shareTables(tenantId, targets, selectedTableIds);
      toast.success(`${result.cloned} mesa(s) copiada(s)!`);
      setSelectedTableIds([]);
    } catch (e: any) {
      toast.error(e.message || "Erro ao copiar mesas");
    } finally {
      setSharingTables(false);
    }
  };

  const toggleProduct = (id: string) =>
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const toggleTable = (id: string) =>
    setSelectedTableIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );

  const toggleTarget = (id: string) => {
    setAllChildren(false);
    setTargetChildIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Franquias List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Franquias ({children.length})</CardTitle>
          <Button size="sm" onClick={() => setShowLinkDialog(true)}>
            <Plus className="h-4 w-4 mr-1" /> Vincular
          </Button>
        </CardHeader>
        <CardContent>
          {children.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma franquia vinculada. Vincule tenants existentes como franquias desta matriz.
            </p>
          ) : (
            <div className="space-y-2">
              {children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >
                  <div>
                    <p className="font-medium">{child.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {child.document || "Sem documento"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={child.is_active ? "default" : "secondary"} className="text-xs">
                      {child.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => navigate(`/admin/tenants/${child.id}`)}
                      title="Abrir"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnlink(child.id)}
                      title="Desvincular"
                    >
                      <Link2Off className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share targets (used by both products and tables) */}
      {children.length > 0 && (
        <>
          {/* Target selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Destino das Franquias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={allChildren}
                    onCheckedChange={(checked) => {
                      setAllChildren(!!checked);
                      if (checked) setTargetChildIds([]);
                    }}
                  />
                  <span className="text-sm font-medium">Todas</span>
                </label>
                {children.map((child) => (
                  <label key={child.id} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={allChildren || targetChildIds.includes(child.id)}
                      disabled={allChildren}
                      onCheckedChange={() => toggleTarget(child.id)}
                    />
                    <span className="text-sm">{child.name}</span>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Share Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Compartilhar Produtos</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing}>
                  <RefreshCw className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`} />
                  Sincronizar
                </Button>
                <Button
                  size="sm"
                  onClick={handleShareProducts}
                  disabled={sharing || !selectedProductIds.length}
                >
                  <Send className="h-4 w-4 mr-1" />
                  {sharing ? "Enviando..." : "Enviar"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {products.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum produto cadastrado na matriz.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedProductIds.includes(p.id)}
                        onCheckedChange={() => toggleProduct(p.id)}
                      />
                      <span className="text-sm truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share Tables */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Compartilhar Mesas</CardTitle>
              <Button
                size="sm"
                onClick={handleShareTables}
                disabled={sharingTables || !selectedTableIds.length}
              >
                <Copy className="h-4 w-4 mr-1" />
                {sharingTables ? "Copiando..." : "Copiar"}
              </Button>
            </CardHeader>
            <CardContent>
              {tables.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma mesa cadastrada na matriz.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-60 overflow-y-auto">
                  {tables.map((t) => (
                    <label key={t.id} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selectedTableIds.includes(t.id)}
                        onCheckedChange={() => toggleTable(t.id)}
                      />
                      <span className="text-sm">{formatTableLabel(t.table_number)}</span>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Link Dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Franquia</DialogTitle>
            <DialogDescription>
              Selecione um tenant existente para vincular como franquia
            </DialogDescription>
          </DialogHeader>
          <div>
            <Select value={selectedChildId} onValueChange={setSelectedChildId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tenant" />
              </SelectTrigger>
              <SelectContent>
                {availableToLink.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name} {t.document ? `· ${t.document}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableToLink.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                Nenhum tenant disponível para vincular.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleLink} disabled={!selectedChildId}>
              Vincular
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
