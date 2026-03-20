

## Taxa de Serviço Sempre Ativa por Padrão

### Mudança

No `PaymentDialog.tsx`, linha 97, alterar o estado inicial de `serviceFeeEnabled` de `false` para `true`:

```typescript
const [serviceFeeEnabled, setServiceFeeEnabled] = useState(true);
```

### Arquivo

| Arquivo | Linha | Mudança |
|---------|-------|---------|
| `src/components/pdv/cashier/PaymentDialog.tsx` | 97 | `useState(false)` → `useState(true)` |

