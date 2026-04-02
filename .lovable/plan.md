

## Painel Completo de Avaliações — Estrutura Standalone

### Visão geral

Transformar o `EvaluationsPanel` de uma simples wrapper do `Evaluations` em um painel completo com navegação própria, dashboard com KPIs consolidados, e seções dedicadas.

### Estrutura de navegação

```text
/avaliacoes              → Dashboard (KPIs globais de todas as campanhas)
/avaliacoes/campanhas    → Lista de campanhas (tela atual)
/avaliacoes/campanhas/:id → Detalhe da campanha (tela atual)
/avaliacoes/relatorios   → Relatórios consolidados (todas as campanhas)
/avaliacoes/configuracoes → Configurações do usuário (perfil/logout)
```

### Header do painel

Header fixo com Logo + navegação horizontal (links: Dashboard, Campanhas, Relatórios, Configurações) + PDVUserMenu. Similar ao PDV mas simplificado, sem menus dropdown — apenas links diretos.

### Novos arquivos

**1. `src/components/evaluations/EvaluationsNav.tsx`**
- Nav horizontal com links: Dashboard, Campanhas, Relatórios, Configurações
- Highlight do link ativo via `useLocation`
- Ícones: LayoutDashboard, Megaphone, BarChart3, Settings

**2. `src/pages/evaluations/EvaluationsDashboard.tsx`**
- Cards KPI consolidados (todas as campanhas do user):
  - Total de respostas (soma de todas as campanhas)
  - NPS médio global
  - Média geral de satisfação (1-5 estrelas)
  - Campanhas ativas vs total
- Gráfico de respostas por dia (últimos 30 dias, todas as campanhas)
- Top campanhas por volume de respostas
- Alertas: avaliações negativas recentes (NPS ≤ 6 nas últimas 24h)
- Reutiliza `useCustomerEvaluations` e `useEvaluationStats` já existentes

**3. `src/pages/evaluations/EvaluationsCampaigns.tsx`**
- Extração do conteúdo atual de `Evaluations.tsx` (lista de campanhas + detalhe)
- Mesmo comportamento: grid de cards, click abre detalhe com abas

**4. `src/pages/evaluations/EvaluationsReports.tsx`**
- Relatórios consolidados de todas as campanhas:
  - NPS Donut global
  - Evolução de satisfação ao longo do tempo
  - Distribuição por faixa etária (já existe em `useEvaluationStats`)
  - Satisfação por dia da semana
  - Exportar CSV (reutiliza `useExportEvaluations`)
- Filtros de período (date range picker)

**5. `src/pages/evaluations/EvaluationsSettings.tsx`**
- Configurações do perfil (editar nome, email)
- Tema (claro/escuro)
- Botão de logout

### Arquivos modificados

**6. `src/pages/EvaluationsPanel.tsx`**
- Trocar de renderizar `<Evaluations />` diretamente para um layout com `<EvaluationsNav />` no header e `<Routes>` interno com as 4 sub-rotas
- Rota index redireciona para `/avaliacoes/dashboard`

**7. `src/App.tsx`**
- A rota `/avaliacoes/*` já existe, nada muda

### Fluxo visual

```text
┌──────────────────────────────────────────────┐
│ [Logo]  Dashboard  Campanhas  Relatórios  ⚙  │  [Avatar ▾]
├──────────────────────────────────────────────┤
│                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ 127  │ │ +42  │ │ 4.3★ │ │ 3/5  │       │
│  │Resp. │ │ NPS  │ │Média │ │Ativas│       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│                                              │
│  [Gráfico: Respostas últimos 30 dias]       │
│                                              │
│  [Top Campanhas]    [Alertas Negativos]      │
└──────────────────────────────────────────────┘
```

### Dados reutilizados

- `useCustomerEvaluations()` — dados globais do user
- `useEvaluationStats()` — KPIs calculados (NPS, média, faixas etárias)
- `useEvaluationCampaigns()` — lista de campanhas com contagem
- `useExportEvaluations()` — exportação CSV
- Todos os componentes de campanha existentes (`CampaignDetail`, `CampaignCard`, etc.)

