

## Padronizar formatação de valores em reais (BR)

### Problema

Hoje o sistema mistura formatos:

- **`toFixed(2)`** → produz `R$ 1234.56` (ponto decimal, sem separador de milhar). Aparece em **821 lugares** distribuídos por **68 arquivos** (PDV, garçom, delivery, comandas, financeiro, recibos, etc.).
- **`formatCurrency`** local em alguns componentes (`PaymentDialog`, `EmployeeConsumptionDialog`, etc.) usa `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` → produz `R$ 1.234,56`.
- Existe **uma única função canônica** já correta em `src/lib/whatsapp-message.ts` (`formatCurrency`), mas mal posicionada (lib de WhatsApp) e raramente usada (~22 arquivos).

Resultado para o usuário: telas com `R$ 49.00` ao lado de telas com `R$ 1.234,56`.

### Objetivo

Toda exibição monetária no app passa a usar **um único helper** que retorna o padrão brasileiro: `R$ 49,00` e `R$ 1.234,56`.

### Mudança

**1. Criar helper canônico** em `src/lib/format.ts`:

```ts
const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formata valor numérico em reais no padrão BR: R$ 1.234,56 */
export function formatBRL(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return brl.format(Number.isFinite(n) ? n : 0);
}
```

Robusto contra `null`/`undefined`/`string` (comum em dados que vêm do Supabase como `numeric`).

**2. Re-exportar** o `formatCurrency` existente em `src/lib/whatsapp-message.ts` como alias para `formatBRL` (para não quebrar imports já existentes nos ~22 arquivos que já usam):

```ts
export { formatBRL as formatCurrency } from "@/lib/format";
```

**3. Substituição em massa** dos padrões antigos pelos novos. Aplica-se a TODOS os ~68 arquivos com `toFixed(2)` precedido de `R$`:

| Padrão antigo | Substituir por |
|---|---|
| `R$ {x.toFixed(2)}` | `{formatBRL(x)}` |
| `R$ {Number(x).toFixed(2)}` | `{formatBRL(x)}` |
| `R$ {(a + b).toFixed(2)}` | `{formatBRL(a + b)}` |
| `-R$ {x.toFixed(2)}` | `{formatBRL(-x)}` (ou prefixo "- " + formatBRL) |
| `+R$ {x.toFixed(2)}` (ajuste de opção) | `{x >= 0 ? "+" : ""}{formatBRL(x)}` |
| `formatCurrency` local definido inline | remover definição, importar `formatBRL` |

Casos que **não** são troca direta (e ficam como estão):
- `toFixed(2)` em **inputs editáveis** (ex.: `setPrice(...toFixed(2))` em `ShareToDeliveryDialog`) — input numérico precisa de ponto decimal padrão JS.
- `toFixed(2)` em **cálculos internos**, strings de WhatsApp/PDF que já usam `formatCurrency` próprio, ou geração de chaves/IDs — manter.
- Recibos fiscais (`print-fiscal-receipt.ts`) e PDFs já usam o `formatCurrency` correto via import.

**4. Áreas cobertas pela varredura:**
- `src/pages/garcom/**` (todas as telas do garçom — onde o problema mais aparece)
- `src/components/pdv/**` (PDV, dialogs, comandas, caixa, recibos visuais)
- `src/components/delivery/**` (cards, dialog de pedido, fichas técnicas)
- `src/components/public-menu/**` (cardápio público, carrinho)
- `src/pages/pdv/**` (dashboards, financeiro, fornecedores, compras, estoque)
- `src/pages/delivery/**` (cardápio admin, pedidos)
- `src/pages/cozinha/**` (KDS)

### Detalhes técnicos

- **Valor zero**: `formatBRL(0)` → `"R$ 0,00"` (consistente).
- **Negativos**: `formatBRL(-50)` → `"-R$ 50,00"` (Intl coloca o `-` antes do `R$`, padrão BR).
- **Strings vindas do banco**: `numeric` do Postgres às vezes chega como string; o helper já faz `Number(x)`.
- **Performance**: `Intl.NumberFormat` é instanciado **uma única vez** no módulo (não a cada chamada).
- **Sem mudanças de dependência**: `Intl` é nativo do JS, não precisa instalar nada.
- **Espaços**: hoje vários trechos têm `R$ {x}` com espaço hardcoded. O `Intl.NumberFormat('pt-BR')` já inclui o espaço não-quebrável correto (`R$ 49,00`), então esse `R$ ` literal é removido junto.

### Validação

- Garçom — tela "Adicionar Item": `R$ 22,00`, `R$ 1.234,56` (não mais `R$ 22.00`).
- Garçom — barra "Enviar para Cozinha": total formatado como `R$ 77,00`.
- PDV — dialog de pagamento, recibos, ordens: já usam `formatCurrency`, continuam OK; agora consistente com o resto.
- Delivery — cards de pedido, carrinho público: valores no formato BR.
- Financeiro — DRE, fluxo de caixa, plano de contas: valores no formato BR.
- Cozinha (KDS): subtotais no formato BR.
- Compra/estoque/fornecedores: valores no formato BR.
- Inputs editáveis (preço de venda em `ShareToDeliveryDialog`): continuam usando ponto decimal (UX de input numérico).

