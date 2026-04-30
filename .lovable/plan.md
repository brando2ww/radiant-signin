## Problema

Mesmo com a "Taxa de serviço" desativada nas configurações do PDV (`pdv_settings.enable_service_fee = false`), o `PaymentDialog` continua exibindo:
- O **switch** "Taxa de serviço (10%)" (sempre ligado por padrão).
- A **linha "Taxa de serviço"** no resumo de totais quando o operador deixa o switch ligado.
- Adiciona 10% ao **TOTAL** cobrado.

A configuração global está sendo ignorada — é controlada apenas por estado local `serviceFeeEnabled` que começa em `true`.

## Causa raiz

`src/components/pdv/cashier/PaymentDialog.tsx`:
- Linha 154: `const [serviceFeeEnabled, setServiceFeeEnabled] = useState(true);` — hardcoded, ignora `settings`.
- Linha 298: cálculo usa percentual fixo `0.1` em vez de `service_fee_percentage` das settings.
- Linhas 1371-1383: Switch sempre renderizado.
- Linhas 1400-1405 e 1228: linha "Taxa de serviço" e "Novo total" também usam `0.1` fixo.

`use-pdv-settings.ts` já expõe os campos certos:
```ts
enable_service_fee: boolean;
service_fee_percentage: number;
```

## Correção

### `src/components/pdv/cashier/PaymentDialog.tsx`

1. **Inicializar `serviceFeeEnabled` a partir das settings** (com efeito que reage a settings carregando após o mount):
   ```ts
   const serviceFeeAllowed = settings?.enable_service_fee ?? true;
   const serviceFeeRate = (settings?.service_fee_percentage ?? 10) / 100;
   const [serviceFeeEnabled, setServiceFeeEnabled] = useState(true);
   useEffect(() => {
     // Quando as settings carregarem, alinhar o estado local
     if (!serviceFeeAllowed) setServiceFeeEnabled(false);
   }, [serviceFeeAllowed]);
   ```

2. **Substituir o `0.1` fixo** pelo `serviceFeeRate`:
   - Linha 298: `const serviceFeeAmount = serviceFeeEnabled && serviceFeeAllowed ? (subtotal - discountAmount) * serviceFeeRate : 0;`
   - Linha 1228 (cálculo do "Novo total" no estágio de confirmação do desconto): trocar `* 0.1` por `* serviceFeeRate` e somar apenas se `serviceFeeEnabled && serviceFeeAllowed`.

3. **Ocultar o Switch** quando `!serviceFeeAllowed` (linhas 1371-1383): envolver o bloco em `{serviceFeeAllowed && (...)}` e atualizar o label para usar a porcentagem real (`Taxa de serviço ({settings?.service_fee_percentage ?? 10}%)`).

4. **A linha do total** (1400-1405) já usa `serviceFeeAmount > 0` como guarda, então some automaticamente quando desativado.

### Sem migração

Nenhuma alteração de schema — `pdv_settings.enable_service_fee` e `service_fee_percentage` já existem.

## Resultado esperado

- Configuração com `enable_service_fee = false` → switch some, taxa de serviço some do resumo, total não inclui 10%.
- Configuração com `enable_service_fee = true` e `service_fee_percentage = 12` → switch aparece com label "Taxa de serviço (12%)" e o cálculo usa 12% em vez de 10%.

## Arquivos editados

- `src/components/pdv/cashier/PaymentDialog.tsx`