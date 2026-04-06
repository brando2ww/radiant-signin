

## Segunda Header para Avaliações dentro do PDV

### Conceito
Ao acessar `/pdv/avaliacoes/*`, uma segunda barra de navegação aparece abaixo da header principal do PDV, com links para as subseções do sistema de avaliações (Dashboard, Campanhas, Relatórios, Clientes, Cupons, Configurações). O restante do PDV continua sem essa segunda header.

### Mudanças

**1. Transformar `/pdv/avaliacoes` em subrotas (`src/pages/PDV.tsx`)**
- Mudar a rota de `avaliacoes` para `avaliacoes/*` para aceitar subrotas
- Apontar para um novo componente `EvaluationsLayout` em vez de `Evaluations`

**2. Criar `src/components/pdv/evaluations/EvaluationsSubNav.tsx`**
- Segunda header sticky abaixo da principal, com borda inferior e fundo semitransparente
- Links horizontais: Dashboard, Campanhas, Relatórios, Clientes, Cupons, Configurações
- Cada link usa `NavLink` com estilo ativo (similar ao `EvaluationsNav` existente)
- Responsivo: ícones sempre visíveis, labels escondidos em telas pequenas

**3. Criar `src/pages/pdv/EvaluationsLayout.tsx`**
- Renderiza o `EvaluationsSubNav` como segunda header
- Abaixo, um `<Routes>` com subrotas:
  - `/` → Dashboard (reutiliza `EvaluationsDashboard` existente)
  - `/campanhas` → Lista de campanhas (reutiliza página existente)
  - `/campanhas/:id` → Detalhe da campanha
  - `/relatorios` → Relatórios (reutiliza `EvaluationsReports`)
  - `/clientes` → Placeholder (página futura)
  - `/cupons` → Placeholder (página futura)
  - `/configuracoes` → Configurações (reutiliza `EvaluationsSettings`)

**4. Ajustar páginas existentes**
- `EvaluationsCampaigns` e `Evaluations` serão unificadas numa única página de campanhas dentro do layout
- Detalhe da campanha vira subrota `/pdv/avaliacoes/campanhas/:id` em vez de estado interno

### Resultado visual

```text
┌─────────────────────────────────────────────────┐
│ [Logo]  Frente ▾  Delivery ▾  Admin ▾  ...      │  ← Header principal PDV
├─────────────────────────────────────────────────┤
│ Dashboard  Campanhas  Relatórios  Clientes  ... │  ← Segunda header (só em /avaliacoes)
├─────────────────────────────────────────────────┤
│                                                 │
│              Conteúdo da subpágina               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Arquivos criados/editados
- **Criar**: `src/pages/pdv/EvaluationsLayout.tsx`
- **Criar**: `src/components/pdv/evaluations/EvaluationsSubNav.tsx`
- **Criar**: `src/pages/pdv/evaluations/EvalClientes.tsx` (placeholder)
- **Criar**: `src/pages/pdv/evaluations/EvalCupons.tsx` (placeholder)
- **Editar**: `src/pages/PDV.tsx` — rota `avaliacoes/*` → `EvaluationsLayout`
- **Reutilizar**: `EvaluationsDashboard`, `EvaluationsReports`, `EvaluationsSettings`, `EvaluationsCampaigns`

