

## Corrigir clique nos insumos dentro do popover

### Causa
Os dois popovers de busca de insumo estão dentro do `Dialog` do `ProductDialog`. Como o Dialog do shadcn/Radix é modal por padrão e o `PopoverContent` é renderizado em portal (fora do `DialogContent`), o overlay do Dialog está bloqueando os cliques dos botões de insumo na lista do popover.

Esse comportamento já está documentado na memória do projeto (`mem://ui-patterns/dialog-interaction-standards`): popovers aninhados em diálogos precisam de tratamento especial.

### Correção

Adicionar `modal` no componente `Popover` (Radix) nos dois popovers de busca de insumo. Isso faz o popover assumir o controle de pointer/focus enquanto está aberto, sobrepondo corretamente o overlay do Dialog e permitindo cliques nos itens.

### Arquivo
- `src/components/pdv/PDVProductOptionsManager.tsx`

### Mudanças
1. **Popover do item já existente** (linha 578): adicionar prop `modal` no `<Popover>`.
2. **Popover do novo item** (linha 714): adicionar prop `modal` no `<Popover>`.

Nada mais muda — o resto da estrutura, autopreenchimento, `type="button"`, lista de insumos e handlers continuam iguais.

### Resultado esperado
- Clicar no ícone de buscar insumo abre o popover normalmente
- A busca digitada filtra
- Clicar em um insumo da lista funciona: vincula no item existente ou autopreenche o nome no formulário de novo item
- O Dialog principal continua aberto durante toda a operação

### Por que não usar outra abordagem
- `container={dialogContentRef}`: funciona, mas exige refs e `forwardRef` — mais código sem ganho real
- `onPointerDownOutside` no Dialog: arriscado, pode quebrar fechamento por clique fora em outros lugares
- `modal` no Popover: 1 linha por popover, é a abordagem oficial do Radix para esse cenário e já é usada em outros lugares do projeto (padrão estabelecido)

