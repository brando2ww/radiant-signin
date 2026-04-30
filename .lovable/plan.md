## Mudanças no Dashboard de Checklists (`src/components/pdv/checklists/DashboardPanel.tsx`)

### 1. Remover botão "Relatório"
Remover o `<Button>` da barra superior que dispara `onSendReport`. Também remover os imports/props não mais usados (`Send`, `onSendReport`, `sendingReport`) — manter compatibilidade do tipo da prop deixando-as opcionais e ignoradas, ou removendo de vez. Vou removê-las da assinatura.

### 2. Remover card "Em Andamento"
Remover o `MetricCard` correspondente (`metrics?.emAndamento`) do grid de cards de resumo. Ajustar o grid para `grid-cols-2 lg:grid-cols-4` para ficar bem distribuído (Concluídos, Atrasados, Não Iniciados, Saúde).

### 3. Card "Atrasados" clicável → dialog com checklists em atraso
- Adicionar estado `overdueDialogOpen`.
- Passar `onClick={() => setOverdueDialogOpen(true)}` no `MetricCard` "Atrasados".
- Reaproveitar o componente `CompletedExecutionsDialog` generalizando-o:
  - Renomear para `ExecutionsByStatusDialog` (mantém arquivo) ou criar novo `OverdueExecutionsDialog` reutilizando a mesma estrutura.
  - Solução escolhida: **generalizar** o componente existente adicionando uma prop `status: "concluido" | "atrasado"` e título dinâmico ("Checklists concluídos" / "Checklists em atraso"). Atualizar o `DashboardPanel` para passar `status="concluido"` e `status="atrasado"` nas duas instâncias.
- O conteúdo do dialog para "atrasado" mostra os mesmos campos (nome, setor, operador, horário agendado) e expande para ver os itens já respondidos (se houver) — útil para checar progresso pendente.

### Detalhes técnicos
- Manter ordenação por `started_at` quando status for `atrasado` (executions atrasadas geralmente têm `started_at` definido); fallback para `created_at` se necessário.
- Reaproveitar `ExecutionItems` sem mudanças — funciona para qualquer execution_id.
- Sem alterações de banco.
