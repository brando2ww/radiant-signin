

## Fix: Campo "Número de Pessoas" pré-preenchido + Modal travando a página

### Problema 1: Campo vem com valor "1" pré-preenchido
O campo "Número de Pessoas" usa `value={personNumber || "1"}`, que sempre mostra "1" mesmo quando o estado está vazio. Deveria começar vazio (com placeholder "1") para que o usuário preencha manualmente.

### Problema 2: Ao fechar o modal, a página trava
O `AlertDialog` de capacidade usa `onOpenChange={setCapacityWarningOpen}` mas quando o ComandaDialog é fechado sem submeter, o `pendingComandaData` não é limpo. Além disso, o problema principal é que o ComandaDialog e o AlertDialog podem estar competindo pelo controle do DOM — quando o AlertDialog fecha mas o ComandaDialog já foi fechado, o body mantém `pointer-events: none` do overlay do Radix. A solução é garantir que ao cancelar/fechar qualquer dialog, todos os estados relacionados sejam limpos corretamente.

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/pdv/ComandaDialog.tsx` | Mudar `value={personNumber \|\| "1"}` para `value={personNumber}` com `placeholder="1"`. Resetar estados ao fechar (via `onOpenChange`) |
| `src/pages/pdv/Salon.tsx` | No `AlertDialogCancel`, fechar também o `comandaDialogOpen`. No `handleConfirmCapacityOverride`, garantir cleanup completo. Adicionar cleanup no `onOpenChange` do `capacityWarningOpen` |

### Detalhes

**ComandaDialog.tsx:**
- Linha 106: `value={personNumber}` + `placeholder="1"`
- Adicionar reset de estados quando `onOpenChange(false)` é chamado (via useEffect ou wrapper)

**Salon.tsx:**
- `AlertDialogCancel`: além de limpar `pendingComandaData`, reabrir ou manter o `comandaDialogOpen` dependendo do fluxo
- Garantir que ao fechar o `AlertDialog`, `document.body.style.pointerEvents` não fique travado — usar `onOpenChange` com cleanup explícito

