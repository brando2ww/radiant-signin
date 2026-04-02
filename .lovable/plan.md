

## Fix: Redirect goes to /pdv even for evaluation-only tenants

### Root Cause

In `use-user-modules.ts`, the `isLoading` returned only tracks the `modules` query. But there's a prior query for `tenantId` whose loading state is ignored. During login:

1. User authenticates → `useEffect` in Index.tsx fires
2. `tenantId` query is still loading → `tenantId` is `undefined`
3. `hasModule()` hits line 68: "If no tenant_id found, allow all" → returns `true`
4. `getDefaultModuleRoute()` → `hasModule('pdv')` is `true` → returns `/pdv/dashboard`
5. User gets redirected to PDV before modules even load

### Fix — 1 file change

**`src/hooks/use-user-modules.ts`**

1. Capture the `isLoading` state from the `tenantId` query (rename to `isLoadingTenantId`)
2. Combine both loading states: `const isLoading = isLoadingTenantId || isLoadingModules`
3. This ensures `Index.tsx` waits for both queries before calling `getDefaultModuleRoute()`

```ts
const { data: tenantId, isLoading: isLoadingTenantId } = useQuery({ ... });
const { data: modules = [], isLoading: isLoadingModules } = useQuery({ ... });
// ...
return {
  modules,
  isLoading: isLoadingTenantId || isLoadingModules,
  hasModule,
  getDefaultModuleRoute,
  tenantId,
};
```

No other files need changes — `Index.tsx` already checks `modulesLoading` before redirecting.

