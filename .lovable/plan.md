
# Gerenciamento de Cupons Fiscais (NFC-e)

Atualmente o sistema já emite NFC-e (edge function `emit-nfce`) e armazena cada emissão na tabela `pdv_nfce_emissions`, mas **não existe nenhuma tela** para o usuário visualizar, filtrar, baixar ou reprocessar esses cupons. A página `/pdv/notas-fiscais` cuida apenas das NF-e de **entrada** (compras de fornecedores).

Este plano cria um módulo dedicado para os cupons **emitidos** (saída), com listagem, filtros, detalhamento, ações (DANFE, XML, cancelamento, reenvio, consulta de status) e indicadores.

---

## 1. Nova rota e navegação

- **Rota:** `/pdv/cupons-fiscais` (separada de `/pdv/notas-fiscais` que continua sendo NF-e de entrada).
- Adicionar item no `PDVHeaderNav.tsx`: **"Cupons Fiscais"** (ícone `ReceiptText`), abaixo de "Notas Fiscais".
- Liberar acesso em `use-user-role.ts` para os mesmos perfis que hoje acessam Notas Fiscais (owner, admin, gerente, financeiro).
- Registrar a rota em `src/pages/PDV.tsx` apontando para um novo `pages/pdv/FiscalCoupons.tsx`.

## 2. Banco de dados (migração)

A tabela `pdv_nfce_emissions` já existe com os campos necessários (`status`, `chave_acesso`, `numero`, `serie`, `protocolo_autorizacao`, `valor_total`, `customer_*`, `forma_pagamento`, `danfe_pdf_url`, `xml_url`, `nuvem_fiscal_id`, `error_payload`, `data_emissao`, `data_autorizacao`, etc).

Adições mínimas (migração):

- Coluna `cancellation_reason text` (motivo do cancelamento informado pelo usuário).
- Coluna `cancelled_at timestamptz` e `cancellation_protocol text`.
- Coluna `last_status_check_at timestamptz` (para botão "Consultar status").
- Índices: `(user_id, data_emissao desc)` e `(user_id, status)` para acelerar a listagem.
- Conferir/garantir RLS: SELECT/UPDATE para o owner (`user_id = auth.uid()`) e membros (`is_establishment_member(user_id)`).

## 3. Edge functions complementares

Hoje só existe `emit-nfce`. Criar três novas funções (todas com `verify_jwt = false` validando JWT no código, padrão do projeto, usando `NUVEM_FISCAL_CLIENT_ID/SECRET` já configurados):

1. **`cancel-nfce`** — recebe `{ emission_id, justificativa }` (mín. 15 caracteres, exigência da SEFAZ). Chama `POST /nfce/{id}/cancelamento` na Nuvem Fiscal, atualiza linha para `status='cancelada'`, grava `cancellation_reason`, `cancellation_protocol`, `cancelled_at`.
2. **`check-nfce-status`** — recebe `{ emission_id }`. Chama `GET /nfce/{id}` na Nuvem Fiscal, atualiza `status`, `chave_acesso`, `protocolo_autorizacao`, `data_autorizacao`, `rejection_reason`. Útil para cupons "pendentes" que ficaram em processamento assíncrono.
3. **`resend-nfce`** — para cupons `rejeitada`: reusa o `items_snapshot` e demais dados da linha original, cria nova linha de emissão (mantendo referência via coluna `parent_emission_id uuid` adicionada na migração) e chama o mesmo fluxo do `emit-nfce`.

Todas retornam JSON com CORS padrão.

## 4. Hooks

Em `src/hooks/`:

- `use-fiscal-coupons.ts` — listagem com filtros (período, status, número, chave, CPF, forma de pagamento, valor mín/máx) usando React Query + Supabase. Paginação por cursor (`data_emissao`).
- `use-fiscal-coupon-detail.ts` — busca uma emissão por id (com `items_snapshot`).
- `use-cancel-nfce.ts`, `use-check-nfce-status.ts`, `use-resend-nfce.ts` — wrappers de `supabase.functions.invoke` espelhando o padrão de `use-nfce-emission.ts`.
- `use-fiscal-coupons-summary.ts` — agrega no período: totais por status, valor bruto autorizado, quantidade de cupons cancelados/rejeitados.

## 5. Componentes de UI

Pasta nova: `src/components/pdv/fiscal-coupons/`.

