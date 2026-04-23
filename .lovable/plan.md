

## Subir o "Enviar para Cozinha" acima da bottom nav

### Causa

Em `src/pages/garcom/GarcomAdicionarItem.tsx` linha 180, a barra "Enviar para Cozinha" usa `bottom-16` (64px). A `BottomTabBar` flutua com `bottom: calc(1rem + safe-area)` + altura ~56px = ocupa até ~88-100px do rodapé. Resultado: a nav fica por cima da barra de envio (visível no print).

Mesmo problema em `GarcomComandaDetalhe.tsx` (linha 113, `bottom-20` = 80px) e `GarcomItemDetalhe.tsx` (linha 97, `bottom-20`).

### Mudança

Subir as três barras para ficarem claramente acima da pílula da nav (~110px do rodapé):

1. **`src/pages/garcom/GarcomAdicionarItem.tsx`** linha 180: trocar `fixed bottom-16 ... safe-area-bottom` por `fixed left-0 right-0 z-30 border-t bg-background px-4 py-3` + `style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}`.
2. **`src/pages/garcom/GarcomAdicionarItem.tsx`** linha 138: aumentar `pb-32` → `pb-48` para o último produto da lista não ficar atrás da barra.
3. **`src/pages/garcom/GarcomComandaDetalhe.tsx`** linha 113: trocar `bottom-20` pelo mesmo `style={{ bottom: "calc(6rem + env(safe-area-inset-bottom))" }}`.
4. **`src/pages/garcom/GarcomItemDetalhe.tsx`** linha 97: trocar `bottom-20` pelo mesmo `style`.

### Validação

- iPhone 390×844, em `/garcom/comanda/.../adicionar` com itens pendentes: a barra "Enviar para Cozinha" aparece totalmente acima da pílula da bottom nav, sem sobreposição.
- O botão "Enviar para Cozinha" fica clicável inteiro.
- Lista de produtos rola até o último item sem ficar escondido pela barra.
- Mesmo comportamento em `/garcom/comanda/:id` (barra Total/Cobrar) e na tela de item.

