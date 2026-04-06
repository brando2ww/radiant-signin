

## Corrigir Sub-Nav grudada na header principal

### Problema
A `EvaluationsSubNav` está dentro do `<main className="flex-1 overflow-auto">`, o que causa um espaço entre a header principal e a sub-nav. O `sticky top-14` não funciona corretamente porque o container de scroll é o `<main>`, não a janela.

### Solução
Mover a `EvaluationsSubNav` para fora do `<main>` no `PDV.tsx`, renderizando-a condicionalmente quando a rota é `/pdv/avaliacoes/*`. Assim ela fica colada diretamente abaixo da header principal, ambas fixas no topo.

### Mudanças

**1. `src/pages/PDV.tsx`**
- Importar `useLocation` e `EvaluationsSubNav`
- Detectar se a rota atual começa com `/pdv/avaliacoes`
- Renderizar `<EvaluationsSubNav />` entre o `</header>` e o `<main>`, condicionalmente
- A sub-nav fica sticky com `top-14` (logo abaixo da header de 56px)

**2. `src/pages/pdv/EvaluationsLayout.tsx`**
- Remover o `<EvaluationsSubNav />` de dentro do layout (já está no nível superior)
- Manter apenas o `<Suspense>` + `<Routes>` com as subrotas

**3. `src/components/pdv/evaluations/EvaluationsSubNav.tsx`**
- Remover `sticky top-14` pois a posição será controlada pelo container pai no PDV.tsx
- Manter apenas `border-b` e o fundo com backdrop-blur

