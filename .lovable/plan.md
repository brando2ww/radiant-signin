## Objetivo

No painel de Dashboard dos Checklists (`/pdv/tarefas` → aba Dashboard), o card **"Concluídos"** passa a ser clicável. Ao clicar, abrirá um dialog mostrando todas as execuções concluídas do dia selecionado, com a possibilidade de expandir cada uma para ver as respostas item por item (incluindo valor preenchido, observações e fotos).

## Mudanças

### 1. `src/components/pdv/checklists/DashboardPanel.tsx`
- Adicionar prop `onClick` opcional ao `MetricCard` (com hover/cursor-pointer quando presente).
- Passar `onClick` apenas no card "Concluídos" para abrir o novo dialog.
- Adicionar estado local `completedDialogOpen` e renderizar `<CompletedExecutionsDialog date={date} open={...} onOpenChange={...} />`.

### 2. Novo componente `src/components/pdv/checklists/CompletedExecutionsDialog.tsx`
- Dialog (não-modal, padrão do projeto) com título "Checklists concluídos — {data formatada pt-BR}".
- Busca via Supabase: `checklist_executions` filtrando `user_id = visibleUserId`, `execution_date = date` e `status = 'concluido'`, com joins em `checklists(name, sector)` e `checklist_operators(name)`.
- Lista usando `Accordion` (já disponível em `@/components/ui/accordion`):
  - **Header de cada item**: nome do checklist, setor, operador, horário de conclusão (HH:mm pt-BR), badge com score `X/100`.
  - **Conteúdo expandido**: lista dos `checklist_execution_items` da execução com join em `checklist_items(title, item_type, is_critical, requires_photo, sort_order)` ordenados por `sort_order`. Para cada item exibe:
    - título + ícone check (verde) ou X (cinza) conforme `completed_at`;
    - valor renderizado conforme `item_type` (checkbox sim/não, número, texto, seleção, foto via `<img>` quando `value` for URL ou `evidence_url`);
    - observações (`notes`) se houver;
    - badges "Crítico" / "Foto obrigatória" quando aplicável.
- Estado vazio: "Nenhum checklist concluído neste dia.".
- Skeleton durante loading.

### 3. Detalhes técnicos
- Usar `useEstablishmentId` para obter `visibleUserId`.
- Buscar itens de execução via uma query lazy por execução (carregada só quando o accordion abre) usando `useQuery` por `executionId` para evitar carregar tudo de uma vez.
- Datas formatadas com `date-fns` + `ptBR` locale (regra do projeto).
- Cores e estilos seguindo tokens padrão (sem cores customizadas).

## Fora do escopo
- Não altera lógica de cálculo de métricas nem o banco.
- Não adiciona edição/reabertura de checklists concluídos (apenas visualização).
