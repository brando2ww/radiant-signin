## Refinar o visual das tarjas de categoria no menu público

A versão atual usa um bloco sólido com fundo `bg-muted`, barra lateral grossa e título em caixa-alta extra-bold, o que ficou pesado e "bruto". Vou trocar por um cabeçalho mais leve e tipográfico, mantendo a hierarquia visual e o scroll-spy.

### Mudanças em `src/components/public-menu/ProductList.tsx`

**Remover**
- Fundo `bg-muted` em bloco
- Borda lateral `border-l-4 border-primary`
- Padding interno `px-5 py-5`
- `uppercase tracking-wide` e `font-extrabold`
- Badge de contagem com `whitespace-nowrap` chamativa

**Aplicar (novo cabeçalho refinado)**
- Título em `text-xl md:text-2xl font-semibold tracking-tight` (sem caixa-alta)
- Pequeno traço/acento sutil: linha inferior fina `border-b border-border` ocupando toda a largura, com um realce curto em `border-primary` apenas sob o título (estilo "underline accent")
- Contagem de itens em `text-xs text-muted-foreground` discreta, alinhada à direita na mesma linha
- Descrição em `text-sm text-muted-foreground` logo abaixo, sem fundo
- Espaçamento `mb-5` (em vez de `mb-6`) e `pb-2` antes da borda
- Mesma estrutura aplicada à seção "Destaques" (mantendo a estrela)

### Resultado visual esperado

```text
⭐ Destaques                                    1 item
─────────────                ─────────────────────────
(linha sutil, com realce primary só embaixo do título)

[cards...]


Pizzas                                       8 itens
──────                       ─────────────────────────
Massa artesanal feita na casa

[cards...]
```

Mais leve, tipográfico e refinado — sem perder o destaque entre seções. Toda a lógica de `data-cat-anchor`, `scroll-mt-24` e IDs permanece intacta para não quebrar o scroll-spy do `CategoryNav`.
