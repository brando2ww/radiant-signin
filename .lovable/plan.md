

# Sidebar de navegacao para Checklists Operacionais

Substituir as 10 tabs por uma sidebar interna na pagina de Tarefas, usando sub-rotas no React Router. Cada secao vira uma rota propria (`/pdv/tarefas/painel`, `/pdv/tarefas/checklists`, etc.).

## Abordagem

**Nao usar** o componente `sidebar-with-submenu.tsx` fornecido -- ele e um sidebar generico com SVGs inline e links `javascript:void(0)`. O projeto ja tem o sistema `shadcn/ui Sidebar` completo. Vou criar um sidebar interno usando os componentes existentes (`SidebarProvider`, `Sidebar`, `SidebarMenu`, etc.) que ja seguem o padrao do projeto (ver `AdminSidebar.tsx`).

## Mudancas

### 1. Transformar `/pdv/tarefas` em layout com sub-rotas

**Editar `src/pages/PDV.tsx`**: mudar a rota de `tarefas` para `tarefas/*` (wildcard) para suportar sub-rotas.

### 2. Criar sidebar interna

**Arquivo novo**: `src/components/pdv/checklists/ChecklistsSidebar.tsx`

Sidebar com os 10 itens usando `SidebarMenu`/`SidebarMenuButton`/`NavLink`:

| Item | Rota | Icone |
|------|------|-------|
| Painel | `/pdv/tarefas` (index) | LayoutDashboard |
| Checklists | `/pdv/tarefas/checklists` | ClipboardCheck |
| Agendamento | `/pdv/tarefas/agendamento` | Calendar |
| Equipe | `/pdv/tarefas/equipe` | Users |
| Tarefas do Dia | `/pdv/tarefas/hoje` | ListChecks |
| Configuracoes | `/pdv/tarefas/configuracoes` | Settings |
| Score | `/pdv/tarefas/score` | Trophy |
| Evidencias | `/pdv/tarefas/evidencias` | Camera |
| Validade | `/pdv/tarefas/validade` | ShieldAlert |
| Logs | `/pdv/tarefas/logs` | FileText |

Collapsible com `collapsible="icon"`, seguindo o padrao do `AdminSidebar`.

### 3. Reescrever `src/pages/pdv/Tasks.tsx`

Substituir o layout de tabs por:
- `SidebarProvider` envolvendo sidebar + conteudo
- `ChecklistsSidebar` na esquerda
- `<Routes>` no conteudo principal renderizando cada componente na sub-rota correspondente
- Header com titulo + botoes de acao (QR, Relatorio, Gerar Tarefas) permanece no topo
- `SidebarTrigger` no header para colapsar/expandir

### 4. Atualizar rota no PDV.tsx

Mudar `path="tarefas"` para `path="tarefas/*"` para que sub-rotas funcionem.

### 5. Nao copiar sidebar-with-submenu.tsx

O componente fornecido usa markup HTML puro com classes Tailwind genericas e SVGs inline. O projeto ja tem um sistema de sidebar maduro (shadcn). Reutilizar o padrao existente garante consistencia visual e funcional.

## Detalhes tecnicos

- **2 arquivos editados**: `Tasks.tsx` (reescrita), `PDV.tsx` (wildcard route)
- **1 arquivo novo**: `ChecklistsSidebar.tsx`
- **0 dependencias novas**
- Reutiliza: `SidebarProvider`, `Sidebar`, `SidebarMenu*`, `NavLink`, icones `lucide-react`

