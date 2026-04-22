
## Aba "Opções" do Produto — modo edição local com botão Salvar

### Problema atual

Em `src/components/pdv/PDVProductOptionsManager.tsx`, cada interação (mudar tipo Única/Múltipla, alternar Obrigatório, ajustar Mín/Máx, ligar/desligar disponibilidade do item, vincular produto) chama `updateOption.mutate(...)` ou `updateItem.mutate(...)` **imediatamente**. Isso causa:

- Toast de sucesso a cada alteração
- Refetch + re-render que reseta foco de inputs e fecha popovers
- Sensação de "tudo se fecha a cada alteração"
- Excesso de chamadas ao Supabase

### Mudança desejada

Trabalhar em **rascunho local**: digitar/alternar tudo livremente; só ao clicar em **Salvar alterações** as mudanças vão para o banco em uma única operação. Adicionar/excluir opções e itens continuam imediatos (são ações estruturais com confirmação visual clara).

### O que muda

**`src/components/pdv/PDVProductOptionsManager.tsx`**

1. Introduzir estado local `draft` espelhando `options` vindas do hook:
   - Ao carregar/atualizar `options` do servidor (e quando `productId` muda), copiar para `draft`.
   - Detectar `isDirty` comparando `draft` vs. `options` originais (snapshot por ID).

2. Substituir as chamadas inline `updateOption.mutate(...)` e `updateItem.mutate(...)` (campos: `type`, `is_required`, `min_selections`, `max_selections`, `is_available`, `name`, `price_adjustment`, vincular/desvincular produto) por **atualizações no `draft`**.

3. Manter imediatos:
   - `createOption` (adicionar nova opção)
   - `deleteOption` (remover opção — com confirmação)
   - `createItem` (adicionar item à opção)
   - `deleteItem` (remover item)
   - Vincular/desvincular produto pode ser local também (parte do draft).

4. Barra de ação fixa no rodapé do componente (sticky):
   - Texto "Você tem alterações não salvas" quando `isDirty`.
   - Botão **Descartar** → reverte `draft` para `options`.
   - Botão **Salvar alterações** → executa em paralelo `updateOption.mutateAsync` e `updateItem.mutateAsync` apenas para registros realmente modificados; ao final, um único toast "Opções salvas".
   - Botões desabilitados quando `!isDirty` ou durante salvamento (loading).

5. Aviso de saída: se o usuário tentar fechar o `ProductDialog` com `isDirty`, exibir um `AlertDialog` "Há alterações não salvas. Deseja descartar?" antes de fechar. Para isso, expor uma callback ou um ref do estado dirty para o `ProductDialog` (ou interceptar `onOpenChange` localmente via prop opcional `onDirtyChange`).

**`src/components/pdv/ProductDialog.tsx`**

- Receber `onDirtyChange` do filho `PDVProductOptionsManager` para saber se a aba Opções tem rascunho pendente.
- Em `onOpenChange(false)`, se a aba Opções estiver dirty, abrir confirmação "Descartar alterações nas opções?" antes de propagar o fechamento.

### Detalhes técnicos

- Diff por ID: comparar campos relevantes (`type`, `is_required`, `min_selections`, `max_selections`) para opções e (`name`, `price_adjustment`, `is_available`, `linked_product_id`) para itens. Disparar mutate apenas para os IDs cujo conteúdo divergiu.
- Silenciar toasts intermediários: usar `mutateAsync` dentro de um `Promise.all` e exibir um único `toast.success("Opções salvas")` no final; em caso de erro, `toast.error` com contagem de falhas.
- Após salvar com sucesso: `queryClient.invalidateQueries(["pdv-product-options", productId])` (já feito pelos hooks) e re-sincronizar `draft` com o resultado.
- Inputs de Mín/Máx passam a usar valor do `draft`, evitando refetch no meio da digitação.

### Arquivos afetados

- Editado: `src/components/pdv/PDVProductOptionsManager.tsx`
- Editado: `src/components/pdv/ProductDialog.tsx` (apenas para aviso de descarte ao fechar)
- Opcional: ajuste em `src/hooks/use-pdv-product-options.ts` para suprimir toasts individuais nas mutations de update (ou passar flag `silent`); manteremos toasts de create/delete.
