

## Sidebar com botões compactos lado a lado e "Fechar Caixa" em destaque

Em vez de empilhar 6 botões verticalmente (o que estoura no Windows com zoom), reorganizar a sidebar de Ações Rápidas para:

- **Grid 2×2 de botões pequenos** no topo: Reforço, Sangria, Cobrar, Consumo Func.
- **Espaço flexível** no meio (empurra o botão principal para baixo)
- **"Fechar Caixa" full-width grande** no final, mantendo o destaque visual
- **"Atalhos"** continua ancorado no rodapé como hoje

### Layout visual (caixa aberto)

```text
┌─────────────────────────┐
│ AÇÕES RÁPIDAS           │
├────────────┬────────────┤
│ ↗ Reforço  │ ↘ Sangria  │  ← h-14
│    F2      │    F3      │
├────────────┼────────────┤
│ 🧾 Cobrar  │ 👥 Consumo │  ← h-14
│    F5      │    Func.   │
├────────────┴────────────┤
│                         │
│  (espaço flexível)      │
│                         │
├─────────────────────────┤
│   🔒 Fechar Caixa       │  ← h-20, destruct, full-width
│         F4              │
├─────────────────────────┤
│ ❓ Atalhos          F12 │
└─────────────────────────┘
```

### Mudanças (1 arquivo)

**`src/components/pdv/cashier/CashierActionsSidebar.tsx`** (apenas o ramo `isOpen === true`):

- Envolver Reforço, Sangria, Cobrar e Consumo Func. em um `<div className="grid grid-cols-2 gap-2">`.
- Cada um desses 4 botões: `h-14`, ícone `h-4 w-4`, label `text-xs`, kbd `text-[9px]`.
- Manter o spacer `flex-1 min-h-2` entre o grid e o botão de fechar.
- "Fechar Caixa" volta a ser `h-20` full-width com ícone `h-6 w-6` e destaque visual `destructive` (estética principal preservada).
- Botão "Atalhos" no rodapé permanece igual.

### Economia de altura

- Antes (vertical): 4 botões × ~64px + spacer + Fechar 64px = **~340px** só nos botões de ação.
- Depois (grid + Fechar grande): 2 linhas × 56px + spacer + Fechar 80px = **~200px**.
- Sobra ~140px de respiro vertical → cabe sem scroll mesmo no Windows com zoom 1.6.

### Resultado esperado

- Tudo cabe na viewport sem rolagem interna na sidebar e sem cortar o footer.
- "Fechar Caixa" continua sendo o botão visualmente dominante (destrutivo, grande, isolado).
- Fluxo de teclado (F2/F3/F4/F5) inalterado.
- Caixa fechado: continua igual (Abrir Caixa grande + Reimprimir Último).

### Fora de escopo

- Lógica, mutations, modal de fechamento, header, footer de resumo.

### Arquivo modificado

- `src/components/pdv/cashier/CashierActionsSidebar.tsx`

