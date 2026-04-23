

## Card de comanda totalmente clicável (corrigir HTML inválido)

### Causa

Na minha última mudança, transformei o card da comanda em `<button>` envolvendo `<div>`s. Em HTML, `<button>` só pode conter conteúdo *phrasing* (inline) — ter `<div>` dentro é inválido. Navegadores "fecham" o botão prematuramente, deixando partes do card (lista de itens, espaços) sem responder ao toque, exatamente o sintoma que você está vendo.

### Mudança

Em `src/pages/garcom/GarcomMesaDetalhe.tsx` (linhas 266-319), refazer com HTML válido:

- Container externo volta a ser `<div>` com `role="button"`, `tabIndex={0}`, `cursor-pointer` e handlers `onClick` + `onKeyDown` (Enter/Espaço) — toda a área fica clicável e acessível por teclado.
- Botão "Enviar (N)" interno volta a ser `<Button>` real (sem aninhamento ilegal) com `e.stopPropagation()` no `onClick` para não disparar a navegação do card.
- Mantém os efeitos visuais (`active:opacity-70 active:scale-[0.99] transition-transform`).

```tsx
<div
  role="button"
  tabIndex={0}
  onClick={() => navigate(`/garcom/comanda/${comanda.id}`)}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/garcom/comanda/${comanda.id}`);
    }
  }}
  className="cursor-pointer rounded-2xl border bg-card p-4 space-y-3 active:opacity-70 active:scale-[0.99] transition-transform"
>
  ...
  <Button onClick={(e) => { e.stopPropagation(); sendToKitchen(pendingIds); }}>
    Enviar ({pendingIds.length})
  </Button>
  ...
</div>
```

### Validação

- Tocar em qualquer área do card da comanda (cabeçalho, "Sem itens", lista de itens, bordas, espaços vazios) → abre o detalhe da comanda.
- Tocar em "Enviar (N)" → envia para a cozinha, sem navegar.
- HTML válido elimina o comportamento errático de área de clique no iOS/Safari.

