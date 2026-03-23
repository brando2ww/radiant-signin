

## Arquitetura de Franquias (Multi-Tenant Hierárquico)

### Conceito

Criar uma hierarquia de tenants onde um **tenant matriz** pode ter **tenants filhos** (franquias). O tenant matriz pode compartilhar produtos e mesas com suas franquias, e o super admin gerencia tudo.

```text
┌──────────────────────────────────────────────┐
│            SUPER ADMIN                       │
├──────────────────────────────────────────────┤
│                                              │
│  ┌─────────────────┐                         │
│  │ Burger King HQ   │ ← tenant matriz       │
│  │ (parent_id=null) │                        │
│  └────────┬────────┘                         │
│           │                                  │
│     ┌─────┴──────┐                           │
│     │            │                           │
│  ┌──▼────┐  ┌───▼────┐                      │
│  │ BK     │  │ BK     │ ← tenants filhos    │
│  │ Moema  │  │ Pinhei.│   (franquias)        │
│  └────────┘  └────────┘                      │
│                                              │
│  Produtos compartilhados: Matriz → Filhos    │
│  Mesas compartilhadas: Layout copiado        │
└──────────────────────────────────────────────┘
```

### Mudanças no Banco de Dados

**1. Adicionar `parent_tenant_id` na tabela `tenants`:**
```sql
ALTER TABLE public.tenants
  ADD COLUMN parent_tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL;
```

**2. Tabela `shared_products` — catálogo compartilhado pela matriz:**
```sql
CREATE TABLE public.shared_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  target_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  source_product_id uuid NOT NULL REFERENCES public.pdv_products(id) ON DELETE CASCADE,
  cloned_product_id uuid REFERENCES public.pdv_products(id) ON DELETE SET NULL,
  sync_enabled boolean DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_product_id, target_tenant_id)
);
```

**3. Tabela `shared_table_layouts` — layouts de mesa compartilhados:**
```sql
CREATE TABLE public.shared_table_layouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  target_tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  source_table_id uuid NOT NULL REFERENCES public.pdv_tables(id) ON DELETE CASCADE,
  cloned_table_id uuid REFERENCES public.pdv_tables(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(source_table_id, target_tenant_id)
);
```

Ambas com RLS para super admins + owners dos tenants envolvidos.

### Mudanças no Frontend

| Arquivo | Acao |
|---------|------|
| `supabase migration` | Adicionar `parent_tenant_id` em tenants, criar tabelas `shared_products` e `shared_table_layouts` com RLS |
| `src/hooks/use-tenants.ts` | Adicionar: `fetchChildTenants(parentId)`, `linkChildTenant(parentId, childId)`, `unlinkChildTenant(childId)`, `shareProducts(sourceTenantId, targetTenantId, productIds)`, `shareTableLayout(sourceTenantId, targetTenantId, tableIds)`, `syncSharedProducts(sourceTenantId)` |
| `src/pages/super-admin/TenantDetail.tsx` | Adicionar seção "Franquias" com: lista de filhos, botão vincular tenant existente, botão desvincular. Adicionar seção "Compartilhar Produtos" com seleção de produtos da matriz e envio para franquias. Adicionar seção "Compartilhar Mesas" similar |
| `src/pages/super-admin/TenantForm.tsx` | Adicionar campo opcional "Tenant Matriz" (select de tenants existentes) para criar franquia vinculada |
| `src/components/super-admin/TenantCard.tsx` | Mostrar badge "Matriz" ou "Franquia de X" conforme `parent_tenant_id` |
| `supabase/functions/sync-shared-products/index.ts` | Edge function que copia/atualiza produtos da matriz para franquias quando sync é disparado |

### Fluxo de Compartilhamento de Produtos

1. Super admin abre tenant matriz → seção "Compartilhar Produtos"
2. Seleciona produtos do catálogo da matriz
3. Seleciona franquias destino (ou "todas")
4. Clica "Compartilhar" → edge function clona os `pdv_products` para o `user_id` do owner de cada franquia
5. Registra em `shared_products` com `sync_enabled=true`
6. Futuras edições na matriz podem ser propagadas via botão "Sincronizar" (atualiza nome, preço, categoria dos clones)

### Fluxo de Compartilhamento de Mesas

1. Super admin abre tenant matriz → seção "Compartilhar Layout de Mesas"
2. Seleciona mesas/setores
3. Seleciona franquias destino
4. Clona `pdv_tables` (número, capacidade, posição, shape, setor) para o owner de cada franquia
5. Registra em `shared_table_layouts` — não sincroniza automaticamente (layout pode divergir por loja)

### Seção "Franquias" no TenantDetail

```text
┌─────────────────────────────────────────┐
│ Franquias (3)                  [+ Add]  │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ BK Moema · CNPJ · Ativo  [Abrir ↗] │ │
│ │                      [Desvincular]  │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ BK Pinheiros · CNPJ · Ativo        │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ Compartilhar Produtos         [Enviar]  │
│ ☑ X-Burger  ☑ Batata  ☐ Milk Shake     │
│ Para: ☑ Todas  ☐ BK Moema  ☐ BK Pinh. │
├─────────────────────────────────────────┤
│ Compartilhar Mesas            [Copiar]  │
│ ☑ Mesa 1  ☑ Mesa 2  ☐ Mesa 3           │
│ Para: ☑ Todas  ☐ BK Moema              │
└─────────────────────────────────────────┘
```

### Detalhes Tecnico da Edge Function `sync-shared-products`

- Recebe `{ source_tenant_id, target_tenant_ids?: string[] }`
- Busca `shared_products` com `sync_enabled=true` para o source
- Para cada registro, busca o produto fonte e atualiza o clone (nome, preço, categoria, imagem, disponibilidade)
- Atualiza `last_synced_at`
- Verifica permissão via super_admin ou owner do tenant matriz

