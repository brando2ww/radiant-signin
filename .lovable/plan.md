

## Criar Página Dedicada para Criar/Editar Usuário (sem modal)

### Problema Atual
O formulário de criar/editar usuário está num modal (`UserDialog`). O usuário quer uma página dedicada. Também quer remover os ícones antes dos nomes das funções (roles) porque ficou feio.

### Solução

#### 1. Criar `src/pages/pdv/UserForm.tsx` (nova página)
- Página completa com o formulário de criar/editar usuário (mesmo conteúdo do modal, mas como página)
- Layout em duas colunas: dados pessoais à esquerda, seleção de role à direita
- Header com botão "Voltar" para `/pdv/usuarios`
- Campos: Nome, E-mail, Telefone, Senha, Confirmar Senha (senha só ao criar)
- Seleção de role **sem ícones** — apenas radio + nome + descrição
- Seção de permissões colapsável abaixo
- Botões "Cancelar" e "Criar Usuário" / "Salvar Alterações" no footer

#### 2. Modificar `src/pages/pdv/Users.tsx`
- Remover import e uso do `UserDialog`
- Botão "Convidar Usuário" agora navega para `/pdv/usuarios/novo`
- Botão editar no `UserCard` navega para `/pdv/usuarios/:id/editar`

#### 3. Modificar `src/pages/PDV.tsx`
- Alterar rota `usuarios` para `usuarios/*` (suportar sub-rotas)

#### 4. Criar roteamento dentro de `UserForm.tsx`
- `/pdv/usuarios/novo` → formulário de criação
- `/pdv/usuarios/:id/editar` → formulário de edição (carrega dados do usuário)

#### 5. Remover ícones dos roles
- Na seleção de roles da nova página, renderizar apenas o radio button + nome da função + descrição curta, sem o ícone colorido

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/UserForm.tsx` | Criar — página dedicada de formulário |
| `src/pages/pdv/Users.tsx` | Modificar — navegação em vez de modal |
| `src/pages/PDV.tsx` | Modificar — rota `usuarios/*` e importar UserForm |

