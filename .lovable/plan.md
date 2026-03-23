

## Importação Automática de NF-e via SEFAZ (DistDFe)

### Conceito
Adicionar na aba Integrações (Settings) um card "Importar NF-e Automaticamente" com toggle ativar/desativar e campo para CNPJ. Quando ativado, uma edge function consulta periodicamente a SEFAZ via API de terceiros (usando DistDFe) e importa as NF-e emitidas contra o CNPJ do tenant para a tabela `pdv_invoices`.

A API key é global (1 para todo o sistema, configurada como secret no Supabase). Cada tenant configura apenas seu CNPJ e se quer ativar.

### Mudanças

| Arquivo | Ação |
|---------|------|
| Migration SQL | Adicionar colunas `nfe_auto_import_enabled` e `nfe_auto_import_cnpj` em `pdv_settings` |
| `src/hooks/use-pdv-settings.ts` | Adicionar campos na interface `PDVSettings` |
| `src/components/pdv/settings/IntegrationsTab.tsx` | Adicionar card "Importar NF-e Automaticamente" com Switch e campo CNPJ |
| `supabase/functions/fetch-nfe-automatica/index.ts` | Edge function que consulta API DistDFe e insere NF-e novas em `pdv_invoices` |

### DB — Colunas novas em `pdv_settings`

| Coluna | Tipo | Default |
|--------|------|---------|
| `nfe_auto_import_enabled` | BOOLEAN | false |
| `nfe_auto_import_cnpj` | TEXT | NULL |

### UI — Card na aba Integrações

```text
┌──────────────────────────────────────────────────┐
│ [FileDown] Importar NF-e Automaticamente   [OFF] │
│ Busque automaticamente notas fiscais emitidas    │
│ contra o CNPJ do seu estabelecimento via SEFAZ   │
│                                                  │
│ CNPJ para consulta: [_________________]          │
│                     (pré-preenche com business_cnpj)│
│                                                  │
│ • Consulta automática de NF-e na SEFAZ           │
│ • Importa XML completo com itens e impostos      │
│ • NF-e novas aparecem na tela de Notas Fiscais   │
│                  [Salvar]                        │
└──────────────────────────────────────────────────┘
```

O card aparece após o card do iFood, antes do WhatsApp.

### Edge Function — `fetch-nfe-automatica`

- Recebe `{ user_id }` ou é chamada via cron para todos os tenants com `nfe_auto_import_enabled = true`
- Busca `business_cnpj` ou `nfe_auto_import_cnpj` do tenant
- Chama API DistDFe (placeholder URL, a ser configurada quando a API key for adicionada)
- Para cada NF-e nova (chave não existente em `pdv_invoices`), insere na tabela com status `pending`
- A API key será o secret `NFE_API_KEY` (global, ainda não adicionada)
- A function ficará funcional em estrutura mas sem a API key não fará chamadas reais — retorna mensagem informando que a key não está configurada

### Fluxo futuro (quando API key existir)
1. Cron a cada 6h chama edge function
2. Edge function busca todos os tenants com auto-import ativado
3. Para cada um, consulta DistDFe pelo CNPJ
4. Insere NF-e novas em `pdv_invoices` + `pdv_invoice_items`

