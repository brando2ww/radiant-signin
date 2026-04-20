

## Plano: editar nome e descrição da campanha

### Onde
Adicionar ação "Editar" no menu de 3 pontos do `CampaignCard` (na lista de Campanhas), entre "Abrir formulário" e "Desativar".

### Como
1. **Novo componente** `src/components/pdv/evaluations/EditCampaignDialog.tsx` — dialog reutilizando o padrão do `CampaignDialog` existente, mas pré-preenchido com `name` e `description` da campanha e chamando `useUpdateCampaign` (já existe e suporta `name`/`description`).
2. **Editar `CampaignCard.tsx`**:
   - Importar `Pencil` do lucide e o novo dialog.
   - Adicionar estado `editOpen`.
   - Adicionar `<DropdownMenuItem>` "Editar" no topo do menu.
   - Renderizar `<EditCampaignDialog campaign={campaign} open={editOpen} onOpenChange={setEditOpen} />`.
3. **Bonus** — também tornar o título no header do `CampaignDetail` clicável (ícone de lápis ao lado) abrindo o mesmo dialog, para quem já está dentro da campanha.

### Validação
- Abrir 3 pontos → "Editar" → alterar nome → salvar → card atualiza imediatamente (invalidação de `["evaluation-campaigns"]` já existente).
- Dentro do detalhe da campanha: clicar no lápis ao lado do nome → editar → header atualiza.

### Arquivos
- **Novo:** `src/components/pdv/evaluations/EditCampaignDialog.tsx`
- **Editado:** `src/components/pdv/evaluations/CampaignCard.tsx`
- **Editado:** `src/components/pdv/evaluations/CampaignDetail.tsx`

