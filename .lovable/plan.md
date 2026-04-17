
User wants the Production Centers list redesigned as cards (like the Integrations reference image: card with logo/icon top-left, action button top-right, title, description, divider, footer link), keeping all current functionality (create/edit/delete/printer config).

Reference image shows:
- 3-column grid of cards
- Each card: icon top-left + "Connect" button top-right
- Title (bold), short description below
- Horizontal divider
- Footer with link "View integration"

Mapping to Centros de Produção:
- Icon (with center color tint) top-left + Edit/Delete actions top-right
- Center name (bold) + slug badge
- Description = printer info (or "Sem impressora configurada")
- Divider
- Footer = "Configurar impressora" link that opens edit dialog focused on printer field (or just opens edit)

Plan:

# Redesenhar Centros de Produção como cards

Substituir a lista vertical atual em `ProductionCentersTab.tsx` por um grid de cards no estilo da imagem de referência (Integrations), mantendo toda a lógica existente (criar, editar, excluir, configurar impressora).

## Layout do card

```text
┌─────────────────────────────────┐
│ [icon]              [⋯ menu]    │
│                                  │
│ Sushi Bar         [sushi-bar]   │
│ 🖨 Bematech-Cozinha             │
│ ─────────────────────────────── │
│           Configurar impressora │
└─────────────────────────────────┘
```

- **Topo**: ícone colorido (bg tint) à esquerda + dropdown de ações (Editar / Remover) à direita
- **Corpo**: nome + badge do slug, depois linha com ícone de impressora e nome (ou "Sem impressora configurada" em muted)
- **Divisor** horizontal
- **Rodapé**: link "Configurar impressora" que abre o dialog de edição

## Mudanças

**Editado: `src/components/pdv/settings/ProductionCentersTab.tsx`**
- Trocar o `<div className="space-y-2">` (lista) por `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">`
- Cada item vira um `<Card>` com `CardHeader` (ícone + dropdown), `CardContent` (nome, slug, info impressora) e `CardFooter` (link configurar)
- Substituir os dois botões soltos (Edit/Trash) por um `DropdownMenu` (três pontinhos) — alinhado ao padrão `resource-action-menu` da memória do projeto
- Manter Alert explicativo, botão "Novo Centro", empty state e AlertDialog de exclusão como estão

**Sem mudanças**
- `ProductionCenterDialog.tsx` (já trata criar/editar com campo de impressora)
- `use-production-centers.ts`
- Página `ProductionCenters.tsx`
- Migration / banco

## Resultado

Visual idêntico ao mock de cards enviado, com 3 colunas em telas grandes, 2 em médias, 1 em mobile. Cada card destaca a impressora configurada (ou aviso de ausência) e o rodapé funciona como CTA principal para configurar a impressora daquela bancada.
