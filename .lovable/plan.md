

## Plano: Alterar Seleção de Fornecedores para Menu Suspenso (Dropdown)

### Problema Atual

A seleção de fornecedores usa checkboxes em lista, ocupando muito espaço vertical e sendo menos intuitivo para o usuário que espera um dropdown padrão.

### Solução

Substituir a lista de checkboxes por um componente de Select multi-seleção usando o Popover com checkboxes dentro (padrão comum para multi-select).

---

### Alterações Técnicas

**Arquivo:** `src/components/pdv/purchases/QuotationItemSuppliers.tsx`

#### Estrutura do Novo Componente:

```
┌──────────────────────────────────────────────────────────────┐
│ Fornecedores: [Selecione os fornecedores...            ▼]   │
│               ou                                             │
│               [2 fornecedores selecionados             ▼]   │
└──────────────────────────────────────────────────────────────┘

Ao abrir o dropdown:
┌──────────────────────────────────────────────────────────────┐
│ ☑ CARLOS EDUARDO... (54) 99223-2827        [Principal]      │
│ ☐ Outro Fornecedor  (11) 99999-9999        [Preferido]      │
│ ☐ Sem WhatsApp                             [Sem WhatsApp]   │
└──────────────────────────────────────────────────────────────┘
```

#### Implementação:

1. **Substituir imports**:
   - Remover `Checkbox` como componente principal
   - Adicionar `Popover`, `PopoverTrigger`, `PopoverContent`
   - Adicionar `Command`, `CommandGroup`, `CommandItem` (para lista pesquisável)
   - Manter `Checkbox` para uso dentro do dropdown

2. **Criar trigger do dropdown**:
   - Botão que mostra "Selecione os fornecedores..." ou "X fornecedores selecionados"
   - Estilo consistente com outros selects do sistema

3. **Conteúdo do dropdown**:
   - Lista de fornecedores com checkbox ao lado de cada um
   - Badges para "Principal", "Preferido", "Sem WhatsApp"
   - Fornecedores sem WhatsApp ficam desabilitados

4. **Manter lógica existente**:
   - Auto-seleção de fornecedores preferidos/principais
   - Toggle de seleção
   - Validação de WhatsApp

---

### Código da Nova UI

```typescript
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";

// No render:
<Popover>
  <PopoverTrigger asChild>
    <Button
      variant="outline"
      role="combobox"
      className="w-full justify-between text-xs h-8"
    >
      {selectedSuppliers.length === 0
        ? "Selecione os fornecedores..."
        : `${selectedSuppliers.length} fornecedor${selectedSuppliers.length > 1 ? "es" : ""} selecionado${selectedSuppliers.length > 1 ? "s" : ""}`}
      <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
    </Button>
  </PopoverTrigger>
  <PopoverContent className="w-full p-0" align="start">
    <div className="max-h-60 overflow-auto p-1">
      {suppliers.map((link) => (
        <div
          key={link.id}
          className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-muted cursor-pointer"
          onClick={() => hasPhone && handleToggle(link.supplier_id)}
        >
          <Checkbox checked={isSelected} disabled={!hasPhone} />
          <span className="flex-1 text-sm">{supplier.name}</span>
          {/* Badges */}
        </div>
      ))}
    </div>
  </PopoverContent>
</Popover>
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/pdv/purchases/QuotationItemSuppliers.tsx` | Substituir lista de checkboxes por Popover dropdown com multi-select |

---

### Comportamento

- **Fechado**: Mostra quantidade de fornecedores selecionados
- **Aberto**: Lista com checkboxes para selecionar múltiplos
- **Auto-seleção**: Mantém comportamento de pré-selecionar fornecedores principais
- **Sem WhatsApp**: Item aparece mas fica desabilitado com indicador visual
- **Badges**: Principal, Preferido, Sem WhatsApp visíveis dentro do dropdown

