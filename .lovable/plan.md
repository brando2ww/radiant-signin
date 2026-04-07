
## Substituir botões de ação por menu de 3 pontinhos

### O que muda
Substituir os 4 ícones soltos (estrela, olho, copiar, editar) por um único botão `MoreVertical` (⋮) que abre um `DropdownMenu` com as opções:
- **Editar** (Edit icon)
- **Duplicar** (Copy icon)
- **Ocultar / Mostrar** (Eye/EyeOff icon) — toggle de disponibilidade
- **Excluir** (Trash2 icon, em vermelho) — com confirmação via AlertDialog já existente

O ícone de estrela (destaque) continua visível fora do menu como indicador visual.

### Arquivo alterado
`src/components/delivery/ProductList.tsx`

### Detalhes
- `ProductListItem` recebe nova prop `onDelete`
- Botões individuais substituídos por `DropdownMenu` + `DropdownMenuTrigger` (MoreVertical) + `DropdownMenuContent` com 4 `DropdownMenuItem`
- A opção "Excluir" usa `className="text-destructive"` e chama `onDelete`
- O `ProductList` passa `onDelete={() => setDeletingProduct(product)}` — a lógica de confirmação e exclusão já existe no componente pai
