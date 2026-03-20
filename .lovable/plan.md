

## Página de Usuários com Sistema de Roles (Papéis)

### Levantamento de Funcionalidades por Área

Com base em todas as rotas e módulos do sistema:

| Área | Funcionalidades |
|------|----------------|
| **Frente de Caixa** | Salão (mesas, pedidos), Balcão, Caixa (abrir/fechar, sangria, reforço), Cozinha, Comandas |
| **Delivery** | Pedidos, Cardápio, Personalização, Cupons, Configurações, Relatórios |
| **Administrador** | Dashboard, Produtos, Estoque, Fornecedores, Cotações, Pedidos de Compra, Lista de Compras, Notas Fiscais, Relatórios, Configurações |
| **Financeiro** | Lançamentos, Contas a Pagar/Receber, Fluxo de Caixa, Plano de Contas, Centros de Custo, DRE, CMV |
| **Integrações** | iFood, PagSeguro, Stone, Getnet, NF-e, Goomer |

### Roles Propostos

| Role | Acesso | Descrição |
|------|--------|-----------|
| **proprietario** | Tudo | Dono do estabelecimento. Acesso total, gerencia usuários e configurações |
| **gerente** | Tudo exceto gerenciar usuários/roles | Gerencia operação, financeiro, relatórios, estoque, fornecedores |
| **caixa** | Caixa (abrir/fechar, sangria, reforço), visualizar pedidos | Opera o caixa, recebe pagamentos, faz fechamento |
| **garcom** | Salão (mesas, comandas, pedidos), Cozinha (visualizar) | Atende mesas, cria comandas, envia pedidos à cozinha |
| **cozinheiro** | Cozinha (receber/atualizar pedidos) | Visualiza e gerencia fila de preparo |
| **estoquista** | Estoque, Fornecedores, Notas Fiscais, Compras | Controla estoque, recebe mercadorias, lança NFs |
| **financeiro** | Financeiro completo, Relatórios | Gerencia contas, lançamentos, DRE, CMV |
| **atendente_delivery** | Delivery (pedidos, status) | Gerencia pedidos de delivery, atualiza status |

### Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/pdv/Users.tsx` | Página principal: listagem de usuários com role, status, ações (convidar, editar, desativar) |
| `src/hooks/use-pdv-users.ts` | Hook para CRUD de usuários e roles via Supabase |
| `src/components/pdv/users/UserDialog.tsx` | Dialog para convidar/editar usuário: nome, email, telefone, seleção de role, foto |
| `src/components/pdv/users/UserCard.tsx` | Card de usuário na listagem: avatar, nome, role badge, status, ações |
| `src/components/pdv/users/RolePermissionsView.tsx` | Componente que mostra as permissões de cada role (usado no dialog para visualizar o que o role permite) |

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/pdv/PDVHeaderNav.tsx` | Adicionar item "Usuários" na seção Administrador com ícone `Users` |
| `src/pages/PDV.tsx` | Adicionar rota `usuarios` apontando para `Users.tsx` |

### Migração Supabase

Criar tabela `user_roles` seguindo o padrão de segurança (separada de profiles):

```sql
CREATE TYPE public.app_role AS ENUM (
  'proprietario', 'gerente', 'caixa', 'garcom', 
  'cozinheiro', 'estoquista', 'financeiro', 'atendente_delivery'
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;
```

Também criar tabela `establishment_users` para vincular usuários ao estabelecimento:

```sql
CREATE TABLE public.establishment_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_owner_id UUID REFERENCES auth.users(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'garcom',
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (establishment_owner_id, user_id)
);
```

### UI da Página de Usuários

- Header com título "Usuários" e botão "Convidar Usuário"
- Filtros: por role, por status (ativo/inativo)
- Grid/lista de cards com: avatar, nome, email, badge do role, status, botões editar/desativar
- Dialog de convite: campos de email, seleção de role com descrição das permissões
- Visualização de permissões: ao selecionar um role, mostra lista de módulos/ações permitidos

