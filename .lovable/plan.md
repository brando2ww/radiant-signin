

## Remover todos os toasts do app dos garçons

### Causa
Os toasts (sonner) sobem na parte inferior da tela e cobrem a `BottomTabBar` no app do garçom (mobile). O usuário quer eliminá-los completamente nessa área.

### Arquivos e mudanças

Remover **todas** as chamadas a `toast.*` (sucesso, erro, warning, info) e o respectivo `import { toast } from "sonner"` em:

1. **`src/pages/Garcom.tsx`**
   - Remover `toast.error("Abra o caixa antes de criar uma comanda.")` em `handleSelectComandaAvulsa`. Bloqueio continua (return), apenas sem feedback visual via toast.
   - Remover import.

2. **`src/components/garcom/GarcomHeader.tsx`**
   - Remover `toast.info("Chamado enviado ao gerente!")` em `handleCallManager`. Função fica sem feedback (no-op visual). Botão continua presente.
   - Remover import.

3. **`src/pages/garcom/GarcomMesaDetalhe.tsx`**
   - Remover `toast.error("Abra o caixa…")` no guard.
   - Remover `toast.success("Enviado para cozinha!")` após `sendToKitchen`.
   - Remover import.

4. **`src/pages/garcom/GarcomComandaDetalhe.tsx`**
   - Remover `toast.success("Comanda enviada para a cozinha")` e `toast.warning("… sem centro de produção …")`.
   - Remover import.

5. **`src/pages/garcom/GarcomAdicionarItem.tsx`**
   - Remover `toast.warning("Alguns itens não têm centro de produção …")`.
   - Remover import.

### Considerações
- Hooks (`usePDVComandas`, `usePDVKitchen`, etc.) ainda podem disparar toasts próprios em erros de mutação. Estes **não** serão tocados — o pedido é remover os toasts disparados explicitamente nas telas/componentes do garçom. Se aparecer algum desses, tratamos depois.
- Nenhuma lógica funcional (envio à cozinha, criação de comanda, guarda de caixa) é alterada — apenas o feedback visual via toast é suprimido.
- Não mexer no `<Toaster />` global, pois o resto do app (PDV, admin) depende dele.

### Fora de escopo
- Remover toasts internos de hooks compartilhados.
- Substituir toasts por outro tipo de feedback (banner inline, badge). Caso o usuário queira feedback alternativo depois, fazemos em uma próxima iteração.

