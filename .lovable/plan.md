

## Página de Franquia no PDV — Importar Dados da Matriz

### Conceito

Nova página `/pdv/franquia` acessível pelo menu "Administrador". Quando o tenant do usuário logado está vinculado a uma matriz (`parent_tenant_id` != null), ele pode visualizar e importar dados da matriz: produtos, mesas, e configurações de delivery.

Se não está conectado a nenhuma franquia, mostra mensagem informativa.

```text
┌─────────────────────────────────────────────────┐
│ Franquia — Importar da Matriz                    │
│ Conectado a: Burger King HQ                      │
├─────────────────────────────────────────────────┤
│                                                  │
│ ┌─ Produtos da Matriz ────────────────────────┐  │
│ │ ☑ X-Burger  ☑ Batata  ☐ Milk Shake         │  │
│ │                          [Importar Produtos] │  │
│ └──────────────────────────────────────────────┘  │
│                                                  │
│ ┌─ Mesas da Matriz ───────────────────────────┐  │
│ │ ☑ Mesa 1  ☑ Mesa 2  ☐ Mesa 3               │  │
│ │                            [Importar Mesas] │  │
│ └──────────────────────────────────────────────┘  │
│                                                  │
│ ┌─ Configurações de Delivery ─────────────────┐  │
│ │ Horários, zonas de entrega, taxas           │  │
│ │                     [Importar Configurações] │  │
│ └──────────────────────────────────────────────┘  │
│                                                  │
│ ┌─ Sincronizar Tudo ──────────────────────────┐  │
│ │ Atualizar produtos já importados com as     │  │
│ │ versões mais recentes da matriz              │  │
│ │                            [Sincronizar]     │  │
│ └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Mudanças

| Arquivo | Ação |
|---------|------|
| `supabase/functions/sync-shared-products/index.ts` | Adicionar action `import_products` (franquia puxa da matriz), `import_tables`, `import_delivery_settings`. Verificar que o caller pertence ao tenant filho. Reutilizar a lógica de clone existente |
| `src/hooks/use-franchise-import.ts` | Novo hook: detecta `tenantId` do user, busca `parent_tenant_id`, carrega produtos/mesas/delivery settings da matriz, expõe funções de import |
| `src/pages/pdv/FranchiseImport.tsx` | Nova página com cards de importação: produtos (checkbox + importar), mesas (checkbox + importar), delivery settings (botão), botão sincronizar |
| `src/pages/PDV.tsx` | Adicionar rota `/pdv/franquia` → `FranchiseImport` |
| `src/components/pdv/PDVHeaderNav.tsx` | Adicionar item "Franquia" no menu Administrador (só aparece se user tem `parent_tenant_id`) |
| `src/hooks/use-user-role.ts` | Adicionar `/pdv/franquia` nas rotas permitidas para proprietario e gerente |

### Detalhes Técnicos

**Hook `use-franchise-import.ts`:**
- Usa `useUserModules().tenantId` para pegar o tenant do user
- Busca o tenant para ver `parent_tenant_id`
- Se tem parent: busca `owner_user_id` do parent, carrega `pdv_products`, `pdv_tables`, `delivery_settings` do owner
- Funções: `importProducts(ids)`, `importTables(ids)`, `importDeliverySettings()`, `syncExisting()`
- Todas chamam a edge function `sync-shared-products` com actions específicas

**Edge function — novas actions:**
- `import_products`: recebe `target_tenant_id` (quem está importando) e `product_ids`. Valida que o caller é owner/membro do target tenant. Busca `parent_tenant_id` do target para pegar o source. Clona produtos do parent → target (mesma lógica do `share_products` mas na direção inversa)
- `import_tables`: mesma lógica para mesas
- `import_delivery_settings`: copia campos de `delivery_settings` do owner da matriz para o owner da franquia (horários, zonas, taxas, configurações)

**Visibilidade no menu:**
- O item "Franquia" só aparece no nav se o hook retorna `hasParentTenant = true`
- Roles permitidos: proprietario e gerente

