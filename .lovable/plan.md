

## Manter apenas toasts de erro no app do garçom — exibidos no topo

### O que muda
Dos toasts removidos antes, restauro **apenas os de erro**, agora posicionados no **topo da tela** (`top-center`) para não cobrir o menu inferior. Toasts de sucesso/aviso continuam removidos.

### Arquivos e mudanças

1. **`src/pages/Garcom.tsx`**
   - Reimportar `toast` de `sonner`.
   - Em `handleSelectComandaAvulsa`, restaurar:
     ```ts
     toast.error("Abra o caixa antes de criar uma comanda.", { position: "top-center" });
     ```

2. **`src/pages/garcom/GarcomMesaDetalhe.tsx`**
   - Reimportar `toast` de `sonner`.
   - Em `handleNewComanda`, restaurar o mesmo erro com `position: "top-center"`.

3. **Não tocar** em:
   - `GarcomHeader.tsx` (era `toast.info` — fica removido)
   - `GarcomComandaDetalhe.tsx` (eram `success`/`warning` — ficam removidos)
   - `GarcomAdicionarItem.tsx` (era `warning` — fica removido)
   - `<Sonner />` global no `App.tsx` (mantém posição padrão para o resto do app; só esses dois toasts específicos do garçom usam `top-center` via opção por chamada)

### Por que `position` por chamada e não um Toaster local
O sonner aceita `position` por toast individual, então não precisamos montar um segundo `<Toaster />` só para o garçom nem alterar o global — evita duplicar provider e mantém o resto do app intacto.

### Fora de escopo
- Toasts disparados internamente por hooks (mutations). Se algum aparecer atrapalhando, tratamos depois caso a caso.