- **`FiscalCouponsHeader.tsx`** — cards de KPI no topo: Autorizadas (qtd e valor), Pendentes, Rejeitadas, Canceladas, Valor total emitido no período (usar `formatBRL`).
- **`FiscalCouponsFilters.tsx`** — DateRangePicker (com `ptBR`), Select de status (`autorizada | pendente | rejeitada | cancelada`), Select de ambiente (`producao | homologacao`), Select de forma de pagamento, busca textual (número/chave/CPF/cliente).
- **`FiscalCouponsTable.tsx`** — tabela: Nº/Série, Data, Cliente (CPF/nome), Forma pgto, Valor, Status (badge colorido por status usando classes do tema, sem cor custom), Ambiente, Ações (menu ⋮).
- **`FiscalCouponMenu.tsx`** — dropdown com: "Ver detalhes", "Baixar DANFE (PDF)", "Baixar XML", "Consultar status", "Reenviar" (apenas se rejeitada), "Cancelar" (apenas se autorizada e dentro de 30 minutos), "Copiar chave de acesso".
- **`FiscalCouponDetailDialog.tsx`** — Dialog (não-modal, padrão do projeto) com abas:
  - **Resumo:** dados gerais, status, protocolo, datas, totais, link do DANFE/XML, motivo de rejeição se houver.
  - **Itens:** tabela renderizando `items_snapshot` (produto, qtd, unitário, NCM, CFOP, subtotal).
  - **Pagamento:** forma, parcelas, valor pago, troco, serviço, desconto.
  - **Cliente:** CPF, nome, email.
  - **Vínculos:** comanda/mesa/pedido relacionado (com link para a comanda).
- **`CancelNFCeDialog.tsx`** — Dialog para cancelamento: textarea obrigatório (mín. 15, máx. 255 chars), aviso sobre prazo de 30 min, confirmação. Chama `use-cancel-nfce`.

## 6. Página principal

`src/pages/pdv/FiscalCoupons.tsx`:
- Layout `min-h-[calc(100vh-3.5rem)] flex-1` (padrão de tela cheia do projeto).
- Header com título "Cupons Fiscais" + botão "Atualizar" e botão "Exportar CSV" (gera CSV no cliente com a lista filtrada).
- `<FiscalCouponsHeader />` (KPIs).
- `<FiscalCouponsFilters />`.
- `<FiscalCouponsTable />` com paginação.
- Dialogs: `FiscalCouponDetailDialog`, `CancelNFCeDialog` controlados via estado.

## 7. Integrações pontuais

- **Cashier / PaymentDialog:** após emitir NFC-e com sucesso, exibir link "Ver no painel de cupons" levando para `/pdv/cupons-fiscais?emission_id={id}` (a página já abre o detalhe se receber o param).
- **Comandas / Mesas:** no histórico da comanda, mostrar badge "Cupom #123 (autorizado)" linkando para o detalhe.

## 8. Permissões e proteção de rota

- Reutilizar `RoleRoute` (já em uso para `notas-fiscais`).
- Acessível por: owner, admin, gerente, financeiro. Garçom e cozinha **não** acessam.
- Cancelamento e reenvio exigem perfil owner/admin/gerente (verificar via `useUserRole`).

## 9. QA / pontos de atenção

- Datas exibidas em pt-BR via `date-fns/locale/ptBR`.
- Valores via `formatBRL`.
- Badges de status usando tokens do tema (`bg-muted`, `text-foreground`, `border-primary`) — sem cores customizadas.
- Action menu seguindo padrão do projeto (dropdown ⋮ posicionado relativo ao trigger).
- DANFE/XML: links abrem em nova aba (`target="_blank"`).
- Cancelamento: validar prazo de 30 min na UI antes de habilitar o botão.
- O `items_snapshot` é JSON — tipar como `Array<{ product_name; quantity; unit_price; subtotal; ncm?; cfop?; ... }>`.

## 10. Resumo de arquivos

**Migração:** 1 arquivo SQL com colunas (`cancellation_reason`, `cancelled_at`, `cancellation_protocol`, `last_status_check_at`, `parent_emission_id`) + índices.

**Edge functions novas:** `cancel-nfce/index.ts`, `check-nfce-status/index.ts`, `resend-nfce/index.ts`.

**Frontend novo:**
- `src/pages/pdv/FiscalCoupons.tsx`
- `src/hooks/use-fiscal-coupons.ts`, `use-fiscal-coupon-detail.ts`, `use-cancel-nfce.ts`, `use-check-nfce-status.ts`, `use-resend-nfce.ts`, `use-fiscal-coupons-summary.ts`
- `src/components/pdv/fiscal-coupons/` (6 componentes listados acima)

**Frontend editado:**
- `src/components/pdv/PDVHeaderNav.tsx` (novo item de menu)
- `src/hooks/use-user-role.ts` (libera rota)
- `src/pages/PDV.tsx` (registra rota)
- `src/components/pdv/payment/PaymentDialog.tsx` (link para o painel após emissão)

Aprove o plano para eu implementar a migração, as edge functions e a interface.
