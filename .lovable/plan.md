

## Corrigir o sheet de opções no mobile

### Problemas identificados
1. **Footer cortado pela tab bar inferior** — `BottomTabBar` é `fixed bottom-0 z-50 h-16` e o `SheetContent` também é `z-50`. Em alguns navegadores móveis, a tab bar acaba cobrindo o footer "Voltar / Continuar" do seletor.
2. **Preço duplicado** no topo — aparece no título do Sheet ("Caipira Cremosa · R$ 24,00") e logo abaixo no card "Total · R$ 24,00".
3. **Padding inferior do footer** depende de `env(safe-area-inset-bottom)` que pode resolver para 0 em algumas WebViews, deixando o botão colado na borda.
4. **`pb-24` excessivo** no container de grupos sobra espaço quando a lista é curta.

### Correção

**`src/pages/garcom/GarcomAdicionarItem.tsx`**
- `SheetContent`: adicionar `z-[60]` para garantir que fique acima da `BottomTabBar` (`z-50`).
- `SheetTitle`: remover o preço (deixar só o nome do produto). O total já aparece no card "Total" e no botão "Continuar".

**`src/components/garcom/MobileProductOptionSelector.tsx`**
- Footer sticky:
  - Trocar `pb-[env(safe-area-inset-bottom)]` por `pb-4` com fallback seguro.
  - Adicionar leve sombra superior (`shadow-[0_-8px_16px_-8px_rgba(0,0,0,0.15)]`) para destacar do conteúdo que rola atrás.
- Container dos grupos: trocar `pb-24` por `pb-4` (o footer sticky já reserva espaço; com max-h do Sheet ele sempre fica visível).

### Por que não esconder a tab bar
O Radix já cobre a tela com overlay escuro `z-50 fixed inset-0`. Só subir o `SheetContent` para `z-[60]` resolve a sobreposição sem mexer na tab bar nem em rotas, e mantém o comportamento em todos os outros sheets do app intacto.

### Fora de escopo
- Mexer no z-index global da tab bar.
- Alterar o `ProductOptionSelector` desktop do PDV.
- Ajustes em outros sheets/dialogs do garçom.

