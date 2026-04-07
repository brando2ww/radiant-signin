

## Cards de NPS clicáveis com lista filtrada

### O que muda
Ao clicar nos cards de Promotores, Neutros ou Detratores no Dashboard, o sistema irá abrir um Dialog/Modal com a lista dos clientes daquela categoria, permitindo visualização rápida sem sair da página.

### Implementação

**1. `DashboardKPICards.tsx`** — Tornar os 3 cards clicáveis
- Adicionar prop `onNpsClick?: (category: "promoters" | "neutrals" | "detractors") => void`
- Aplicar `cursor-pointer hover:shadow-md transition` nos cards de NPS
- Chamar `onNpsClick` ao clicar em cada card

**2. `EvaluationsDashboard.tsx`** — Gerenciar estado do dialog
- Adicionar estado `npsFilter: "promoters" | "neutrals" | "detractors" | null`
- Filtrar `evaluations` por `nps_score` conforme a categoria clicada:
  - Promotores: `nps_score >= 9`
  - Neutros: `nps_score >= 7 && nps_score <= 8`
  - Detratores: `nps_score <= 6`
- Passar `onNpsClick` para `DashboardKPICards`
- Renderizar novo componente `NPSDetailDialog`

**3. Novo componente `NPSDetailDialog.tsx`** (`src/components/evaluations/dashboard/`)
- Dialog com título dinâmico ("Promotores" / "Neutros" / "Detratores")
- Tabela com colunas: Nome, WhatsApp, NPS, Comentário, Data
- Link para WhatsApp no telefone
- Busca por nome/telefone
- Exibir `nps_comment` quando disponível (especialmente para detratores/neutros)

### Arquivos alterados
1. `src/components/evaluations/dashboard/DashboardKPICards.tsx` — adicionar prop `onNpsClick` e cursor pointer
2. `src/pages/evaluations/EvaluationsDashboard.tsx` — estado do filtro + renderizar dialog
3. **Novo**: `src/components/evaluations/dashboard/NPSDetailDialog.tsx` — dialog com lista filtrada

