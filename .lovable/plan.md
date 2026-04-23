

## Mostrar lista de comandas ao clicar em mesa ocupada

### Causa

Em `src/pages/garcom/GarcomMesaDetalhe.tsx` (linhas 58-67), há um `useEffect` que faz redirect automático para `/garcom/comanda/:id` quando a mesa tem **exatamente 1** comanda aberta. Isso impede o garçom de ver a tela da mesa quando há só uma comanda — pulando direto para o detalhe dela.

Por isso a Mesa 04 (com a comanda "TESTE") leva direto à comanda, sem passar pela tela da mesa que lista todas as comandas + botão "Nova comanda".

### Mudança

Em `src/pages/garcom/GarcomMesaDetalhe.tsx`:

1. **Remover** o `useEffect` de auto-redirect (linhas 58-67) e a ref `justCreatedMultipleRef` (linhas 52, 63, 80, 109, 134, 142, 172) que só existia para suprimir esse mesmo redirect — vira código morto.
2. Em `handleConfirmOpen` (linhas 164-166), manter o redirect **somente quando o garçom acabou de criar**: se criou 1 comanda nova → vai para o detalhe dela; se criou 2+ → fica na tela da mesa. Esse comportamento já existe e segue intacto.
3. A tela da mesa passa a sempre renderizar a lista de comandas abertas (`tableComandas.map`), com o botão "Nova comanda" embaixo, exatamente como já faz hoje no caso de 2+ comandas. Cada card continua clicável e leva para a comanda específica.

Nenhuma outra tela é afetada. O botão de voltar (`ArrowLeft`) na comanda continua trazendo o garçom de volta à mesa, agora útil.

### Validação

- Mesa 04 (1 comanda "TESTE", `current_order_id` setado): clicar → abre tela "Mesa 04" listando o card "20260423-039 — TESTE" + botão "Nova comanda". Clicar no card → vai para a comanda. Voltar → retorna à mesa.
- Mesa com 2+ comandas: comportamento idêntico ao atual.
- Mesa livre: dialog "Abrir Mesa X" continua aparecendo automaticamente.
- Abertura de mesa nova com 1 nome: continua redirecionando direto para a comanda recém-criada (fluxo de criação preservado).
- Abertura com 2+ nomes: fica na tela da mesa com a lista, como hoje.

