

## Impressão Automática do Demonstrativo ao Fechar Caixa

### O Que Vai Mudar

Ao confirmar o fechamento do caixa, o sistema abrirá automaticamente a janela de impressão do navegador com um demonstrativo completo contendo: dados da sessão, movimentações, resumo financeiro e informações de divergência/justificativa.

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/pdv/CloseCashierDialog.tsx` | Adicionar função `printCashierReport` que monta HTML do demonstrativo e chama `window.print()` via iframe oculto. Chamar essa função dentro de `handleClose` antes de disparar o `onClose`. |
| `src/pages/pdv/Cashier.tsx` | Passar `movements` como prop para o `CloseCashierDialog` para que o relatório inclua a lista de movimentações. |

### Conteúdo do Demonstrativo Impresso

```text
═══════════════════════════════════════
       DEMONSTRATIVO DE CAIXA
═══════════════════════════════════════
Abertura: 20/03/2026 08:00
Fechamento: 20/03/2026 18:00

RESUMO FINANCEIRO
─────────────────────────────────────
Saldo Inicial:          R$ 100,00
Vendas em Dinheiro:   + R$  50,00
Vendas em Cartão:       R$ 120,00
Vendas em PIX:          R$  80,00
Reforços:             + R$  30,00
Sangrias:             - R$  20,00
─────────────────────────────────────
Saldo Esperado:         R$ 160,00
Saldo Final Informado:  R$ 155,00
Diferença:            - R$   5,00
Total de Vendas:        R$ 250,00

MOVIMENTAÇÕES
─────────────────────────────────────
10:30  Venda     Dinheiro   R$ 25,00
11:15  Venda     Cartão     R$ 60,00
14:00  Sangria              R$ 20,00
...

Justificativa: (se houver)
Nível de Risco: Baixo
═══════════════════════════════════════
```

### Implementação Técnica

1. Criar função `printCashierReport()` que:
   - Monta string HTML com CSS inline para impressão (formatação térmica 80mm e A4)
   - Cria iframe oculto, injeta o HTML, chama `contentWindow.print()`
   - Remove o iframe após a impressão

2. No `handleClose`, chamar `printCashierReport()` com os dados da sessão, movimentações, saldo final e justificativa **antes** de chamar `onClose`

3. Atualizar `CloseCashierDialogProps` para receber `movements` como prop

