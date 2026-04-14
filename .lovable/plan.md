

# Bloco 3 -- PDV/Caixa

## 3.1 Pedido do balcão aparece na cozinha sem ser enviado

**Problema**: Em `use-pdv-orders.ts` linha 178, `addItem` insere com `kitchen_status: "pendente"`, fazendo itens do balcão aparecerem na cozinha. Na tela de cozinha (`use-pdv-kitchen.ts`), o filtro busca status `["pendente", "preparando", "pronto"]` sem distinguir a origem.

**Solucao**: Quando `source === "balcao"`, inserir com `kitchen_status: "entregue"` para que nao aparecam na cozinha. Adicionar parametro opcional `kitchen_status` no `addItem` de `use-pdv-orders.ts`. No `Balcao.tsx`, passar `kitchen_status: "entregue"` ao chamar `addItem`.

**Arquivos**: `src/hooks/use-pdv-orders.ts`, `src/pages/pdv/Balcao.tsx`

---

## 3.2 Botoes "Cancelar pedido" e "Fechar pedido" no caixa

**Problema**: Na tela do caixa, ao cobrar via `ChargeSelectionDialog` + `PaymentDialog`, nao ha opcao de cancelar um pedido/comanda diretamente. Os botoes de cancelamento e fechamento precisam estar acessiveis.

**Solucao**: Adicionar opcoes de "Cancelar" no `ChargeSelectionDialog` (botao secundario em cada card de comanda/mesa) com confirmacao e motivo. Ao cancelar comanda avulsa, chamar a mutation de cancelamento existente. Ao cancelar mesa, fechar comandas como canceladas e liberar mesa.

**Arquivos**: `src/components/pdv/cashier/ChargeSelectionDialog.tsx`, possivelmente `src/hooks/use-pdv-comandas.ts` (adicionar `cancelComanda` se nao existir)

---

## 3.3 Controle de consumo de funcionarios

**Solucao**:
1. **Migration**: Criar tabela `pdv_employee_consumption` com campos: `id`, `user_id`, `employee_name`, `comanda_id` (nullable), `total`, `status` (aberta/paga/descontada), `notes`, `created_at`, `closed_at`. RLS por `user_id`.
2. **Hook**: `use-pdv-employee-consumption.ts` com CRUD + listar consumos.
3. **UI**: Novo componente `EmployeeConsumptionDialog` acessivel a partir do sidebar do caixa (`CashierActionsSidebar`). Permite criar consumo nominal para um funcionario, lanca como comanda interna. Mostra listagem de consumos pendentes com opcao de marcar como descontado/pago.
4. **Integracao**: Ao fechar consumo como "pago", registrar movimentacao no caixa com tipo "venda" e descricao "Consumo Funcionario: [nome]".

**Arquivos**: Nova migration SQL, `src/hooks/use-pdv-employee-consumption.ts`, `src/components/pdv/cashier/EmployeeConsumptionDialog.tsx`, `src/components/pdv/cashier/CashierActionsSidebar.tsx`, `src/pages/pdv/Cashier.tsx`

---

## 3.4 Configuracao de impressora por produto

**Solucao**:
1. **Migration**: Adicionar coluna `printer_station TEXT DEFAULT 'cozinha'` na tabela `pdv_products`. Valores possiveis: "cozinha", "bar", "copa", "confeitaria", ou customizado.
2. **UI**: Adicionar campo `Select` na aba geral do `ProductDialog` (PDV) com as opcoes de estacao.
3. **Cozinha**: Na tela Kitchen, adicionar filtro por `printer_station` para que cada terminal veja apenas seus itens. Requer join com `pdv_products` no `use-pdv-kitchen.ts`.

**Arquivos**: Nova migration SQL, `src/components/pdv/ProductDialog.tsx`, `src/hooks/use-pdv-kitchen.ts`, `src/pages/pdv/Kitchen.tsx`, `src/hooks/use-pdv-products.ts` (tipo)

---

## Ordem de execucao

1. **3.1** Fix kitchen_status do balcao (rapido)
2. **3.2** Cancelamento no caixa
3. **3.3** Consumo de funcionarios (migration + hook + UI)
4. **3.4** Impressora por produto (migration + UI + filtro)

## Detalhes tecnicos

- **2 migrations SQL**: tabela `pdv_employee_consumption` + coluna `printer_station` em `pdv_products`
- **~8 arquivos editados/criados**
- Bloco 4 (avaliacoes) fica para a proxima iteracao

