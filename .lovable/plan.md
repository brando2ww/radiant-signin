

# Plano de Correções e Melhorias do Sistema

Este plano agrupa todas as questões levantadas em blocos organizados por prioridade.

---

## BLOCO 1 -- BUGS CRÍTICOS (página congela / erros)

### 1.1 Erro ao finalizar avaliação (evaluation_answers_score_check)
**Causa**: A tabela `evaluation_answers` tem `CHECK (score >= 1 AND score <= 5)`. Perguntas do tipo "Escolha Única" e "Múltipla Escolha" enviam `score: 0` porque não usam score numérico -- violam a constraint.
**Solução**: Migration para alterar o check constraint: `score >= 0 AND score <= 10` (ou remover e usar trigger de validação). Isso cobre NPS (0-10) e escolhas (score 0).
**Arquivo**: Nova migration SQL

### 1.2 Ao excluir campanha de avaliação, congela
**Causa**: Em `CampaignCard.tsx`, `handleDelete` chama `deleteCampaign.mutate()` e fecha o dialog imediatamente com `setDeleteOpen(false)` sem esperar `onSuccess`. Se a mutation falha (FK constraints), a UI trava.
**Solução**: Mover `setDeleteOpen(false)` para o callback `onSuccess` da mutation. Garantir que o delete cascade funcione nas tabelas filhas (`evaluation_answers`, `campaign_prizes`, etc.).
**Arquivos**: `CampaignCard.tsx`, possivelmente nova migration para cascades faltantes.

### 1.3 Ao editar/excluir produto do Delivery, página congela
**Causa**: O `ProductDialog` do delivery usa `onOpenChange` direto e o `AlertDialog` de exclusão em `ProductList.tsx` chama `deleteProduct.mutate()` + `setDeletingProduct(null)` sem aguardar sucesso. Se há FK constraints (options, recipes), o delete falha silenciosamente.
**Solução**: Mover `setDeletingProduct(null)` para `onSuccess`. Verificar cascades nas tabelas `delivery_product_options`, `delivery_product_recipes`, `delivery_option_item_recipes`.
**Arquivos**: `ProductList.tsx` (delivery)

### 1.4 Ao editar/excluir produto no estoque (PDV), congela
**Causa**: Mesmo padrão -- `deleteIngredient` em `Stock.tsx` fecha dialog antes do sucesso da mutation. FK constraints de `pdv_product_recipes` e `delivery_product_recipes` que referenciam `pdv_ingredients` podem bloquear o delete.
**Solução**: Mover `setDeleteDialog(null)` para `onSuccess` apenas (já está lá, verificar se há outro path). Adicionar cascade ou soft-delete check nas recipes que referenciam ingredientes.
**Arquivos**: `Stock.tsx`, possivelmente migration para cascade em `pdv_product_recipes.ingredient_id`

### 1.5 Receita em Produto não abre ao criar (apenas após editar)
**Causa**: A tab "Receita" está corretamente `disabled={!product}` nos dois dialogs (PDV e Delivery). O produto precisa ser salvo primeiro. Porém, o dialog fecha após criar e reabre sem o ID.
**Solução**: Após criar o produto, ao invés de fechar o dialog, reabrir automaticamente em modo edição com o produto recém-criado, para que as tabs de receita e opções fiquem acessíveis.
**Arquivos**: `ProductDialog.tsx` (PDV), `ProductDialog.tsx` (delivery), `Products.tsx` (PDV), `Menu.tsx` (delivery)

---

## BLOCO 2 -- FUNCIONALIDADES DELIVERY/PRODUTOS

### 2.1 Subprodutos / Opções de produtos (para seleção no PDV)
**Causa**: O PDV `AddItemDialog.tsx` não mostra opções/complementos do produto ao adicionar a uma comanda. Os produtos PDV não têm sistema de opções como o delivery.
**Solução**: Criar tabela `pdv_product_options` e `pdv_product_option_items` (espelho do delivery), ou reutilizar as opções do delivery via link. Adicionar seleção de opções no `AddItemDialog` quando o produto tem opções.
**Arquivos**: Nova migration, novo componente de seleção de opções no `AddItemDialog.tsx`

### 2.2 Editar/Recortar foto do produto antes de salvar
**Causa**: O componente `ImageCropDialog` já existe no projeto mas não é usado nos dialogs de produto.
**Solução**: Integrar `ImageCropDialog` no fluxo de upload dos dois `ProductDialog` (PDV e Delivery). Ao selecionar imagem, abrir o crop dialog, e só fazer upload do blob resultante.
**Arquivos**: `ProductDialog.tsx` (PDV), `ProductDialog.tsx` (delivery)

