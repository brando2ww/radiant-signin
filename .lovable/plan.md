

## Fazer a página do Caixa caber 100% na tela, sem rolagem externa

A página `/pdv/caixa` hoje usa `min-h-[calc(100vh-3.5rem)]`, ou seja, ela pode crescer além da viewport — o que faz aparecer a barra de rolagem do navegador (visível no print: header do PDV, cabeçalho do operador, tabela de movimentações, sidebar de ações **e** rodapé com 8 cards de resumo + Total Vendas + Saldo Atual não cabem juntos em 1131px com zoom 1.6).

A regra que o usuário quer:
- **Página do PDV**: sempre completa, sem rolagem da janela e sem cortes.
- **Modal de Fechamento**: única superfície que pode rolar internamente (já feito na iteração anterior).

### O que vai mudar

Arquivo único: `src/pages/pdv/Cashier.tsx`

1. **Travar a altura da página exatamente na viewport disponível**
   - Trocar `min-h-[calc(100vh-3.5rem)]` por `h-[calc(100vh-3.5rem)] overflow-hidden` no container raiz (linhas 212 e 224).
   - Isso impede que a página cresça além da janela e mata a rolagem global.

2. **Garantir que a área central (Movimentações + Sidebar) seja a única que se ajusta**
   - O grid `grid-cols-1 lg:grid-cols-4 ... flex-1` já existe e tem `min-h-0` implícito faltando — adicionar `min-h-0` para que o `flex-1` realmente respeite o espaço disponível e a tabela de movimentações role internamente (o `overflow-auto` interno já está pronto na linha 245).
   - Adicionar `min-h-0` também no `Card` da tabela (linha 234) e usar `overflow-hidden` no `CardContent` (já tem).

3. **Compactar o rodapé de resumo para caber sem cortar**
   - No `CashierSummaryFooter`: reduzir `p-4` → `p-3`, `gap-3` → `gap-2`, padding dos cards internos `p-3` → `p-2`, ícones `h-6 w-6` → `h-5 w-5`, e tipografia do "Saldo Atual" de `text-xl` → `text-lg`. Resultado: ~25% mais baixo, libera espaço vertical para o miolo.
   - Arquivo: `src/components/pdv/cashier/CashierSummaryFooter.tsx`.

4. **Compactar levemente o header superior**
   - No `CashierHeader`: reduzir `p-4` → `p-3` e ícones `h-10 w-10` → `h-9 w-9`. Pequena economia, mas suficiente para zoom alto.
   - Arquivo: `src/components/pdv/cashier/CashierHeader.tsx`.

5. **Skeleton de loading com a mesma regra**
   - Aplicar a mesma troca (`h-[calc(100vh-3.5rem)] overflow-hidden`) no bloco de loading (linha 212) para evitar flash de rolagem.

### Resultado esperado

- Em qualquer zoom (incluindo o 1.6 do print): header, tabela de movimentações, sidebar de ações e rodapé com resumo financeiro **cabem inteiros** na tela, sem barra de rolagem do navegador e sem cortes nos botões "Fechar Caixa" / "Atalhos".
- Se a tabela de Movimentações tiver muitas linhas, **só ela rola internamente** (já é o comportamento atual via `overflow-auto` na linha 245).
- O modal de Fechamento de Caixa continua sendo o único componente com rolagem interna própria (já implementado).
- Em telas muito pequenas (mobile), o grid quebra em 1 coluna e o `overflow-hidden` ainda funciona porque o conteúdo crítico (sidebar + footer) é compacto o suficiente.

### Fora de escopo

- Nenhuma mudança em lógica de caixa, antifraude, mutações ou nos demais dialogs.
- Outras páginas do PDV (Salão, Comandas, etc.) não são tocadas.

### Arquivos modificados

- `src/pages/pdv/Cashier.tsx`
- `src/components/pdv/cashier/CashierSummaryFooter.tsx`
- `src/components/pdv/cashier/CashierHeader.tsx`

