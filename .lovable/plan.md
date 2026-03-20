

## Adicionar Nome do Cliente e Mesa ao Criar Comanda

### Problema
Ao escolher "Comanda Avulsa" no sheet, a comanda é criada direto sem pedir dados. Precisa solicitar nome do cliente e mesa.

### Solução
Usar o `ComandaDialog` já existente (que tem campos de nome, observações, etc.) no fluxo do Garçom. Quando clicar em "Comanda Avulsa", fechar o sheet e abrir o `ComandaDialog`. Após preencher, criar a comanda e navegar para o detalhe.

Também adicionar campo de **número da mesa** ao `ComandaDialog` para comandas avulsas (quando não vem de uma mesa específica).

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/pdv/ComandaDialog.tsx` | Adicionar campo opcional "Mesa" (número da mesa) quando não há `tableNumber` pré-definido |
| `src/pages/Garcom.tsx` | Ao escolher "Comanda Avulsa": fechar sheet → abrir `ComandaDialog` → criar comanda com dados → navegar |

