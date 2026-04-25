## Fluxo de desconto explícito no PaymentDialog

### Objetivo

Substituir o atual campo de desconto (que aplica em tempo real conforme o operador digita) por um fluxo guiado em 4 passos, com confirmação obrigatória antes do desconto efetivamente reduzir o total. Eliminar o risco de aplicar desconto errado por engano.

### Onde

`src/components/pdv/cashier/PaymentDialog.tsx` — bloco "Desconto" (linhas ~953-1128). O resto do dialog (formas de pagamento, divisão, taxa de serviço, totais) permanece igual.

### Como funciona hoje (problema)

- Botões `%` e `R$` são ícones pequenos lado a lado, com `%` pré-selecionado
- O campo já está habilitado de cara
- Conforme o operador digita o valor, o desconto **já é aplicado** ao total exibido em tempo real
- Não existe etapa de "confirmar antes de aplicar"
- Motivo do desconto é sempre obrigatório (sem configuração)

### Como vai funcionar

Máquina de estados local com 4 fases:

```text
idle → typing → confirming → applied
 ↑                              │
 └──────── botão Remover ───────┘
```

**Fase `idle`** (sem tipo escolhido):
- Dois botões grandes lado a lado, mesma largura, com label completo:
  - `[ % Desconto em % ]`
  - `[ R$ Desconto em R$ ]`
- Nenhum pré-selecionado
- Campo de valor visível mas desabilitado (cinza), placeholder "Selecione o tipo primeiro"
- Botão "Aplicar desconto" oculto

**Fase `typing`** (tipo escolhido, digitando valor):
- Tipo escolhido fica destacado (variant solid); o outro fica outline pequeno
- Campo habilitado, sufixo `%` ou prefixo `R$` dentro do input conforme tipo
- Linha de feedback abaixo do campo, atualizada a cada keystroke:
  - Modo %: `**10% = R$ 15,40** será descontado do subtotal de R$ 154,00`
  - Modo R$: `**R$ 20,00 = 12,9%** será descontado do subtotal de R$ 154,00`
- Validação inline: se valor > subtotal, borda vermelha + mensagem "Desconto maior que o valor da conta" e botão "Aplicar desconto" desabilitado
- Botão **"Aplicar desconto"** (full width, secondary) abaixo da linha de feedback, separado do botão final de pagamento
- Trocar de tipo durante essa fase: limpa o campo + toast/inline warning "Tipo alterado — revise o valor"
- Total exibido no painel de totais ainda **NÃO** considera o desconto

**Fase `confirming`** (clicou Aplicar):
- Substitui inline o bloco do campo por uma mini-confirmação (não Modal Dialog — apenas um Card destacado dentro da seção):
  - Tipo: "Percentual" ou "Valor fixo"
  - Valor digitado: "10%" ou "R$ 20,00"
  - Será descontado: `R$ 15,40`
  - Novo total: `R$ 138,60`
  - Se a configuração de "Exigir motivo de desconto" estiver ativa: campo Motivo obrigatório aqui (e senha de autorização, mantendo o fluxo atual)
  - Dois botões: `[ Confirmar ]` (primary) e `[ Corrigir ]` (ghost — volta para `typing`)
- O total geral ainda **NÃO** considera o desconto até clicar Confirmar

**Fase `applied`**:
- Bloco do desconto vira um resumo fixo, em uma linha com fundo sutil (verde/amber):
  - `Desconto aplicado: -R$ 15,40 (10%)` + botão "Remover" pequeno (variant ghost) à direita
- Total no painel agora reflete o desconto
- Botão "Cobrar" / finalizar liberado para uso
- Clicar "Remover" → volta para `idle`, limpa todos os estados de desconto (tipo, valor, motivo, autorização)

### Configuração de motivo opcional

Hoje o motivo é sempre obrigatório. Vai virar configurável:

