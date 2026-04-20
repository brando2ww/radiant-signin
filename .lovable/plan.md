

## Plano: QR Codes para acesso direto a checklists

### 1. Mudanças no banco

**Tabela `checklists`** — adicionar coluna:
- `qr_access_enabled` boolean default true — toggle individual de acesso por QR Code

**Tabela `checklist_access_logs`** — já existe, será reutilizada.
- Novas `action`s registradas: `"qr_open"`, `"qr_pin_fail"`, `"qr_blocked"`.

### 2. Nova rota pública

`/c/:checklistId` em `src/App.tsx`, apontando para uma nova página `PublicChecklistAccess.tsx` (sem login).

Fluxo:
1. Carrega o checklist pelo `id` (consulta pública via select restrito por id).
2. Se `is_active = false` ou `qr_access_enabled = false` → tela "Este checklist não está disponível no momento".
3. Mostra cabeçalho com nome do checklist, setor (ícone + cor) e badge.
4. Pede PIN do colaborador (`InputOTP`, 4 dígitos), validando contra `checklist_operators` do `user_id` dono do checklist.
5. **Bloqueio anti-abuso (client-side, por sessão de browser):**
   - 3 falhas seguidas → bloqueia input por 60s, mostrando contador.
   - Cada falha grava log `qr_pin_fail`; bloqueio grava `qr_blocked`.
6. PIN correto → cria/recupera execução do checklist e renderiza `ChecklistExecutionPage` reutilizando o componente atual.
7. Ao concluir → tela de sucesso com resumo (itens ok / críticos) e botão "Escanear outro QR Code" (volta para tela inicial pedindo novo PIN).

### 3. Geração de QR Code por checklist

**Novo componente `ChecklistQrPosterDialog.tsx`** (`src/components/pdv/checklists/`) — modal de cartaz pronto para impressão.

URL gerada: `${window.location.origin}/c/${checklistId}`.

Layout do cartaz (renderizado em HTML/CSS, ref para impressão):
- Logo Velara no topo (usa componente `<Logo>`).
- Nome do checklist em destaque (texto grande).
- Linha com ícone do setor + nome do setor, usando a cor do checklist como destaque.
- QR Code central (`qrcode.react` `QRCodeSVG`, tamanho mínimo 240px).
- Texto: "Escaneie para abrir o checklist".
- Rodapé com URL curta (`pdv.velaraia.app/c/...`) e nome do estabelecimento (busca no profile).

Controles do dialog:
- Seletor de **tamanho**: A4 / A5 / Etiqueta 10×10cm (CSS muda dimensões do `@page` e do bloco `.poster`).
- Toggle **fundo colorido** (usa `config.color` do checklist como fundo, texto branco).
- Botão **Imprimir** → `window.print()` com classe `print:block` no poster e `print:hidden` em todo o resto.
- Botão **Baixar PNG** → usa `html-to-image` (já comum no stack; se ausente, adicionar `html-to-image`) para exportar o div do poster.
- Botão **Baixar PDF** → usa `jspdf` + imagem PNG gerada acima, dimensionando no formato escolhido.

### 4. Pontos de entrada do botão "QR Code"

- **Lista de checklists** (`ChecklistsManager.tsx`): adicionar botão de QR Code (`QrCode` icon) ao lado de Duplicar/Excluir em cada card. Abre o `ChecklistQrPosterDialog` para aquele checklist.
- **Editor de checklist** (`ChecklistEditor.tsx`): adicionar botão "QR Code" no header (ao lado de Salvar) — desabilitado quando `isNew` (precisa estar salvo).
- **Painel de configuração** (`ChecklistConfigPanel.tsx`): adicionar toggle "Acesso via QR Code" (`qr_access_enabled`) logo abaixo do toggle "Status".

### 5. Geração em lote por setor

**Novo componente `BatchQrPosterDialog.tsx`** acionado por botão "Imprimir QR Codes do Setor" em `ChecklistsManager.tsx`.

Fluxo:
1. Usuário escolhe setor (Cozinha, Salão, Caixa, Bar, Estoque, Gerência).
2. Sistema lista todos os checklists ativos daquele setor com `qr_access_enabled`.
3. Renderiza folha A4 com grid 2×N (até 4 por página) — cada bloco contém: nome do checklist, setor, QR Code médio (160px), URL curta.
4. Quebra de página automática via CSS `break-inside: avoid`.
5. Botões: Imprimir, Baixar PDF.

### 6. Logs de acesso

Em todos os pontos de acesso via `/c/:id` (abrir página, falhar PIN, bloqueio, login bem-sucedido, conclusão), registrar em `checklist_access_logs` com `details: { source: "qr", checklistId }`. O `AccessLogsPanel` existente já lista esses registros automaticamente.

### 7. Mobile-first

A rota `/c/:checklistId` usa layout `max-w-md mx-auto`, padding generoso, botões `h-12` e `text-base`, otimizada para uso com uma mão. Reutiliza padrões já presentes em `PublicTasks.tsx`.

### 8. Dependências novas

- `html-to-image` — exportar poster como PNG.
- `jspdf` — gerar PDF com a imagem gerada.

(Caso já existam no projeto, apenas usar.)

### 9. Arquivos afetados

**Novos:**
- `src/pages/PublicChecklistAccess.tsx`
- `src/components/pdv/checklists/ChecklistQrPosterDialog.tsx`
- `src/components/pdv/checklists/BatchQrPosterDialog.tsx`

**Editados:**
- `src/App.tsx` — adicionar rota `/c/:checklistId`.
- `src/components/pdv/checklists/ChecklistsManager.tsx` — botões QR individual + lote por setor.
- `src/pages/pdv/ChecklistEditor.tsx` — botão QR no header.
- `src/components/pdv/checklists/editor/ChecklistConfigPanel.tsx` — toggle `qr_access_enabled`.

**Migration:**
- Adicionar coluna `qr_access_enabled` na tabela `checklists`.

### 10. Validação

1. Criar checklist "Abertura Cozinha" → clicar QR Code → escanear com celular → entrar com PIN → executar e concluir.
2. Desativar `qr_access_enabled` → rescanear → ver mensagem de indisponível.
3. Errar PIN 3× → bloqueio de 60s + log gravado.
4. Imprimir lote da "Cozinha" → conferir A4 com todos os QR Codes do setor.
5. Verificar que log de acessos no painel mostra entradas com `source: "qr"`.

