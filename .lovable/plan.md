

## Bloquear Abertura de Mesa/Comanda sem Caixa Aberto

### Problema
Atualmente é possível criar pedidos (abrir mesas) e comandas no Salão sem que o caixa esteja aberto, o que gera inconsistências financeiras.

### Solução

Importar `usePDVCashier` no `Salon.tsx` e verificar se há sessão ativa antes de permitir:
1. Criar pedido para mesa (`handleCreateOrder`, linha 308)
2. Criar comanda standalone ou de mesa (`handleCreateComanda`, linha 436)

Se o caixa estiver fechado, exibir `toast.error("Abra o caixa antes de iniciar um atendimento")` e bloquear a ação.

### Arquivo a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/pdv/Salon.tsx` | Importar `usePDVCashier`, obter `activeSession`. Adicionar guard no início de `handleCreateOrder` e `handleCreateComanda`: se `!activeSession`, exibir toast de erro e retornar sem executar. |

### Implementação

```typescript
// No início do componente
const { activeSession } = usePDVCashier();

// Em handleCreateOrder (linha 308)
const handleCreateOrder = (tableId: string) => {
  if (!activeSession) {
    toast.error("Abra o caixa antes de iniciar um atendimento");
    return;
  }
  // ... código existente
};

// Em handleCreateComanda (linha 436)
const handleCreateComanda = async (data: {...}) => {
  if (!activeSession) {
    toast.error("Abra o caixa antes de iniciar um atendimento");
    return;
  }
  // ... código existente
};
```

