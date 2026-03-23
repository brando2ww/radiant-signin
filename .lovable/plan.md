

## Fix: Página de Franquia para tenant MATRIZ

### Problema
João Farias é o **owner do tenant matriz** (Restaurante DEMO, `parent_tenant_id = null`). A página de franquia só funciona para tenants **filhos** (que têm `parent_tenant_id` preenchido). Como Restaurante DEMO é a matriz, `hasParentTenant = false` e mostra "Sem conexão".

### Solução
Expandir o hook `use-franchise-import.ts` e a página `FranchiseImport.tsx` para funcionar nos dois cenários:

1. **Tenant é FILHO** (tem `parent_tenant_id`) → comportamento atual: importar da matriz
2. **Tenant é MATRIZ** (tem filhos com `parent_tenant_id` apontando para ele) → novo: mostrar filhos vinculados e permitir enviar/compartilhar produtos e mesas para as franquias

### Mudanças

| Arquivo | Acao |
|---------|------|
| `src/hooks/use-franchise-import.ts` | Adicionar detecção de filhos (`childTenants`), flag `isParentTenant`, queries para buscar filhos do tenant, e mutations de compartilhamento (reutilizando edge function existente) |
| `src/pages/pdv/FranchiseImport.tsx` | Renderizar view diferente para matriz: lista de franquias vinculadas, seleção de produtos/mesas próprios para compartilhar com filhos selecionados, botão de sincronizar |

### Fluxo para MATRIZ

```text
┌─────────────────────────────────────────────┐
│ Franquia — Gerenciar Franquias              │
│ Você é a matriz. 1 franquia(s) vinculada(s) │
├─────────────────────────────────────────────┤
│ Franquias Vinculadas                        │
│ ☑ Koten Sushi · Ativo                       │
├─────────────────────────────────────────────┤
│ Compartilhar Produtos        [Enviar]       │
│ ☑ Produto A  ☑ Produto B                   │
├─────────────────────────────────────────────┤
│ Compartilhar Mesas           [Enviar]       │
│ ☑ Mesa 1  ☑ Mesa 2                          │
├─────────────────────────────────────────────┤
│ Sincronizar Tudo             [Sincronizar]  │
└─────────────────────────────────────────────┘
```

### Detalhes do hook
- Buscar `childTenants` via `tenants WHERE parent_tenant_id = tenantId`
- `isParentTenant = childTenants.length > 0`
- Para matriz: buscar produtos/mesas do PROPRIO tenant (owner) para compartilhar
- Mutations de share chamam a edge function `sync-shared-products` com actions `share_products` e `share_tables` já existentes

