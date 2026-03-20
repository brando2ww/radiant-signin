

## Implementar Controle de Acesso por Role (Papel)

### Problema
Todos os usuários veem todos os menus e podem acessar todas as rotas, independente do role. Um garçom não deveria ver Financeiro, Configurações, etc.

### Solução

Criar um hook que detecta o role do usuário logado, filtrar a navegação e proteger as rotas.

### Mapeamento de Rotas por Role

| Role | Rotas Permitidas |
|------|-----------------|
| **proprietario** | Tudo |
| **gerente** | Tudo exceto `/pdv/usuarios` |
| **caixa** | `/pdv/caixa`, `/pdv/balcao` |
| **garcom** | `/pdv/salao`, `/pdv/comandas`, `/pdv/cozinha` |
| **cozinheiro** | `/pdv/cozinha` |
| **estoquista** | `/pdv/estoque`, `/pdv/fornecedores`, `/pdv/notas-fiscais`, `/pdv/compras/*` |
| **financeiro** | `/pdv/financeiro/*`, `/pdv/relatorios` |
| **atendente_delivery** | `/pdv/delivery/pedidos`, `/pdv/delivery/cardapio`, `/pdv/delivery/cupons` |

### Mapeamento de Seções do Menu por Role

| Role | Seções Visíveis |
|------|----------------|
| **proprietario** | Todas (5 seções) |
| **gerente** | Todas, mas sem item "Usuários" |
| **caixa** | Frente de Caixa (só Caixa e Balcão) |
| **garcom** | Frente de Caixa (só Salão e Cozinha) |
| **cozinheiro** | Frente de Caixa (só Cozinha) |
| **estoquista** | Administrador (Estoque, Fornecedores, NFs, Compras) |
| **financeiro** | Financeiro (completo) + Administrador (Relatórios) |
| **atendente_delivery** | Delivery (Pedidos, Cardápio, Cupons) |

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/hooks/use-user-role.ts` | **Criar** — Hook que consulta `establishment_users` para o `user.id` logado. Se não encontrar, assume `proprietario` (é o dono). Retorna `{ role, isLoading }` |
| `src/components/pdv/PDVHeaderNav.tsx` | **Modificar** — Filtrar `sectionItems` e seus `items` com base no role do usuário logado |
| `src/pages/PDV.tsx` | **Modificar** — Adicionar componente `RoleRoute` que redireciona para a rota padrão do role quando o usuário tenta acessar algo não permitido. Rota index redireciona para a primeira rota permitida do role |

### Hook `use-user-role.ts`

- Consulta `establishment_users` onde `user_id = auth.uid()` e `is_active = true`
- Se encontrar registro, retorna o `role` do registro
- Se não encontrar (é o proprietário/dono), retorna `'proprietario'`
- Exporta também `allowedRoutes` e `allowedSections` pré-computados com base no role

### Lógica de Filtragem no Header

Definir um objeto `roleRouteAccess` que mapeia cada role para as URLs permitidas. Filtrar tanto as seções quanto os itens dentro de cada seção. Seções que ficam vazias após filtragem são ocultadas.

### Proteção de Rotas

Criar componente `RoleRoute` que envolve cada `Route` e verifica se o role tem acesso. Se não tiver, redireciona para a rota padrão do role (ex: garçom → `/pdv/salao`, caixa → `/pdv/caixa`).

