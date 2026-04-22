

## Emissão de NFC-e (cupom fiscal eletrônico) pós-cobrança via Nuvem Fiscal

### Status atual no projeto

✅ Já existe:
- Secrets `NUVEM_FISCAL_CLIENT_ID` e `NUVEM_FISCAL_CLIENT_SECRET` configurados
- Edge function `fetch-nfe-automatica` com OAuth funcionando contra Nuvem Fiscal (serve de referência)
- UI de configuração fiscal completa em `NFAutomaticaIntegrationCard.tsx`: upload de certificado A1 (.pfx/.p12), CNPJ, IE, regime tributário, série NFC-e, CFOP, CST/CSOSN, alíquotas ICMS/PIS/COFINS, ambiente (homologação/produção), endereço fiscal, e-mail do cliente
- Tabela `business_settings` com TODOS os campos fiscais: `nfe_certificate_url`, `nfe_certificate_password`, `nfe_serie_nfce`, `nfe_enable_nfce`, `nfe_endereco_fiscal`, `nfe_cst_csosn`, alíquotas, `nfe_ambiente`, `tax_regime`, etc.
- Storage bucket `certificates` (privado) com o A1
- Produtos com NCM, CFOP, CEST, Origem (`mem://features/product-fiscal-data`)

❌ Falta:
- Edge function que **emita** a NFC-e na Nuvem Fiscal
- Tabela para guardar as NFC-e emitidas (chave de acesso, protocolo, status, XML, DANFE PDF)
- Botão "Emitir Cupom Fiscal" no `PaymentDialog` pós-cobrança
- Validação de pré-requisitos antes de emitir (certificado configurado, CNPJ, NCM nos produtos)

### O que vou implementar

#### 1. Migração de banco — tabela `pdv_nfce_emissions`

```text
pdv_nfce_emissions
├─ id (uuid, PK)
├─ user_id (uuid, dono do PDV)
├─ order_id, comanda_id, table_id (FK opcionais)
├─ cashier_session_id (FK pdv_cashier_sessions)
├─ status: 'pendente' | 'autorizada' | 'rejeitada' | 'cancelada' | 'erro'
├─ ambiente: 'homologacao' | 'producao'
├─ serie, numero (sequência NFC-e)
├─ chave_acesso (44 dígitos, único)
├─ protocolo_autorizacao
├─ data_emissao, data_autorizacao
├─ valor_total, valor_desconto, valor_servico
├─ forma_pagamento, parcelas
├─ customer_cpf, customer_email (opcionais)
├─ nuvem_fiscal_id (id retornado pela API)
├─ xml_url, danfe_pdf_url, danfe_html_url (storage/links)
├─ rejection_reason, error_payload (jsonb)
├─ items_snapshot (jsonb com itens no momento da emissão)
└─ timestamps
```

- RLS: dono vê seus registros; staff vê via `is_establishment_member(user_id)`.
- Índices em `user_id`, `chave_acesso`, `status`, `cashier_session_id`.

#### 2. Edge function `emit-nfce`

Espelha o padrão de `fetch-nfe-automatica`:
- Valida JWT do operador
- Busca `business_settings` do dono e o certificado no bucket `certificates`
- Busca itens da comanda/mesa com NCM/CFOP/origem dos produtos
- Valida pré-requisitos (sem certificado → 400 amigável; sem NCM em algum produto → lista os produtos faltantes)
- Pega OAuth token Nuvem Fiscal (mesma função)
- Monta payload NFC-e conforme schema da Nuvem Fiscal (emitente, destinatário opcional com CPF, itens com tributação, pagamento, totais)
- POST para `/nfce` da Nuvem Fiscal em modo síncrono
- Salva resultado em `pdv_nfce_emissions` (autorizada → guarda chave/protocolo; rejeitada → guarda motivo)
- Retorna `{ status, chave_acesso, danfe_url, motivo_rejeicao? }`

#### 3. Hook `use-nfce-emission.ts`

