

## Conectar Importação Automática de NF-e à Página de Notas Fiscais

### Problema
1. A edge function `fetch-nfe-automatica` insere colunas com nomes errados (`access_key`, `invoice_series`, `issue_date`, `total_value`, `xml_content`, `source`) que **não existem** na tabela `pdv_invoices` (colunas reais: `invoice_key`, `series`, `emission_date`, `total_invoice`, `xml_url`, `operation_type`, `invoice_type`).
2. A página de Notas Fiscais não tem botão para disparar a busca automática manualmente.
3. Falta colunas `source` na tabela para diferenciar NFs importadas manualmente vs automaticamente.
4. O `handleView` na página de Notas Fiscais apenas loga no console — não abre o wizard de revisão para cadastrar insumos.

### Mudanças

| Arquivo | Acao |
|---------|------|
| Migration SQL | Adicionar coluna `source` (TEXT, default 'manual') em `pdv_invoices` |
| `supabase/functions/fetch-nfe-automatica/index.ts` | Corrigir nomes das colunas no INSERT para corresponder ao schema real |
| `src/pages/pdv/Invoices.tsx` | Adicionar botao "Buscar NF-e" que chama a edge function; implementar `handleView` para abrir wizard de revisao com dados da NF existente |
| `src/hooks/use-pdv-invoices.ts` | Adicionar hook `useFetchNFeAutomatica` para chamar a edge function |
| `src/components/pdv/invoices/InvoiceCard.tsx` | Mostrar badge "Automática" para NFs com source `sefaz_auto`; adicionar botao "Cadastrar Insumos" para NFs pendentes |

### Detalhes

**1. Fix Edge Function — colunas corretas**

```text
Errado → Correto
access_key → invoice_key
invoice_series → series
issue_date → emission_date
total_value → total_invoice
xml_content → xml_url (ou notes)
source → source (nova coluna)
+ operation_type: 'entrada'
+ invoice_type: 'compra'
+ total_products: 0
+ total_tax: 0
+ supplier_cnpj precisa ser NOT NULL
```

**2. Botão "Buscar NF-e" na página**

Ao lado do "Importar NF-e", um segundo botão "Buscar NF-e SEFAZ" que:
- Chama `supabase.functions.invoke('fetch-nfe-automatica', { body: { user_id } })`
- Mostra toast com resultado (X notas importadas / API key não configurada)
- Recarrega a lista

**3. handleView → Abrir InvoiceReviewDialog**

Quando o admin clica "Visualizar" em uma NF pendente (importada automaticamente), abre o `InvoiceReviewWizard` populado com os dados da NF existente, permitindo revisar e cadastrar insumos a partir dos itens.

Para NFs auto-importadas que só têm dados básicos (sem itens parseados), o wizard mostrará os dados disponíveis e permitirá complementar manualmente.

### Fluxo completo
1. Admin ativa importação automática nas Configurações → Integrações
2. Na página Notas Fiscais, clica "Buscar NF-e SEFAZ" (ou aguarda cron)
3. NFs aparecem na lista com status "Pendente" e badge "Automática"
4. Admin clica "Visualizar" → abre wizard de revisão
5. No Step 4 (Produtos), vincula ou cria insumos a partir dos itens da NF
6. Confirma → insumos cadastrados no estoque

