

## Subir a barra de ações da comanda

### Problema

Na tela `/garcom/comanda/:id`, a barra "Total · Item · Fechar" (linha 113 de `GarcomComandaDetalhe.tsx`) está posicionada com `fixed bottom-16`, encostando direto na BottomTabBar (h-16). O FAB redondo central da BottomTabBar fica colado à barra e o botão "Fechar" parece "abaixado" demais perto da navegação inferior.

### Mudança

Em `src/pages/garcom/GarcomComandaDetalhe.tsx`:

- Linha 113: trocar `fixed bottom-16` por `fixed bottom-20` (de 64px para 80px) — sobe a barra ~16px, criando respiro entre ela e a BottomTabBar e tirando-a de baixo do FAB.
- Linha 84: ajustar o padding de baixo da lista de itens de `pb-48` para `pb-56`, garantindo que o último item ainda role acima da nova posição da barra (sem ficar escondido pelo "Total/Item/Fechar").

Nenhum outro arquivo precisa mudar. Comportamento e funcionalidade permanecem idênticos — só posicionamento.

### Validação

- Abrir `/garcom/comanda/<id>` em viewport mobile (390x844): a barra "Total / Item / Fechar" aparece mais acima, com folga visível em relação à BottomTabBar e sem o FAB sobrepondo o "Fechar".
- Adicionar vários itens à comanda: o último item ainda fica totalmente visível ao rolar até o fim, sem ficar coberto pela barra.
- A safe-area inferior (iOS) continua respeitada via `safe-area-bottom`.

