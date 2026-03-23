

## Fix: Upload de logotipo da campanha não funciona

### Problema

O bucket `business-logos` tem RLS que exige que a pasta (primeiro segmento do path) seja o `auth.uid()` do usuário:

```sql
WITH CHECK (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

Mas o `useSupabaseUpload` está configurado com `folder: "campaigns"`, gerando path `campaigns/campaign-xyz.png` — que é rejeitado pela policy.

### Solução

Mudar o folder do upload para usar o `user.id`, garantindo que o path fique `{userId}/campaign-{campaignId}.ext`, compatível com a RLS existente.

### Mudança

**`src/components/pdv/evaluations/CampaignPersonalization.tsx`**:
- Importar `useAuth` para obter `user.id`
- Mudar `useSupabaseUpload({ bucket: "business-logos", folder: "campaigns" })` para `useSupabaseUpload({ bucket: "business-logos", folder: user?.id })`

Isso é a única mudança necessária. A página pública já lê `logoUrl` corretamente da campanha.

