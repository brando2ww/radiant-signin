

## Estender barra "Enviar para Cozinha" até a base da tela

### Causa

Atualmente a barra está em `bottom: calc(6rem + safe-area)`, deixando um gap visível entre ela e o fim da tela. Você quer o oposto: a barra colada na base, com a bottom nav flutuando por cima do espaço inferior — visualmente igual a um footer real.

### Mudança

Em `src/pages/garcom/GarcomAdicionarItem.tsx` (linha 180-194), `GarcomComandaDetalhe.tsx` (linha 113) e `GarcomItemDetalhe.tsx` (linha 97):

- Trocar o `style={{ bottom: "calc(6rem + ...)" }}` por `bottom-0`.
- Adicionar padding inferior generoso para o **conteúdo** do bar não ficar atrás da nav: `pb-[calc(6rem+env(safe-area-inset-bottom))]` no container interno (mantendo o botão "Enviar" e o texto "X itens pendentes" visíveis acima da nav).
- O fundo (`bg-background border-t`) vai do conteúdo até a base da tela.
- Ajustar `z-index`: a barra fica `z-30`, a `BottomTabBar` continua `z-50`, então a pílula da nav aparece flutuando por cima da extensão inferior da barra.

```tsx
<div className="fixed bottom-0 left-0 right-0 z-30 border-t bg-background">
  <div className="px-4 pt-3 pb-[calc(6rem+env(safe-area-inset-bottom))]">
    {/* texto "X itens pendentes" + botão Enviar */}
  </div>
</div>
```

### Validação

- iPhone 390×844, em `/garcom/comanda/.../adicionar` com itens pendentes:
  - Fundo da barra "Enviar para Cozinha" preenche desde o conteúdo até a base da tela.
  - Botão "Enviar para Cozinha" e contagem ficam acima da pílula da nav (visíveis e clicáveis).
  - Pílula da bottom nav aparece "flutuando" sobre a parte inferior da barra (sem gap).
- Mesmo comportamento em `/garcom/comanda/:id` e tela de item.

