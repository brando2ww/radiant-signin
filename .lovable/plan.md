

## Card inteiro da comanda clicável

### Causa

Em `src/pages/garcom/GarcomMesaDetalhe.tsx` (linhas 267-309), o card de cada comanda é um `<div>` e só o `<button>` com o número da comanda (linhas 272-280) navega. O resto do card (lista de itens, área vazia, espaços) não responde ao toque.

### Mudança

Trocar o `<div>` externo do card por `<button type="button">` com `onClick` navegando para `/garcom/comanda/:id`. O texto interno vira `<span>` (não pode ter `<button>` dentro de `<button>`). Estilo: `w-full text-left rounded-2xl border bg-card p-4 space-y-3 active:opacity-70 active:scale-[0.99] transition-transform`.

O botão "Enviar (N)" para cozinha precisa continuar funcionando sem disparar a navegação. Como `<button>` aninhado é HTML inválido, ele será renderizado via `Button asChild` com um `<span role="button" tabIndex={0}>` interno que faz `e.stopPropagation()` no `onClick` (e `onKeyDown` para Enter/Espaço, mantendo acessibilidade).

Comportamento idêntico:
- Clicar em qualquer área do card → abre `/garcom/comanda/:id`.
- Clicar em "Enviar (N)" → manda para cozinha sem navegar.
- Botão "Nova comanda" abaixo da lista permanece igual.

### Validação

- Mesa 04: tocar em qualquer parte do card "20260423-039 — TESTE" (header, área "Sem itens", borda) → abre a comanda.
- Mesa com itens pendentes: tocar no card → abre a comanda; tocar em "Enviar" → envia para cozinha e permanece na tela da mesa.
- Acessibilidade: card é `<button>` nativo (foco/Enter funcionam); ação interna "Enviar" é alcançável por Tab e ativa com Enter/Espaço sem propagar.

