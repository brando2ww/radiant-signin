

## "Reimprimir Último Caixa" mostra o penúltimo

### Causa-raiz

`closeCashier.onSuccess` em `src/hooks/use-pdv-cashier.ts` (linhas 145–149) invalida apenas `pdv-cashier-active` e `pdv-cashier-movements`, mas **não invalida** as queries `pdv-cashier-last-closed` e `pdv-cashier-last-closed-movements`.

Resultado: ao fechar o caixa atual, o React Query continua servindo do cache a "última sessão fechada" anterior. Por isso o botão "Reimprimir Último Caixa" imprime o penúltimo (no seu caso, o de R$ 577 / sessão `7b3ea139`) em vez do que acabou de ser fechado (R$ 800 / sessão `0f9afb94`).

A query SQL em si está correta (`order by closed_at desc limit 1`) — confirmei no banco que ela retorna a sessão certa quando re-executada. O bug é puramente de invalidação de cache.

### Correção

`src/hooks/use-pdv-cashier.ts`, no `onSuccess` da mutation `closeCashier`:

```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["pdv-cashier-active"] });
  queryClient.invalidateQueries({ queryKey: ["pdv-cashier-movements"] });
  queryClient.invalidateQueries({ queryKey: ["pdv-cashier-last-closed"] });
  queryClient.invalidateQueries({ queryKey: ["pdv-cashier-last-closed-movements"] });
  toast.success("Caixa fechado com sucesso!");
},
```

### Validação

- Abrir caixa, fazer movimentos, fechar com saldo X.
- Abrir novamente, fechar com saldo Y.
- Clicar "Reimprimir Último Caixa": demonstrativo deve mostrar saldo Y (o mais recente), não X.
- Histórico/extrato em outras telas continua intacto (a invalidação só refaz o fetch).

