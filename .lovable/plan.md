

## Reorganizar layout do Caixa: resumo financeiro como sidebar esquerda

O rodapé com 8+ cards de resumo está estourando a largura no zoom 1.6 e cobrindo "Saldo Atual", "Total Vendas" e o botão "Atalhos". A solução é eliminar o rodapé horizontal e transformar o resumo financeiro em uma **sidebar vertical à esquerda**, deixando a página em 3 colunas verticais que cabem perfeitamente sem rolagem.

### Novo layout (3 colunas verticais)

```text
┌──────────────────────────────────────────────────────────────┐
│ Header (operador • aberto em • hora • status) — compacto     │
├──────────────┬──────────────────────────────┬────────────────┤
│              │                              │                │
│  RESUMO      │   MOVIMENTAÇÕES              │  AÇÕES         │
│  FINANCEIRO  │   (tabela com scroll         │  RÁPIDAS       │
│  (sidebar)   │    interno)                  │                │
│              │                              │  Reforço F2    │
│  Saldo Atual │                              │  Sangria F3    │
│  R$ 565,50   │                              │  Cobrar F5     │
│  ──────────  │                              │  Consumo Func  │
│  Abertura    │                              │                │
│  Dinheiro    │                              │  Fechar Caixa  │
│  Cartão      │                              │  F4            │
│  PIX         │                              │                │
│  Sangrias    │                              │  Atalhos F12   │
│  Reforços    │                              │                │
│  ──────────  │                              │                │
│  Total Vendas│                              │                │
│              │                              │                │
└──────────────┴──────────────────────────────┴────────────────┘
```

### O que vai mudar

**1. `src/components/pdv/cashier/CashierSummaryFooter.tsx` → renomeado conceitualmente para sidebar vertical**
   - Trocar o grid horizontal de 8 colunas por um **layout vertical empilhado**.
   - Topo: card de **destaque "Saldo Atual"** grande (text-2xl), com borda `border-primary` quando aberto.
   - Logo abaixo: **"Total Vendas"** em destaque secundário (text-lg).
   - Separador, depois lista vertical compacta dos 6 itens (Abertura, Dinheiro, Cartão, PIX, Sangrias, Reforços) — cada um em uma linha única `flex justify-between`: ícone+label à esquerda, valor à direita. Sem cards aninhados, sem padding excessivo.
   - Container: `h-full overflow-y-auto` para que, em telas menores, a própria sidebar role internamente em vez de quebrar o layout.

**2. `src/pages/pdv/Cashier.tsx` — restruturar o grid principal**
   - Remover o `<CashierSummaryFooter>` do final da página.
   - Trocar o grid `lg:grid-cols-4` (3+1) por `lg:grid-cols-12` com proporções:
     - **Sidebar Resumo (esquerda)**: `lg:col-span-3`
     - **Movimentações (centro)**: `lg:col-span-6`
     - **Ações Rápidas (direita)**: `lg:col-span-3`
   - Em mobile (<lg): empilha em 1 coluna na ordem: Resumo → Movimentações → Ações.
   - Cada coluna fica em um `Card` com `h-full flex flex-col min-h-0` e o conteúdo interno usa `overflow-y-auto` quando necessário.
   - Manter `h-[calc(100vh-3.5rem)] overflow-hidden` no container raiz (já está) — agora vai funcionar de verdade porque não há mais rodapé puxando altura.

**3. `src/components/pdv/cashier/CashierActionsSidebar.tsx` — pequeno ajuste**
   - Reduzir altura dos botões principais de `h-20` → `h-16` e dos secundários de `h-16` → `h-14` para garantir que todos (Reforço, Sangria, Cobrar, Consumo Func, Fechar Caixa, Atalhos) caibam na coluna sem precisar de scroll mesmo em zoom alto.
   - Manter ícones, labels e atalhos visíveis.

**4. `src/components/pdv/cashier/CashierHeader.tsx` — sem mudanças**
   - Já está compacto após a iteração anterior.

### Resultado esperado

- Em zoom 1.6 / 1131px de altura: header + 3 colunas (resumo | movimentações | ações) cabem inteiros sem rolagem do navegador e sem cortes.
- "Saldo Atual" fica em destaque visível no canto superior esquerdo, sempre.
- "Fechar Caixa" e "Atalhos" ficam totalmente visíveis na coluna direita, sem sobreposição.
- A tabela de Movimentações continua sendo a única superfície que rola internamente quando há muitas linhas.
- Modal de Fechamento permanece com seu próprio scroll interno (já feito).
- Em mobile: tudo empilha em 1 coluna na ordem natural de leitura.

### Fora de escopo

- Nenhuma mudança em lógica de caixa, mutações, antifraude ou demais dialogs.
- `OpenCashierDialog` e outros modais permanecem como estão.

### Arquivos modificados

- `src/pages/pdv/Cashier.tsx` (restruturação do grid principal)
- `src/components/pdv/cashier/CashierSummaryFooter.tsx` (rodapé horizontal → sidebar vertical)
- `src/components/pdv/cashier/CashierActionsSidebar.tsx` (alturas reduzidas)