`emitNFCe(params)` → chama a edge function via `supabase.functions.invoke`, retorna resultado, invalida queries, mostra toast.

#### 4. UI no `PaymentDialog` — tela de sucesso

Substituir o auto-close de 2s por uma tela de ação manual com 3 botões:

```text
┌─ Pagamento Confirmado! R$ 39,60 ───┐
│  Troco: R$ 10,40                   │
│                                    │
│  [📄 Emitir NFC-e (Cupom Fiscal)]  │ ← primário
│  [🧾 Imprimir Recibo Não-Fiscal]   │ ← outline
│  [Concluir]                        │ ← ghost
└────────────────────────────────────┘
```

Comportamento:
- **Emitir NFC-e**: chama `emitNFCe`. Estados: loading → sucesso (mostra chave + botão "Imprimir DANFE") ou erro (mostra motivo de rejeição da SEFAZ + permite retry).
- **Imprimir Recibo Não-Fiscal**: imprime cupom 80mm interno (via iframe + `window.print()`, padrão `printCashierReport`). Útil quando NFC-e não está habilitada/configurada ou para entregar junto.
- **Concluir**: fecha o dialog.

Se `nfe_enable_nfce = false` ou certificado ausente: o botão "Emitir NFC-e" aparece desabilitado com tooltip "Configure NFC-e em Integrações > NF Automática" + link.

#### 5. DANFE térmico (impressão)

A Nuvem Fiscal retorna o DANFE NFC-e em PDF/HTML pré-formatado para 80mm. O botão "Imprimir DANFE" abre esse HTML em iframe oculto e dispara `window.print()` — mesmo padrão já usado no fechamento de caixa.

### Pré-requisitos que o usuário precisa garantir

Antes da NFC-e funcionar de verdade (vou listar isso na UI):

1. **Habilitação NFC-e na SEFAZ do estado** (processo presencial/online no portal estadual — fora do escopo de software)
2. **Certificado A1 (.pfx)** já carregado em Integrações > NF Automática ✅ UI pronta
3. **CSC (Código de Segurança do Contribuinte)** + ID do CSC — gerado no portal SEFAZ. **Precisamos adicionar esses 2 campos** em `business_settings` (`nfe_csc_id`, `nfe_csc_token`). Sem isso a NFC-e é rejeitada.
4. **NCM em todos os produtos** vendidos (já temos o campo, basta preencher)
5. **Ambiente de homologação primeiro**, depois trocar para produção

### Limitações honestas

- A NFC-e exige **CSC + habilitação na SEFAZ estadual**, sem isso nenhuma API emite. Vou colocar checklist visual no card de integração.
- Em homologação as notas não têm valor jurídico (servem só para teste).
- Custos da Nuvem Fiscal por NFC-e emitida ficam por conta da conta do cliente.
- Cancelamento (até 30 min após autorização) e contingência ficam para uma segunda iteração — entrego primeiro emissão + impressão + retry de erro.

### Fora de escopo

- Cancelamento de NFC-e, carta de correção, contingência offline
- NF-e modelo 55 (B2B) — focamos só em NFC-e modelo 65 que é o do varejo/bar
- Geração de relatório fiscal mensal
- Botão "Reimprimir DANFE" no histórico de pedidos (próxima iteração)

### Arquivos modificados/criados

- **Migração**: nova tabela `pdv_nfce_emissions` + 2 colunas em `business_settings` (`nfe_csc_id`, `nfe_csc_token`)
- **Novo**: `supabase/functions/emit-nfce/index.ts`
- **Novo**: `src/hooks/use-nfce-emission.ts`
- **Novo**: `src/lib/print-fiscal-receipt.ts` (impressão DANFE + recibo não-fiscal)
- **Editado**: `src/components/pdv/cashier/PaymentDialog.tsx` (tela de sucesso com 3 botões)
- **Editado**: `src/components/pdv/integrations/NFAutomaticaIntegrationCard.tsx` (campos CSC + checklist visual)
- **Editado**: `src/hooks/use-pdv-settings.ts` (tipos CSC)

