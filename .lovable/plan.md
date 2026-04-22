
## Plano: eliminar congelamento de tela em todos os fluxos de menu + modal

### Causa raiz
O congelamento acontece em dois cenários recorrentes do projeto:

1. **`DropdownMenu` abrindo `Dialog` / `AlertDialog` / `Sheet` diretamente**  
   O menu fecha e deixa `pointer-events: none` preso no `body`, travando a tela.

2. **Modal pai com submodais internos sem reset ao fechar**  
   Quando um `Dialog` contém `AlertDialog`/outro modal e o pai fecha sem limpar os estados filhos, pode sobrar overlay invisível ou foco preso.

Isso já bate com a memória do projeto em `dialog-interaction-standards`.

---

## O que será feito

### 1. Criar um padrão único reutilizável
Adicionar um helper compartilhado, por exemplo:

- `src/lib/ui/defer-menu-action.ts`

Função:
- executa `window.setTimeout(fn, 0)` para qualquer ação disparada dentro de `DropdownMenuItem`.

Objetivo:
- parar de resolver caso a caso;
- aplicar o mesmo padrão em todos os menus que abrem modal ou alteram estado que abre modal.

---

### 2. Corrigir os casos já confirmados pelo levantamento

#### A. Produtos PDV
- `src/components/pdv/ProductCard.tsx`
  - deferir **Excluir** também
  - manter o mesmo padrão já usado em **Editar / Duplicar / Enviar para Delivery**

- `src/pages/pdv/Products.tsx`
  - manter `AlertDialog` de exclusão, sem mudança estrutural
  - garantir que ele só seja aberto via ação deferida do card

#### B. Impressoras / Centros de produção
- `src/components/pdv/settings/ProductionCentersTab.tsx`
  - deferir **Editar**
  - deferir **Remover**

#### C. Comandas
- `src/components/pdv/ComandaCard.tsx`
  - deferir **Ver detalhes**
  - deferir **Adicionar item**
  - deferir **Fechar comanda**
  - deferir **Cancelar comanda**

- `src/components/pdv/ComandaDetailsDialog.tsx`
  - resetar `confirmClose` e `confirmCancel` quando o dialog principal fechar
  - ao confirmar fechamento/cancelamento, fechar primeiro o submodal e depois o dialog pai
  - evitar que o `AlertDialog` permaneça “aberto” em estado interno após a comanda ser encerrada

#### D. Pedidos de balcão / pedidos PDV
- `src/components/pdv/OrderCard.tsx`
  - deferir **Ver detalhes**
  - deferir **Fechar pedido**
  - deferir **Cancelar**

- `src/components/pdv/OrderDetailsDialog.tsx`
  - resetar `addItemOpen`, `cancelDialog` e `cancelReason` ao fechar o dialog pai
  - garantir fechamento limpo dos subfluxos

#### E. Estoque / insumos
- `src/components/pdv/IngredientCard.tsx`
  - deferir **Editar**
  - deferir **Excluir**

#### F. Campanhas de avaliação
- `src/components/pdv/evaluations/CampaignCard.tsx`
  - trocar `setEditOpen(true)` por abertura deferida
  - trocar `setDeleteOpen(true)` por abertura deferida

#### G. Cotações
- `src/components/pdv/purchases/QuotationRequestCard.tsx`
  - deferir **Ver Comparativo**
  - deferir **Registrar Resposta**
  - deferir **Excluir**

#### H. Pedidos de compra
- `src/components/pdv/purchases/PurchaseOrderCard.tsx`
  - deferir **Excluir**

#### I. Notas fiscais
- `src/components/pdv/invoices/InvoiceCard.tsx`
  - deferir **Visualizar**
  - deferir **Excluir**

#### J. Delivery / produtos
- `src/components/delivery/ProductList.tsx`
  - deferir **Editar**
  - deferir **Excluir**
  - manter ações puramente diretas (como disponibilidade) sem modal, se não abrirem diálogo

---

## Regra prática que ficará no código
Aplicar o helper sempre que um `DropdownMenuItem` fizer qualquer uma destas coisas:

- abrir `Dialog`, `AlertDialog`, `Sheet`, `Drawer`
- chamar callback do pai que abre modal
- trocar estado do item selecionado que resulta em modal de edição/exclusão/detalhe

Não precisa deferir:
- navegação simples
- toggle direto sem modal
- mutation simples que não abre camada nova

---

## Arquivos previstos
- **Novo:** `src/lib/ui/defer-menu-action.ts`

- **Editar:**
  - `src/components/pdv/ProductCard.tsx`
  - `src/components/pdv/settings/ProductionCentersTab.tsx`
  - `src/components/pdv/ComandaCard.tsx`
  - `src/components/pdv/ComandaDetailsDialog.tsx`
  - `src/components/pdv/OrderCard.tsx`
  - `src/components/pdv/OrderDetailsDialog.tsx`
  - `src/components/pdv/IngredientCard.tsx`
  - `src/components/pdv/evaluations/CampaignCard.tsx`
  - `src/components/pdv/purchases/QuotationRequestCard.tsx`
  - `src/components/pdv/purchases/PurchaseOrderCard.tsx`
  - `src/components/pdv/invoices/InvoiceCard.tsx`
  - `src/components/delivery/ProductList.tsx`

---

## Validação
Testar manualmente, sem recarregar a página, todos estes fluxos:

1. Excluir produto PDV
2. Remover impressora / centro de produção
3. Cancelar comanda pelo card
4. Abrir detalhes da comanda e cancelar por dentro
5. Fechar comanda por dentro
6. Abrir detalhes de pedido no balcão
7. Cancelar pedido no balcão
8. Excluir insumo
9. Editar e excluir campanha
10. Abrir comparativo / resposta / excluir cotação
11. Excluir pedido de compra
12. Visualizar e excluir nota fiscal
13. Editar e excluir produto do delivery

Critério de aceite:
- nenhum fluxo deixa a tela “morta”
- `body` não fica com `pointer-events: none`
- modal fecha e o clique volta a funcionar imediatamente
- não é necessário atualizar a página em nenhum caso
