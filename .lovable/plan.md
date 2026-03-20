

## Fix: Super Admin Redirecionado ao PDV em Vez do /admin

### Causa Raiz

No `handleSignIn` (Index.tsx, linha 72), após login bem-sucedido, o código faz `navigate('/pdv/dashboard')` **hardcoded**, sem verificar se o usuário é super admin. O `useEffect` de redirecionamento (linhas 43-51) deveria corrigir, mas o `navigate` do handleSignIn executa primeiro e o ProtectedRoute do `/pdv/*` aceita o super admin normalmente.

### Solução

1. **`src/pages/Index.tsx`** — No `handleSignIn`, após login bem-sucedido, **não navegar imediatamente**. Apenas fazer o toast de sucesso. O `useEffect` já existente (linhas 43-51) cuidará do redirecionamento correto baseado em `isSuperAdmin`.

2. **`src/components/ProtectedRoute.tsx`** — Verificar se o usuário é super admin e redirecionar para `/admin` se tentar acessar `/pdv/*`. Isso garante que mesmo acessando `/pdv/dashboard` diretamente pela URL, o super admin seja redirecionado.

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/Index.tsx` | Remover `navigate('/pdv/dashboard')` do `handleSignIn` — deixar o `useEffect` redirecionar |
| `src/components/ProtectedRoute.tsx` | Adicionar check de super admin → redirecionar para `/admin` |

