

## Plano: Selecionar Fornecedores por Item na Criação da Cotação

### Problema Atual

Atualmente, ao criar uma cotação:
1. O usuário adiciona itens (ingredientes + quantidade)
2. A cotação é criada no banco de dados
3. **Depois**, no card da cotação, o usuário clica em "Enviar WhatsApp" e aí escolhe os fornecedores

O usuário deseja poder **selecionar os fornecedores de cada item já no momento da criação**, para ter controle de quais fornecedores receberão a mensagem.

---

### Solução

Adicionar seleção de fornecedores no dialog de criação de cotação (`QuotationRequestDialog`), mostrando os fornecedores vinculados a cada ingrediente e permitindo selecionar quais receberão a cotação.

---

### Alterações Necessárias

#### 1. Criar Tabela para Armazenar Fornecedores Selecionados por Item

```sql
CREATE TABLE pdv_quotation_item_suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_item_id UUID NOT NULL REFERENCES pdv_quotation_items(id) ON DELETE CASCADE,
  supplier_id UUID NOT NULL REFERENCES pdv_suppliers(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ,  -- quando foi enviada a mensagem
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(quotation_item_id, supplier_id)
);
```

Habilitar RLS com política para o usuário acessar apenas seus dados.

---

#### 2. Modificar Interface `QuotationItem` 

Adicionar campo para armazenar fornecedores selecionados:

```typescript
interface QuotationItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity_needed: number;
  unit: string;
  notes?: string;
  selected_suppliers: string[];  // IDs dos fornecedores selecionados
}
```

---

#### 3. Alterar `QuotationRequestDialog.tsx`

- Importar `usePDVIngredientSuppliers` para buscar fornecedores de cada ingrediente
- Para cada item, exibir lista de fornecedores vinculados com checkboxes
- Armazenar seleção em estado local
- Enviar seleção na criação da cotação

**Layout proposto para cada item:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Ingrediente: [SALMÃO 2K ▼]   Qtd: [15]   Un: kg    [🗑]        │
│                                                                 │
│ Fornecedores:                                                   │
│ ☑ Pescados do Mar (11 99999-1111)                              │
│ ☑ Distribuidora Peixes SA (11 88888-2222)                      │
│ ☐ Frigorífico Central (sem WhatsApp)                           │
└─────────────────────────────────────────────────────────────────┘
```

---

#### 4. Modificar Hook `usePDVQuotations.ts`

- Atualizar tipo `CreateQuotationData` para incluir fornecedores por item
- Na mutação `createQuotation`, após criar os itens, inserir os fornecedores selecionados na nova tabela

---

#### 5. Modificar `WhatsAppSendDialog.tsx`

- Usar os fornecedores selecionados salvos no banco ao invés de buscar todos os fornecedores vinculados
- Mostrar apenas os fornecedores que foram selecionados na criação

---

### Fluxo Final

1. **Criar Cotação**: Usuário adiciona itens e, para cada item, seleciona os fornecedores que devem receber
2. **Salvar**: Sistema salva cotação + itens + fornecedores selecionados
3. **Enviar**: No dialog de WhatsApp, mostra apenas os fornecedores previamente selecionados
4. **Marcar Enviado**: Ao enviar, registra timestamp em `sent_at`

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| Banco de dados | Criar tabela `pdv_quotation_item_suppliers` |
| `src/hooks/use-pdv-quotations.ts` | Atualizar tipos e mutação de criação |
| `src/components/pdv/purchases/QuotationRequestDialog.tsx` | Adicionar UI de seleção de fornecedores por item |
| `src/components/pdv/purchases/WhatsAppSendDialog.tsx` | Usar fornecedores selecionados do banco |

---

### Comportamento de Seleção

- **Ao selecionar ingrediente**: Carrega automaticamente os fornecedores vinculados a ele
- **Fornecedores preferidos**: Pré-selecionados automaticamente
- **Sem fornecedor**: Mostra aviso "Nenhum fornecedor vinculado a este ingrediente"
- **Sem WhatsApp**: Checkbox desabilitado com indicador visual

