

## Correção: Salvar automaticamente ao remover bairro

### Problema
Ao remover um bairro, só o estado local é atualizado (`setZones`). A remoção não é persistida no banco — ao recarregar a página, o bairro reaparece porque o `useEffect` recarrega os dados do Supabase.

### Solução
Chamar `updateSettings.mutate()` automaticamente dentro do `handleRemoveZone`, salvando as zonas atualizadas no banco imediatamente após a remoção.

### Arquivo alterado

**`src/components/delivery/settings/DeliverySettings.tsx`**
- Alterar `handleRemoveZone` para, além de atualizar o estado local, também chamar `updateSettings.mutate` com o array filtrado (sem o bairro removido), persistindo a mudança no Supabase instantaneamente.

```typescript
const handleRemoveZone = (index: number) => {
  const updatedZones = zones.filter((_, i) => i !== index);
  setZones(updatedZones);
  updateSettings.mutate({
    delivery_zones: updatedZones as any,
  });
};
```

