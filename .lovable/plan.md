
## Adicionar botão "Sair da conta" no aviso de módulo indisponível

### O que vou ajustar
Atualizar o componente `ModuleGuard` para que, além do botão **Voltar**, ele mostre um botão **Sair da conta** dentro do card de aviso.

### Arquivo
| Arquivo | Ação |
|---|---|
| `src/components/ModuleGuard.tsx` | Importar `useAuth` e adicionar ação de logout no estado de bloqueio do módulo |

### Implementação
1. Usar `signOut()` do `AuthContext` no `ModuleGuard`
2. Adicionar um segundo botão no rodapé do card:
   - **Voltar** mantém o comportamento atual
   - **Sair da conta** faz logout do usuário
3. Após deslogar, redirecionar para a tela inicial `/` para evitar que o usuário continue preso na tela bloqueada
4. Desabilitar o botão enquanto o logout estiver acontecendo, se necessário, para evitar clique duplo

### Resultado esperado
Quando aparecer a mensagem **"Módulo não disponível"**, o usuário terá duas opções:
- voltar para a tela anterior
- sair da conta e entrar com outro usuário

### Detalhe técnico
A mudança é pequena e isolada, sem mexer em rotas, banco ou permissões. O ajuste fica só na UI do fallback do `ModuleGuard`, reaproveitando a autenticação já existente no projeto.
