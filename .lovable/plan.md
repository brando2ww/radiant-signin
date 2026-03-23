

## Relatório de Tarefas via WhatsApp

### Conceito
Adicionar na tela de Tarefas Operacionais:
1. **Botão "Enviar Relatório WhatsApp"** na aba "Hoje" para envio manual do resumo do dia
2. **Configurações** na aba Configurações: número de telefone destino, horário de envio automático, toggle ativar/desativar
3. **Edge function** `send-tasks-report` que monta a mensagem de resumo e envia via Evolution API usando a instância WhatsApp conectada do usuário
4. **Cron job** que dispara a edge function no horário configurado por cada tenant

### Mudanças

| Arquivo | Ação |
|---------|------|
| Migration SQL | Adicionar colunas `whatsapp_report_enabled`, `whatsapp_report_phone`, `whatsapp_report_time` em `operational_task_settings` |
| `src/hooks/use-operational-tasks.ts` | Adicionar campos na interface `TaskSettings` + mutation `sendWhatsAppReport` |
| `src/components/pdv/tasks/TaskSettings.tsx` | Adicionar seção "Relatório WhatsApp" com toggle, campo telefone e horário |
| `src/pages/pdv/Tasks.tsx` | Adicionar botão "Enviar Relatório" no header |
| `supabase/functions/send-tasks-report/index.ts` | Nova edge function que monta resumo e envia via Evolution API |

### DB — Colunas novas em `operational_task_settings`

```sql
whatsapp_report_enabled BOOLEAN DEFAULT false
whatsapp_report_phone TEXT         -- número destino (ex: 5511999998888)
whatsapp_report_time TEXT DEFAULT '23:00'  -- horário do envio automático
```

### Edge Function — `send-tasks-report`

Recebe `{ user_id, date? }` (date default = hoje):
1. Busca instância WhatsApp conectada (`whatsapp_connections` com `connection_status = 'open'`)
2. Busca settings de tarefas (`whatsapp_report_phone`)
3. Busca todas as `operational_task_instances` do dia, agrupadas por turno
4. Monta mensagem formatada:

```text
📋 *Relatório de Tarefas — 23/03/2026*

✅ Concluídas: 8/12 (67%)

*🌅 Abertura (06:00-11:00)*
✅ Limpar balcão — João 08:15
✅ Verificar estoque — Maria 09:30
❌ Organizar salão

*☀️ Tarde (11:00-17:00)*
✅ Repor insumos — Pedro 13:00
❌ Conferir validades

*🌙 Fechamento (17:00-23:00)*
✅ Fechar caixa — Ana 22:45
❌ Limpeza geral
❌ Verificar equipamentos

📊 Pendentes: 4 tarefas não concluídas
```

5. Envia via Evolution API (`POST /message/sendText/{instanceName}`) para o número configurado
6. Também pode ser chamada via cron para envio automático — busca todos os usuários com `whatsapp_report_enabled = true` e `whatsapp_report_time` compatível com a hora atual

### UI — Seção no TaskSettings

```text
── RELATÓRIO WHATSAPP ──
Enviar relatório diário via WhatsApp    [OFF]
Número destino: [+55 (__) _____-____]
Horário de envio: [23:00]
```

### UI — Botão no header (Tasks.tsx)

Ao lado do "Gerar Tarefas do Dia", botão "📤 Enviar Relatório" que chama a edge function manualmente. Desabilitado se WhatsApp não estiver conectado.

### Fluxo
1. Admin configura número e horário nas Configurações de Tarefas
2. No final do dia, pode clicar "Enviar Relatório" manualmente
3. Ou o cron dispara automaticamente no horário configurado
4. A mensagem chega no WhatsApp do gestor com o resumo completo

