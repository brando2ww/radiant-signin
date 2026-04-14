import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, CheckCircle2, CreditCard } from "lucide-react";
import { usePDVEmployeeConsumption } from "@/hooks/use-pdv-employee-consumption";
import { CurrencyInput } from "@/components/ui/currency-input";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EmployeeConsumptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeConsumptionDialog({
  open,
  onOpenChange,
}: EmployeeConsumptionDialogProps) {
  const {
    openConsumptions,
    closedConsumptions,
    createConsumption,
    isCreating,
    closeConsumption,
    isClosing,
    updateConsumption,
  } = usePDVEmployeeConsumption();

  const [newName, setNewName] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTotal, setEditingTotal] = useState<string | null>(null);
  const [editTotal, setEditTotal] = useState<number>(0);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createConsumption({ employee_name: newName.trim(), notes: newNotes.trim() || undefined });
    setNewName("");
    setNewNotes("");
    setShowForm(false);
  };

  const handleSaveTotal = (id: string) => {
    updateConsumption({ id, updates: { total: editTotal } });
    setEditingTotal(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Consumo de Funcionários
          </DialogTitle>
          <DialogDescription>
            Registre e controle o consumo interno dos funcionários.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="open">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="open">
              Abertos ({openConsumptions.length})
            </TabsTrigger>
            <TabsTrigger value="closed">
              Encerrados ({closedConsumptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open" className="mt-4 space-y-3">
            {!showForm ? (
              <Button
                onClick={() => setShowForm(true)}
                variant="outline"
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Novo Consumo
              </Button>
            ) : (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <Input
                    placeholder="Nome do funcionário"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  />
                  <Textarea
                    placeholder="Observações (opcional)"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleCreate} disabled={!newName.trim() || isCreating} size="sm">
                      Criar
                    </Button>
                    <Button onClick={() => setShowForm(false)} variant="ghost" size="sm">
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {openConsumptions.map((c) => (
                  <Card key={c.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="font-semibold">{c.employee_name}</span>
                          {c.notes && (
                            <p className="text-xs text-muted-foreground">{c.notes}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(c.created_at), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          {editingTotal === c.id ? (
                            <div className="flex items-center gap-1">
                              <CurrencyInput
                                value={editTotal}
                                onChange={(v) => setEditTotal(Number(v) || 0)}
                                className="w-24 h-8 text-sm"
                              />
                              <Button size="sm" className="h-8" onClick={() => handleSaveTotal(c.id)}>
                                OK
                              </Button>
                            </div>
                          ) : (
                            <span
                              className="font-bold text-primary cursor-pointer hover:underline"
                              onClick={() => { setEditingTotal(c.id); setEditTotal(c.total); }}
                            >
                              {formatCurrency(c.total)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-xs"
                          onClick={() => closeConsumption({ id: c.id, status: "pago" })}
                          disabled={isClosing}
                        >
                          <CreditCard className="h-3 w-3" />
                          Pago
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1 text-xs"
                          onClick={() => closeConsumption({ id: c.id, status: "descontado" })}
                          disabled={isClosing}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Descontado
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {openConsumptions.length === 0 && !showForm && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhum consumo aberto
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="closed" className="mt-4">
            <ScrollArea className="h-[350px]">
              <div className="space-y-2">
                {closedConsumptions.map((c) => (
                  <Card key={c.id} className="opacity-75">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">{c.employee_name}</span>
                          <p className="text-xs text-muted-foreground">
                            {c.closed_at
                              ? formatDistanceToNow(new Date(c.closed_at), { addSuffix: true, locale: ptBR })
                              : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold">{formatCurrency(c.total)}</span>
                          <Badge variant={c.status === "pago" ? "default" : "secondary"}>
                            {c.status === "pago" ? "Pago" : "Descontado"}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {closedConsumptions.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    Nenhum consumo encerrado
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
