

# Unificar botoes de acao em um unico container

Os 6 botoes (QR Code, Relatorio, Gerar Tarefas + Novo Checklist, Colaborador, Tarefas de Hoje) estao em dois locais separados: header do `Tasks.tsx` e topo do `DashboardPanel.tsx`. O usuario quer todos juntos, proximos, em um unico container.

## Mudanca

### 1. `src/pages/pdv/Tasks.tsx`

- Remover os 3 botoes (QR Code, Relatorio, Gerar Tarefas) do `ResponsivePageHeader` children
- O header fica apenas com titulo e descricao

### 2. `src/components/pdv/checklists/DashboardPanel.tsx`

- Na area de atalhos rapidos (linha 42-52), adicionar os 3 botoes do header (QR Code, Relatorio, Gerar Tarefas) ao lado dos 3 existentes (Novo Checklist, Colaborador, Tarefas de Hoje)
- Todos os 6 botoes ficam em um unico `flex flex-wrap gap-2` no topo do painel
- Passar as funcoes `onQrOpen`, `onSendReport`, `onGenerateDaily` e estados `sendingReport`, `isGenerating` como props do `DashboardPanel`

### Props adicionais no DashboardPanel

```ts
interface DashboardPanelProps {
  onNavigate?: (section: string) => void;
  onQrOpen?: () => void;
  onSendReport?: () => void;
  onGenerateDaily?: () => void;
  sendingReport?: boolean;
  isGenerating?: boolean;
}
```

### Resultado visual

Todos os 6 botoes em uma unica linha/container `flex-wrap`, proximos, no topo do painel.

- 2 arquivos editados: `Tasks.tsx`, `DashboardPanel.tsx`
- 0 novos, 0 dependencias

