

## Painel Standalone de Avaliações

### Problema
O módulo de Avaliações está dentro do `/pdv/*`, que exige `ModuleGuard module="pdv"`. Se o tenant só tem `avaliacoes` ativo (sem `pdv`), o usuário vê "Módulo não disponível".

### Solução
Criar uma rota `/avaliacoes/*` independente com seu próprio layout (header simplificado + logo + user menu), protegida por `ModuleGuard module="avaliacoes"`. O login redireciona para `/avaliacoes` quando o tenant só tem esse módulo.

### Arquivos

**1. `src/pages/EvaluationsPanel.tsx`** (novo)
- Layout standalone: header com Logo + título "Avaliações" + PDVUserMenu
- Reutiliza o componente `Evaluations` (`src/pages/pdv/Evaluations.tsx`) já existente como conteúdo
- Envolvido em `ModuleGuard module="avaliacoes"`

**2. `src/App.tsx`** (modificado)
- Adicionar rota `/avaliacoes/*` com `ProtectedRoute` + `EvaluationsPanel`

**3. `src/pages/Index.tsx`** (modificado)
- No redirect pós-login, verificar: se user não é super admin e tem módulo `avaliacoes` mas não tem `pdv`, redirecionar para `/avaliacoes` em vez de `defaultRoute`

**4. `src/hooks/use-user-modules.ts`** (modificado)
- Exportar helper `getDefaultModuleRoute()` que retorna `/avaliacoes` se só tem avaliacoes, `/pdv/dashboard` se tem pdv, etc.

**5. `src/components/ProtectedRoute.tsx`** (modificado)
- Permitir acesso a `/avaliacoes` sem exigir módulo pdv (já é controlado pelo ModuleGuard dentro do EvaluationsPanel)

### Fluxo

```text
Login → useUserModules().getDefaultModuleRoute()
  ├─ tem pdv → /pdv/dashboard (comportamento atual)
  ├─ só avaliacoes → /avaliacoes (NOVO)
  └─ super admin → /admin
```

O painel standalone terá visual limpo: apenas logo, título e menu do usuário no header, sem a nav completa do PDV.