- Adicionar coluna `require_discount_reason boolean default false` em `pdv_settings` (migração)
- Expor em `usePDVSettings` (interface + UI de configurações em outra tela — fora do escopo desta task; só o flag e leitura aqui)
- No PaymentDialog, na fase `confirming`:
  - Se flag `true` → campo Motivo obrigatório (bloqueia Confirmar enquanto vazio)
  - Se flag `false` → campo Motivo não aparece
- Senha/autorização de desconto (já existente) **continua obrigatória sempre que houver desconto**, independente do flag de motivo. Movida da fase `typing` para a fase `confirming`.

### Detalhes técnicos

Estados novos no componente:
```ts
type DiscountStage = "idle" | "typing" | "confirming" | "applied";
const [discountStage, setDiscountStage] = useState<DiscountStage>("idle");
const [discountTypeChosen, setDiscountTypeChosen] = useState<DiscountType | null>(null);
// discountValue, discountReason, discountAuthorized, discountAuthorizedBy, discountPassword: já existem
const [appliedDiscount, setAppliedDiscount] = useState<{
  type: DiscountType;
  rawValue: string;
  amount: number;     // em R$
  percent: number;    // equivalente em %
  reason?: string;
  authorizedBy?: string;
} | null>(null);
```

Cálculo do `discountAmount` usado nos totais (linhas ~255-263) muda para depender de `appliedDiscount` em vez de `discountValue` direto:
```ts
const discountAmount = appliedDiscount?.amount ?? 0;
```
Assim, durante `typing`/`confirming` o total exibido fica intacto. Só recalcula em `applied`.

Variável de feedback inline (durante `typing`):
```ts
const previewAmount = discountTypeChosen === "percent"
  ? (subtotal * (parseFloat(discountValue) || 0)) / 100
  : parseFloat(discountValue) || 0;
const previewPercent = subtotal > 0 ? (previewAmount / subtotal) * 100 : 0;
const exceedsSubtotal = previewAmount > subtotal;
```

Reset ao fechar o dialog ou ao trocar de comanda: setar `discountStage="idle"`, `appliedDiscount=null`, limpar campos.

Submissão do pagamento (linhas ~497-499, 578, 621): trocar `hasDiscount`/`discountAmount`/`discountReason`/`discountAuthorizedBy` para ler de `appliedDiscount`. Se `appliedDiscount` é `null`, não envia desconto.

Bloqueio de submissão: além das validações atuais, `canSubmit` deve exigir que `discountStage` esteja em `idle` ou `applied` (nunca `typing`/`confirming`) — evita finalizar pagamento com desconto pendente de confirmação.

### Migração

Uma migração simples:
```sql
ALTER TABLE public.pdv_settings
  ADD COLUMN IF NOT EXISTS require_discount_reason boolean NOT NULL DEFAULT false;
```
Atualizar `PDVSettings` interface em `use-pdv-settings.ts` e regenerar `types.ts` (automático).

### Validação

- Abrir PaymentDialog: nenhum tipo selecionado, campo desabilitado, placeholder correto
- Escolher `%`: campo habilita, sufixo `%` aparece, digitar `10` mostra preview correto, total ainda intacto
- Trocar para `R$` no meio da digitação: campo limpa + aviso aparece
- Digitar valor > subtotal: borda vermelha, botão Aplicar bloqueado
- Clicar Aplicar com valor válido: aparece mini-confirmação com tipo/valor/desconto/novo total e (se senha) campo de senha, total ainda intacto
- Confirmar: total atualiza, bloco vira resumo "Desconto aplicado: -R$ X (Y%)"
- Clicar Remover: volta ao estado inicial, total restaura
- Com `require_discount_reason=true`: confirmação exige motivo
- Tentar finalizar pagamento estando em `typing`/`confirming`: botão Cobrar bloqueado
- Comportamento idêntico nos modos `Tudo`, `Várias formas` e `Por produto` (o subtotal usado no preview é o `subtotal` efetivo já calculado, que respeita o modo)
