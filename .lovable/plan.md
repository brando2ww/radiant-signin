

## Substituir popup do navegador por modal do sistema ao fechar com alterações não salvas

### Causa
Em `src/components/pdv/ProductDialog.tsx`, o `handleDialogOpenChange` usa `window.confirm(...)` para perguntar se o usuário quer descartar as edições pendentes da aba **Opções**. Isso exibe o popup nativo do navegador, fora do design system.

### Correção
Trocar o `window.confirm` por um `AlertDialog` do design system (shadcn/Radix), com botões "Continuar editando" e "Descartar e fechar".

### Arquivo
- `src/components/pdv/ProductDialog.tsx`

### Mudanças

1. Importar `AlertDialog`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogContent`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogHeader`, `AlertDialogTitle` de `@/components/ui/alert-dialog`.
2. Importar `buttonVariants` de `@/components/ui/button` para estilizar a ação destrutiva.
3. Novo estado: `const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);`
4. Reescrever `handleDialogOpenChange`: quando `optionsDirty` e o dialog está fechando, abrir o `AlertDialog` em vez de chamar `window.confirm`, e não propagar o fechamento.
5. Novo handler `handleConfirmDiscardClose`: zera `optionsDirty`, fecha o `AlertDialog` e propaga o fechamento do Dialog principal.
6. Renderizar o `AlertDialog` ao final do componente (irmão do `Dialog`), com:
   - Título: "Descartar alterações?"
   - Descrição: "Há alterações não salvas na aba Opções. Se você fechar agora, elas serão perdidas."
   - Cancel: "Continuar editando"
   - Action: "Descartar e fechar" com `className={buttonVariants({ variant: "destructive" })}`

### Resultado
O popup nativo do navegador desaparece. No lugar, aparece o modal do design system, coerente com o restante do app.