### 2.3 Informar resolução ideal da foto
**Solução**: Adicionar texto descritivo "Resolução ideal: 800x600px" abaixo do upload de imagem nos dois dialogs.
**Arquivos**: `ProductDialog.tsx` (PDV), `ProductDialog.tsx` (delivery)

### 2.4 Disponibilidade por dias da semana
**Solução**: Adicionar campo `available_days` (jsonb array de dias: ["seg","ter",...]) nas tabelas `pdv_products` e `delivery_products`. UI com checkboxes de dias da semana nos dialogs de produto. Filtrar disponibilidade no menu público e no PDV baseado no dia atual.
**Arquivos**: Nova migration, `ProductDialog.tsx` (PDV e delivery), hooks de produtos, menu público

### 2.5 NCM, CEST, CST ICMS selecionáveis + Substituição Tributária
**Causa**: Atualmente são campos de texto livre nos produtos PDV.
**Solução**: Criar tabelas de referência (`fiscal_ncm`, `fiscal_cest`, `fiscal_cst_icms`) ou usar listas estáticas em código com Combobox (autocomplete). Adicionar checkbox "Substituição Tributária" que alterna entre CST e CSOSN. Substituir os `Input` por `Combobox` na aba Fiscal do `ProductDialog`.
**Arquivos**: `ProductDialog.tsx` (PDV), possíveis arquivos de dados estáticos para NCM/CEST/CST

---

## BLOCO 3 -- FUNCIONALIDADES PDV/CAIXA

### 3.1 Pedido aparece na cozinha sem ser enviado / não aparece no caixa
**Causa**: Ao criar itens no Balcão, o `kitchen_status` padrão é `"pendente"`, fazendo-os aparecer na tela de cozinha. No Balcão, itens são inseridos via `usePDVOrders.addItem` que pode não definir `kitchen_status: "entregue"`.
**Solução**: Garantir que itens do balcão sejam criados com `kitchen_status: 'entregue'` (não passam pela cozinha). Revisar o fluxo de criação de itens no `use-pdv-orders.ts`.
**Arquivos**: `use-pdv-orders.ts`, `Balcao.tsx`

### 3.2 Botões "Cancelar pedido" e "Fechar pedido" no caixa
**Causa**: Preciso ver a foto mencionada para entender o bug exato. Provável sobreposição visual ou lógica incorreta dos botões.
**Solução**: Revisar o layout dos botões na tela do caixa baseado no feedback visual.
**Arquivos**: `Cashier.tsx` ou componentes relacionados

### 3.3 Controle de consumo de funcionários
**Solução**: Criar tabela `pdv_employee_consumption` com campos (employee_name, items, total, date, status). Adicionar interface para lançar consumo no caixa e gerar conta nominal. Integrar com movimentação financeira.
**Arquivos**: Nova migration, novo componente, integração com caixa

### 3.4 Configuração de impressora por produto
**Solução**: Adicionar campo `printer_terminal` (ou `kitchen_station`) nos produtos PDV. Na configuração, permitir mapear produtos a terminais de impressão específicos.
**Arquivos**: Migration para coluna nova, `ProductDialog.tsx` (PDV)

---

## BLOCO 4 -- AVALIAÇÕES

### 4.1 Limitador de avaliação (cooldown) difícil de alterar
**Causa**: O `Input type="number"` no cooldown dispara `handleFieldSave` a cada `onChange`, salvando imediatamente no banco a cada tecla digitada.
**Solução**: Usar debounce (500ms) no save, ou trocar para salvar apenas no `onBlur` em vez de `onChange`.
**Arquivos**: `CampaignRoulette.tsx`, `CouponsRoulettes.tsx`

### 4.2 Compartilhar cupons entre rede de restaurantes
**Solução**: Permitir que campanhas de avaliação tenham escopo `tenant_id` (rede) em vez de `user_id` individual. Cupons gerados em uma unidade podem ser validados em outra da mesma rede.
**Arquivos**: Migration para adicionar `tenant_id` em `evaluation_campaigns`, ajustes nos hooks e validação

---

## Ordem de execução sugerida

1. Bugs críticos primeiro (Bloco 1) -- desbloqueia o uso diário
2. Melhorias de produto (Bloco 2) -- impacto direto na operação
3. Funcionalidades PDV (Bloco 3) -- novas capacidades
4. Avaliações (Bloco 4) -- refinamentos

---

## Detalhes técnicos

- **Migrations necessárias**: ~6 novas migrations SQL
- **Componentes alterados**: ~15 arquivos
- **Novos componentes**: ~3-4 (seleção de opções PDV, consumo funcionários, combobox fiscal)
- **Escopo estimado**: Este é um plano grande. Recomendo implementar por bloco, começando pelo Bloco 1.

Deseja que eu comece pelo Bloco 1 (bugs críticos)?

