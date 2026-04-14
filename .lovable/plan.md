

# Expandir Pagina de Configuracoes dos Checklists Operacionais

Reescrever `TaskSettings.tsx` como uma pagina longa organizada por 7 secoes com navegacao por ancora no topo, adicionando novos campos de configuracao ao banco de dados e criando componentes dedicados por secao.

## Mudancas no banco de dados

### Migration: Novas colunas em `operational_task_settings`

```sql
ALTER TABLE public.operational_task_settings
  ADD COLUMN IF NOT EXISTS alert_critical_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS alert_critical_delay_minutes int DEFAULT 15,
  ADD COLUMN IF NOT EXISTS alert_overdue_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS alert_overdue_delay_minutes int DEFAULT 10,
  ADD COLUMN IF NOT EXISTS alert_daily_summary_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alert_daily_summary_time text DEFAULT '22:00',
  ADD COLUMN IF NOT EXISTS alert_daily_summary_target text DEFAULT 'gestor',
  ADD COLUMN IF NOT EXISTS alert_temperature_enabled boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS alert_browser_notifications boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS alert_whatsapp_number text,
  ADD COLUMN IF NOT EXISTS report_daily_content jsonb DEFAULT '["taxa_conclusao","atrasadas","destaque","criticos","turnos"]'::jsonb,
  ADD COLUMN IF NOT EXISTS report_weekly_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS report_weekly_day int DEFAULT 1,
  ADD COLUMN IF NOT EXISTS allow_late_completion boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS require_photo_default boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS default_max_duration_minutes int DEFAULT 60,
  ADD COLUMN IF NOT EXISTS allow_free_notes boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS show_countdown_timer boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS block_early_execution boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS min_pin_digits int DEFAULT 4,
  ADD COLUMN IF NOT EXISTS session_timeout_minutes int DEFAULT 30;
```

Esses campos cobrem todas as 7 secoes. Turnos ja usam JSONB (campo `shifts`) — sera expandido para incluir `color` e `activeDays` por turno. Setores serao gerenciados via tabela separada ou enum existente `checklist_sector`.

## Arquivos novos

### 1. `src/components/pdv/tasks/settings/SettingsNavAnchors.tsx`

Barra de navegacao fixa no topo com links-ancora para cada secao:
- Turnos, Setores, Alertas, Relatorios, Execucao, Acesso, Dados
- Scroll suave ao clicar

### 2. `src/components/pdv/tasks/settings/ShiftsSection.tsx`

Secao de turnos melhorada:
- Campos existentes (nome, inicio, fim)
- Novo: seletor de cor por turno (circulos coloridos)
- Novo: checkboxes de dias da semana ativos
- Validacao de sobreposicao de horarios com erro visual
- Botao adicionar/remover turno

### 3. `src/components/pdv/tasks/settings/SectorsSection.tsx`

Gerenciamento de setores:
- Lista dos setores do enum `checklist_sector` com nome, icone e cor editaveis
- Toggle ativo/inativo por setor
- Botao para adicionar setor personalizado
- Salva como JSONB em `operational_task_settings` (campo `sectors_config`)

### 4. `src/components/pdv/tasks/settings/AlertsSection.tsx`

Configuracoes de alertas:
- Toggle + delay para itens criticos nao concluidos
- Toggle + delay para checklist inteiro atrasado
- Resumo diario automatico: toggle + horario + destinatario (gestor/lideres/todos)
- Canal: toggle notificacao navegador + campo WhatsApp
- Toggle alerta temperatura fora da faixa

### 5. `src/components/pdv/tasks/settings/ReportsSection.tsx`

Relatorios automaticos:
- Relatorio diario WhatsApp (migrado da secao atual) com horario
- Checkboxes do conteudo do relatorio (taxa conclusao, atrasadas, destaque, criticos, turnos)
- Relatorio semanal: toggle + dia da semana
- Exportacao manual: botao com date range picker para PDF/CSV

### 6. `src/components/pdv/tasks/settings/ExecutionSection.tsx`

Comportamento de execucao:
- Geracao automatica (migrado)
- Permitir conclusao apos prazo: toggle
- Exigir foto por padrao: toggle
- Tempo maximo padrao (minutos): campo numerico
- Permitir observacoes livres: toggle
- Exibir cronometro regressivo: toggle

### 7. `src/components/pdv/tasks/settings/AccessSection.tsx`

Acesso e seguranca:
- QR Code publico (migrado) com preview do QR e botao copiar link
- Bloquear execucao fora do horario: toggle
- Minimo digitos PIN: campo numerico
- Timeout de sessao: campo numerico
- Link direto para pagina de Logs (`onNavigate("logs")`)

### 8. `src/components/pdv/tasks/settings/DataSection.tsx`

Dados e backup:
- Exportar todos os dados em JSON (checklists, agendamentos, execucoes, colaboradores)
- Exportar historico em CSV com seletor de periodo
- Limpar historico com mais de X dias (com confirmacao AlertDialog)
- Indicadores de uso: contagem de checklists, agendamentos, colaboradores, execucoes

## Arquivos editados

### 9. `src/components/pdv/tasks/TaskSettings.tsx`

Reescrita completa:
- Pagina longa com `SettingsNavAnchors` no topo
- Importa e renderiza as 7 secoes em sequencia com separadores
- Cada secao tem titulo em destaque + descricao em cinza
- Botao "Salvar Configuracoes" fixo no rodape (sticky bottom)
- Gerencia estado unificado de todas as configuracoes
- Chama `saveSettings` no submit

### 10. `src/hooks/use-operational-tasks.ts`

- Expandir `TaskSettings` interface com novos campos
- Expandir `ShiftConfig` com `color` e `activeDays`
- Atualizar `saveSettings` mutation para incluir novas colunas
- Atualizar query para ler novos campos

## Resumo tecnico

- **1 migration** (~20 colunas novas em `operational_task_settings`)
- **8 arquivos novos** (7 secoes + 1 navegacao)
- **2 arquivos editados** (TaskSettings, use-operational-tasks)
- **0 dependencias novas**

