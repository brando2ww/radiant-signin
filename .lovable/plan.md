

# Bloco 2 -- Funcionalidades Delivery/Produtos

O Bloco 1 (bugs criticos) ja foi implementado. Agora vamos para o Bloco 2.

---

## 2.1 Subprodutos / Opcoes de produtos no PDV

Criar tabelas `pdv_product_options` e `pdv_product_option_items` (espelho do delivery) com migration SQL. Adicionar hook `use-pdv-product-options.ts` e integrar selecao de opcoes no `AddItemDialog.tsx` e `ComandaAddItemDialog.tsx` -- quando o produto tem opcoes, mostrar tela de selecao antes de confirmar.

**Arquivos**: Migration SQL, novo hook, `AddItemDialog.tsx`, `ComandaAddItemDialog.tsx`

## 2.2 Editar/Recortar foto do produto

O componente `ImageCropDialog` ja existe em `src/components/ui/image-crop-dialog.tsx`. Integrar no fluxo de upload dos dois `ProductDialog` (PDV e Delivery). Ao selecionar imagem, abrir o crop dialog com aspect ratio 4:3, e so fazer upload do blob resultante.

**Arquivos**: `src/components/pdv/ProductDialog.tsx`, `src/components/delivery/ProductDialog.tsx`

## 2.3 Resolucao ideal da foto

Adicionar texto "Resolucao ideal: 800x600px" abaixo da area de upload nos dois dialogs de produto.

**Arquivos**: `src/components/pdv/ProductDialog.tsx`, `src/components/delivery/ProductDialog.tsx`

## 2.4 Disponibilidade por dias da semana

Migration para adicionar coluna `available_days jsonb DEFAULT '[]'` nas tabelas `pdv_products` e `delivery_products`. UI com checkboxes (Seg-Dom) na aba "Precos" dos dois dialogs. Filtrar no PDV e menu publico pelo dia atual.

**Arquivos**: Migration SQL, `ProductDialog.tsx` (PDV e delivery), tipos, hooks, menu publico

## 2.5 NCM/CEST/CST ICMS selecionaveis + Substituicao Tributaria

Criar listas estaticas em codigo (top ~50 NCMs de alimentacao, CESTs, CSTs ICMS) e usar `Combobox` com busca. Adicionar checkbox "Substituicao Tributaria" que alterna entre CST e CSOSN na aba Fiscal.

**Arquivos**: Novos arquivos de dados (`src/data/fiscal-codes.ts`), `src/components/pdv/ProductDialog.tsx` (aba Fiscal)

## 2.6 Cooldown da avaliacao (correcao rapida)

Trocar `onChange` por `onBlur` no input de cooldown em `CampaignRoulette.tsx` e `CouponsRoulettes.tsx` para salvar apenas quando o usuario sair do campo.

**Arquivos**: `CampaignRoulette.tsx`, `CouponsRoulettes.tsx`

---

## Detalhes tecnicos

- **1 migration SQL**: cria tabelas `pdv_product_options` + `pdv_product_option_items`, adiciona `available_days` em `pdv_products` e `delivery_products`
- **~10 arquivos editados/criados**
- O Bloco 3 (PDV/Caixa) e Bloco 4 (avaliacoes restantes) ficam para a proxima iteracao

