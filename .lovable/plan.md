
## Corrigir seleção de insumo no dialog de opções

### Diagnóstico confirmado
O `ProductOptionDialog` já está com `Popover modal={false}`. Então o problema não é mais o popover isolado.

A causa provável está na estrutura atual:

```text
ProductDialog (Dialog modal)
└─ ProductOptionsManager
   └─ ProductOptionDialog (outro Dialog modal)
      └─ Popover/Command do insumo
```

Hoje existem dois `Dialog` modais empilhados. O popover do insumo é renderizado em portal fora do conteúdo do dialog interno, então o clique na lista fica bloqueado pela camada modal/focus trap do dialog filho.

### Implementação
**1. `src/components/delivery/ProductOptionDialog.tsx`**
- Tornar o dialog de opção não modal:
  ```tsx
  <Dialog modal={false} open={open} onOpenChange={...}>
  ```
- Manter o `Popover modal={false}` como já está.
- Criar um wrapper para `onOpenChange` que, ao fechar, também faça:
  - `setOpenPopoverIndex(null)`
- Garantir `type="button"` nos botões do seletor/limpeza para evitar comportamento inesperado.

### Resultado esperado
- A lista de insumos continua abrindo normalmente.
- O clique em um item da lista passa a disparar `handleSelectIngredient`.
- O botão mostra o insumo selecionado e os campos de quantidade/unidade aparecem.
- O vínculo continua sendo salvo como já foi planejado.

### Detalhes técnicos
- O problema não parece estar no `handleSelectIngredient` nem no salvamento.
- O código de seleção já existe; o bloqueio acontece antes, na camada de interação entre `Dialog` aninhado + `Popover` portaled.
- A correção deve ficar concentrada em 1 arquivo.

### Validação
1. Abrir produto > “Opções e Complementos” > criar/editar opção.
2. Abrir “Buscar insumo...”.
3. Clicar em diferentes itens da lista.
4. Confirmar que:
   - o item é selecionado no primeiro clique,
   - o popover fecha,
   - o nome do insumo aparece no botão,
   - a quantidade pode ser editada,
   - salvar e reabrir mantém o vínculo.
