
User wants Centros de Produção as a dedicated menu item under "Administrador" in PDV header nav, instead of being a tab inside Settings.

Plan:
1. Create new page `src/pages/pdv/ProductionCenters.tsx` that renders the existing `ProductionCentersTab` component (with proper page header).
2. Add route in `src/pages/PDV.tsx`: `/pdv/centros-producao` → `ProductionCenters` (wrapped with RoleRoute).
3. Add nav item in `src/components/pdv/PDVHeaderNav.tsx` under "Administrador" section: "Centros de Produção" with `Factory` (or `ChefHat`) icon → `/pdv/centros-producao`.
4. Remove the "production" tab from `src/pages/pdv/Settings.tsx` (TabsList grid back to 6 cols, remove TabsTrigger and TabsContent for production, remove `ProductionCentersTab` import).

# Centros de Produção como página dedicada

Mover a aba "Produção" de dentro de Configurações para uma página própria acessível pelo menu **Administrador → Centros de Produção**.

## Mudanças

**Novo arquivo**
- `src/pages/pdv/ProductionCenters.tsx` — página dedicada que renderiza o `ProductionCentersTab` existente com cabeçalho próprio (título + descrição).

**Arquivos editados**
- `src/pages/PDV.tsx` — adicionar rota `/pdv/centros-producao` protegida por `RoleRoute`.
- `src/components/pdv/PDVHeaderNav.tsx` — adicionar item "Centros de Produção" na seção **Administrador** (ícone `Factory`, entre "Produtos" e "Estoque").
- `src/pages/pdv/Settings.tsx` — remover a aba "Produção" (TabsList volta para 6 colunas, remove `TabsTrigger`/`TabsContent` e o import de `ProductionCentersTab`).

## Resultado

- Acesso direto via menu: **Administrador → Centros de Produção**
- URL limpa: `/pdv/centros-producao`
- Configurações volta a ter 6 abas (Geral, Visual, Financeiro, Pedidos, Notificações, Integrações)
- Componente `ProductionCentersTab` é reutilizado sem alterações
