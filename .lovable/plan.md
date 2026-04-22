

## Corrigir sobreposição do footer pela sidebar de Ações Rápidas (caixa aberto)

Quando o caixa está **aberto**, a sidebar lateral renderiza 6 botões verticais (Reforço, Sangria, Cobrar, Consumo Func., spacer, Fechar Caixa, Atalhos). Somados, eles precisam de ~520px de altura. Em telas Windows com zoom (devicePixelRatio 1.6, viewport efetivo ~700px de altura útil para a área central), esse conteúdo estoura o `Card` da sidebar e **sobrepõe o rodapé** — exatamente o que aparece no print: "Cobrar" e "Consumo Func." cobrindo "Total Vendas / Saldo Atual / Fechar Caixa".

Quando o caixa está **fechado**, a sidebar tem apenas 1-2 botões e cabe sem problema — por isso o bug só aparece com caixa aberto.

### O que vai mudar

**1. `src/components/pdv/cashier/CashierActionsSidebar.tsx` — compactar botões e habilitar scroll interno seguro**

- Trocar todos `h-20` (Reforço, Sangria, Cobrar, Fechar Caixa) → `h-16`.
- Trocar `h-16` (Consumo Func.) → `h-14`.
- Reduzir ícones grandes `h-6 w-6` → `h-5 w-5` e `text-sm` → `text-xs` nos labels dos botões principais para acompanhar a altura menor.
- Reduzir o `gap-3` do container → `gap-2` e o `mb-2` do título → `mb-1`.
- Trocar o spacer `<div className="flex-1" />` por `<div className="flex-1 min-h-2" />` para garantir respiro mínimo entre o bloco superior e "Fechar Caixa" sem quebrar quando o espaço é apertado.
- Adicionar `overflow-y-auto` no container raiz como fallback: se ainda assim faltar espaço (telas muito pequenas), a sidebar rola internamente em vez de invadir o footer.

**2. `src/pages/pdv/Cashier.tsx` — garantir que o Card da sidebar respeite a altura disponível**

- Linha do `Card` da sidebar (atualmente `<Card>`): adicionar classes `flex flex-col min-h-0 overflow-hidden`.
- Trocar `<CardContent className="p-4 h-full">` por `<CardContent className="p-3 flex-1 min-h-0 overflow-hidden">` para que o `h-full` da sidebar interna realmente herde altura limitada e o overflow seja contido pelo Card.

### Resultado esperado

- Caixa aberto em qualquer zoom (incluindo Windows zoom 1.6 / 1131px de altura): todos os 6 botões da sidebar cabem dentro do próprio Card sem invadir o rodapé.
- "Total Vendas", "Saldo Atual" e "Fechar Caixa" no rodapé voltam a ficar totalmente visíveis e clicáveis.
- Em telas extremamente pequenas, a sidebar rola internamente em vez de quebrar o layout.
- Caixa fechado continua igual (já cabia).
- Nenhuma mudança em lógica, atalhos de teclado, mutations ou no modal de fechamento.

### Arquivos modificados

- `src/components/pdv/cashier/CashierActionsSidebar.tsx`
- `src/pages/pdv/Cashier.tsx`

### Fora de escopo

- Header, footer de resumo, modal de fechamento (já corrigidos nas iterações anteriores).
- Outras páginas do PDV.

