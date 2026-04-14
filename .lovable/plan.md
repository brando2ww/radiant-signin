

# Módulo de Checklists Operacionais -- Plano de Implementação

O sistema atual de "Tarefas Operacionais" é muito simples (título + turno + foto). O pedido requer uma reescrita completa com ~15 tabelas novas, acesso por PIN, tipos de item ricos, scoring, alertas, galeria de evidências, etc. Devido ao tamanho, divido em **5 fases** para implementar incrementalmente.

---

## FASE 1 -- Banco de dados e estrutura core

Migration SQL criando todas as tabelas necessárias:

**Tabelas principais:**
- `checklist_operators` -- colaboradores com nome, cargo, setor, PIN (4 dígitos), nível de acesso (operador/líder/gestor), establishment_owner_id
- `checklists` -- nome, setor (enum: cozinha/salão/caixa/bar/estoque/gerência), descrição, is_template, user_id
- `checklist_items` -- checklist_id, título, tipo (enum: checkbox/number/text/photo/temperature/stars), is_critical, is_required, requires_photo, sort_order, min_value, max_value, training_instruction, training_video_url
- `checklist_schedules` -- checklist_id, dias da semana (jsonb), turno, hora início, prazo máximo (minutos), assigned_operator_id, assigned_sector
- `checklist_executions` -- checklist_id, schedule_id, operator_id, status (pendente/em_andamento/concluído/atrasado/não_iniciado), started_at, completed_at, score
- `checklist_execution_items` -- execution_id, item_id, value (jsonb), photo_url, is_compliant, completed_at
- `checklist_alerts` -- execution_id, item_id, type (prazo_expirado/temperatura_fora/item_critico), message, acknowledged_by, acknowledged_at
- `operator_scores` -- operator_id, period_start, period_end, score, badges (jsonb)
- `product_expiry_tracking` -- product_name, batch_id, expiry_date, registered_by, status (válido/próximo_vencimento/vencido/descartado)
- `checklist_evidence_reviews` -- execution_item_id, reviewer_id, status (pendente/aprovado/reprovado), comment

**Biblioteca de templates prontos** inserida via SQL (abertura cozinha, fechamento cozinha, abertura salão, etc.) com itens pré-configurados.

**RLS**: Todas as tabelas usam `is_establishment_member(user_id)` para acesso multi-tenant.

**Storage**: Bucket `checklist-evidence` (público) para fotos de evidência.

---

## FASE 2 -- Gestão de checklists e itens (tela do gestor)

Reescrever a página `/pdv/tarefas` com novas abas:

**Aba "Checklists":**
- CRUD de checklists com nome, setor (select), descrição
- Cada checklist abre editor de itens com drag-and-drop para reordenar
- Cada item: título, tipo (select com 6 opções), crítico (switch), obrigatório (switch), foto obrigatória (switch)
- Para tipo "temperatura": campos min/max
- Para tipo "stars": escala 1-5
- Botão duplicar checklist
- Biblioteca de templates prontos com botão "Usar template"
- Modo treinamento: campo de instrução e URL de vídeo por item

**Aba "Agendamento":**
- Vincular checklist a dias da semana, turno, horário de início, prazo máximo
- Atribuir a operador específico ou setor inteiro

**Aba "Equipe":**
- CRUD de operadores: nome, cargo, setor, PIN (4 dígitos), nível de acesso
- Lista com busca e filtros

**Aba "Configurações":**
- Manter configurações existentes (turnos, WhatsApp, QR code)

**Arquivos novos:** ~8 componentes em `src/components/pdv/checklists/`
**Hook:** `src/hooks/use-checklists.ts` (CRUD completo)

---

## FASE 3 -- Execução e tela do colaborador

**Tela de login por PIN** (`/tarefas/:userId` já existe como rota pública):
- Input de 4 dígitos (OTP style, já existe `InputOTP`)
- Valida PIN contra `checklist_operators`
- Ao entrar, mostra apenas checklists do turno atual atribuídos ao operador

**Tela de execução:**
- Layout mobile-first, um item por vez ou lista scrollável
- Cada tipo de item renderiza componente adequado:
  - Checkbox: toggle simples
  - Número: input numérico
  - Texto: textarea
  - Foto: botão câmera com upload direto
  - Temperatura: input numérico + indicador visual verde/vermelho baseado em min/max
  - Estrelas: componente de 5 estrelas clicável
- Cronômetro visível com tempo restante
- Modo treinamento: instrução/vídeo aparece antes de poder marcar o item
- Botão "Concluir" bloqueado até todos os itens obrigatórios preenchidos
- Alertas automáticos para temperatura fora da faixa ao preencher

**Arquivos novos:** ~5 componentes em `src/components/pdv/checklists/execution/`

---

## FASE 4 -- Painel do gestor, alertas e dashboard

**Aba "Painel" (nova, principal):**
- Cards de resumo: concluídos, atrasados, não iniciados
- Filtros: data, turno, setor, colaborador
- Linha do tempo cronológica com status visual (cores)
- Gráfico de taxa de conclusão por semana (Recharts)
- Itens mais ignorados/problemáticos
- Feed de atividades recentes

**Alertas:**
- Seção de alertas no painel com histórico filtrável
- Badge de notificação no menu quando há alertas não reconhecidos
- Alerta automático quando: checklist crítico não concluído no prazo, temperatura fora da faixa

**Widget "Saúde da Operação":**
- Semáforo (verde/amarelo/vermelho) integrado ao Dashboard principal do PDV (`/pdv/dashboard`)
- Verde: >90% concluídos no prazo; Amarelo: 70-90%; Vermelho: <70%

**Comparativo de turnos:**
- Card mostrando desempenho de cada turno do dia lado a lado

**Arquivos:** ~6 componentes novos, edição do `Dashboard.tsx`

---

## FASE 5 -- Score, evidências e validade

**Score da equipe:**
- Cálculo automático (0-100): prazo (40%), completude (30%), qualidade estrelas (30%)
- Ranking da equipe com avatar/posição
- Histórico por semana/mês com gráfico
- Badges automáticos: "Semana Perfeita", "Destaque do Mês" (lógica no hook)

**Galeria de evidências:**
- Grid de fotos organizado por data/setor/colaborador
- Cada foto com botões aprovar/reprovar/comentar
- Filtros e exportação (download zip)

**Controle de validade:**
- CRUD de produtos com data de validade
- Alertas automáticos: 3 dias antes, 1 dia antes, vencido
- Histórico de perdas/descartes

**Log de acessos:**
- Registro automático de login por PIN e ações realizadas
- Visualização para o gestor

---

## Detalhes técnicos

- **~10 tabelas novas** + 1 storage bucket
- **~30 componentes novos** organizados em `src/components/pdv/checklists/`
- **~5 hooks novos** para CRUD, execução, scores, alertas, evidências
- **Reutiliza**: `InputOTP`, `Recharts`, `is_establishment_member()`, bucket de storage, sistema de turnos existente
- **As tabelas antigas** (`operational_task_*`) podem coexistir inicialmente; migração de dados opcional depois

## Ordem recomendada

Fase 1 (banco) -> Fase 2 (gestão) -> Fase 3 (execução) -> Fase 4 (painel) -> Fase 5 (score/evidências)

Cada fase é funcional por si só. Posso começar pela **Fase 1** (migration SQL com todas as tabelas)?

