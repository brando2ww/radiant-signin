

## Módulo Tarefas — Checklist Operacional com QR Code Público

### Conceito
Sistema de checklist diário por turnos para equipe de restaurante. O admin configura templates de tarefas com turnos e responsáveis. Cada dia, as tarefas são replicadas automaticamente. Um QR code público permite que qualquer funcionário marque tarefas como feitas (com foto opcional). O admin monitora tudo em tempo real.

### Estrutura de Turnos

```text
Abertura (06:00 - 11:00)    │  Tarde (11:00 - 17:00)    │  Fechamento (17:00 - 23:00)
─────────────────────────────┼────────────────────────────┼──────────────────────────────
☐ Ligar fogões               │ ☐ Repor estoque balcão     │ ☐ Desligar fogões
☐ Limpar bancadas             │ ☐ Limpar banheiros         │ ☐ Fechar caixa
☐ Verificar geladeiras        │ ☐ Conferir validades       │ ☐ Limpar cozinha
```

### Banco de Dados (3 tabelas)

**`operational_task_templates`** — Templates de tarefas recorrentes
- id, user_id (owner), title, description, shift (abertura/tarde/fechamento), assigned_to (text livre), requires_photo (boolean), sort_order, is_active, created_at

**`operational_task_instances`** — Instâncias diárias geradas dos templates
- id, template_id (FK), user_id (owner), task_date (date), title, description, shift, assigned_to, requires_photo, status (pending/done/skipped), completed_by (text livre), completed_at, photo_url, notes, created_at

**`operational_task_settings`** — Config por estabelecimento
- id, user_id (owner, unique), shifts (jsonb — nomes e horários dos turnos), auto_generate (boolean), qr_code_enabled (boolean), created_at

RLS: SELECT/INSERT público para instances (funcionários sem auth). UPDATE/DELETE pelo owner autenticado. Templates e settings apenas owner.

### Painel Admin (`/pdv/tarefas`)

```text
┌─────────────────────────────────────────────────────────────────┐
│  Tarefas Operacionais            [QR Code] [+ Nova Tarefa]      │
├─────────────────────────────────────────────────────────────────┤
│  Tabs: [Hoje] [Templates] [Histórico] [Configurações]           │
├─────────────────────────────────────────────────────────────────┤
│  ← 23/03/2026 →                        12/18 concluídas (67%)  │
├─────────────────────────────────────────────────────────────────┤
│  ABERTURA (06:00 - 11:00)                              4/6 ✓   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ ✅ Ligar fogões          João    08:15   [📷]            │   │
│  │ ✅ Limpar bancadas       Maria   08:30                   │   │
│  │ ☐  Verificar geladeiras  Carlos  —                       │   │
│  │ ☐  Repor descartáveis    —       —                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                 │
│  TARDE (11:00 - 17:00)                                 3/6 ✓   │
│  ...                                                            │
│                                                                 │
│  FECHAMENTO (17:00 - 23:00)                            5/6 ✓   │
│  ...                                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Página Pública (`/tarefas/:userId`)

```text
┌──────────────────────────────────┐
│  [Logo] Tarefas do Dia           │
│  23/03/2026                      │
├──────────────────────────────────┤
│  ABERTURA                        │
│  ┌────────────────────────────┐  │
│  │ ✅ Ligar fogões            │  │
│  │    Feito por: João 08:15   │  │
│  ├────────────────────────────┤  │
│  │ ☐ Verificar geladeiras     │  │
│  │    Resp: Carlos            │  │
│  │  Seu nome: [________]      │  │
│  │  Foto: [📷 Anexar]         │  │
│  │  [✓ Marcar como Feito]     │  │
│  └────────────────────────────┘  │
│  ...                             │
└──────────────────────────────────┘
```

Sem identificação obrigatória — ao marcar, digita o nome (opcional). Foto opcional/obrigatória conforme config do template.

### Geração Automática de Tarefas Diárias
- Edge function `generate-daily-tasks` agendada via `pg_cron` à meia-noite
- Copia todos os templates ativos para `operational_task_instances` com `task_date = CURRENT_DATE`
- Se as tarefas do dia já existem, não duplica

### Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `supabase migration` | Criar 3 tabelas + RLS |
| `src/hooks/use-operational-tasks.ts` | Hook admin: CRUD templates + buscar instâncias do dia + histórico |
| `src/hooks/use-public-tasks.ts` | Hook público: buscar tarefas do dia + marcar como feito |
| `src/pages/pdv/Tasks.tsx` | Página admin com tabs (Hoje, Templates, Histórico, Config) |
| `src/components/pdv/tasks/DailyTasksView.tsx` | Aba "Hoje" com tarefas agrupadas por turno |
| `src/components/pdv/tasks/TaskTemplatesManager.tsx` | Aba "Templates" com CRUD |
| `src/components/pdv/tasks/TaskTemplateDialog.tsx` | Dialog criar/editar template |
| `src/components/pdv/tasks/TaskHistory.tsx` | Aba "Histórico" — consulta por data |
| `src/components/pdv/tasks/TaskSettings.tsx` | Aba "Config" — turnos, QR code |
| `src/components/pdv/tasks/TaskQRCodeDialog.tsx` | Dialog com QR code público |
| `src/pages/PublicTasks.tsx` | Página pública das tarefas |
| `supabase/functions/generate-daily-tasks/index.ts` | Edge function gerar tarefas diárias |
| `src/pages/PDV.tsx` | Adicionar rota `/pdv/tarefas` |
| `src/components/pdv/PDVHeaderNav.tsx` | Adicionar "Tarefas" no menu Administrador |
| `src/App.tsx` | Adicionar rota pública `/tarefas/:userId` |
| `src/integrations/supabase/types.ts` | Atualizar tipos |

### Fluxos

**Admin configura:**
1. Cria templates por turno (nome, descrição, responsável, foto obrigatória)
2. Gera QR code → imprime e coloca na cozinha
3. Monitora em tempo real na aba "Hoje"
4. Consulta histórico por data para auditorias

**Funcionário usa:**
1. Escaneia QR code → abre página pública
2. Vê tarefas do dia agrupadas por turno
3. Clica na tarefa → digita nome (opcional) → anexa foto (se necessário) → marca como feito
4. Tarefa atualiza em tempo real no painel admin

