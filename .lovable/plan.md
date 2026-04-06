

## Correções no EvaluationsSubNav

### Problemas identificados

1. **Rotas relativas erradas**: `navigate("relatorios/diario")` resolve relativamente à URL atual, não ao `/pdv/avaliacoes`. Se o usuário está em `/pdv/avaliacoes/campanhas`, navega para `/pdv/avaliacoes/campanhas/relatorios/diario` (inexistente).

2. **Dropdown só abre na seta**: O botão principal do dropdown navega diretamente para o primeiro filho. O comportamento esperado é que clicar em qualquer parte do botão (texto ou seta) abra o dropdown com as sub-opções.

### Solução

**Arquivo**: `src/components/pdv/evaluations/EvaluationsSubNav.tsx`

- Trocar todas as chamadas `navigate(item.to)` e `navigate(child.to)` para usar caminhos absolutos: `navigate(\`${basePath}/${to}\`)` (ou `navigate(basePath)` quando `to` é vazio).
- Unificar o botão do dropdown: remover o botão separado de navegação + botão da seta. Usar um único `DropdownMenuTrigger` que engloba ícone + label + chevron. Clicar em qualquer lugar abre o dropdown, e as opções internas navegam para a sub-rota.

### Resultado esperado
- Clicar em "Relatórios" abre dropdown com Diário/Semanal/Mensal
- Clicar em "Diário" navega para `/pdv/avaliacoes/relatorios/diario`
- Mesmo comportamento para Clientes e Cupons

