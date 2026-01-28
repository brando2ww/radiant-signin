

## Plano: Melhorar Tela de Sucesso com Imagem e Botao de Desconectar

### Problema Atual
1. A tela de sucesso mostra apenas um icone CheckCircle2 simples
2. Nao existe botao para desconectar o WhatsApp
3. A funcionalidade de desconexao (`disconnect`) existe no hook mas nao esta exposta no dialog
4. A action `disconnect` atual apenas faz logout (mantem a instancia) - precisa tambem deletar a instancia e o registro do banco

---

### Alteracoes Necessarias

#### 1. Atualizar a Tela de Sucesso no Dialog

**Arquivo:** `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

Melhorar a visualizacao de sucesso com:
- Icone maior e mais visual (CheckCircle2 com fundo verde)
- Informacoes do perfil conectado (nome, foto, numero)
- Botao "Desconectar" em vermelho (destructive)
- Botao "Concluir" para fechar

**Layout proposto:**
```text
┌──────────────────────────────────────┐
│  WhatsApp Conectado          [X]     │
├──────────────────────────────────────┤
│                                      │
│       ┌─────────────────────┐        │
│       │                     │        │
│       │   ✓  (verde grande) │        │
│       │                     │        │
│       └─────────────────────┘        │
│                                      │
│    WhatsApp conectado com sucesso!   │
│                                      │
│    ┌─────────────────────────────┐   │
│    │ [Avatar]  Eduardo Brando    │   │
│    │           +55 54 991831920  │   │
│    └─────────────────────────────┘   │
│                                      │
│  ┌────────────────────────────────┐  │
│  │         Concluir               │  │ (primary)
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │      Desconectar WhatsApp      │  │ (destructive/outline)
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

---

#### 2. Criar Nova Action `delete` na Edge Function

**Arquivo:** `supabase/functions/whatsapp-qrcode/index.ts`

A action `disconnect` atual apenas faz logout. Precisamos de uma action `delete` que:
1. Faz logout da instancia na Evolution API
2. Deleta a instancia na Evolution API
3. Remove o registro do banco de dados

```typescript
// ACTION: Delete (remove instance completely)
if (action === 'delete') {
  console.log(`[whatsapp-qrcode] Deleting instance: ${instanceName}`)

  // 1. Logout from Evolution API
  await fetch(`${evolutionApiUrl}/instance/logout/${instanceName}`, {
    method: 'DELETE',
    headers: { 'apikey': evolutionApiKey }
  })

  // 2. Delete instance from Evolution API
  await fetch(`${evolutionApiUrl}/instance/delete/${instanceName}`, {
    method: 'DELETE',
    headers: { 'apikey': evolutionApiKey }
  })

  // 3. Delete from database
  await supabase.from('whatsapp_connections')
    .delete()
    .eq('user_id', userId)
    .eq('instance_name', instanceName)

  return new Response(
    JSON.stringify({ status: 'deleted' }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}
```

---

#### 3. Atualizar o Hook para Usar `delete`

**Arquivo:** `src/hooks/use-whatsapp-connection.ts`

Modificar a mutation `disconnect` para chamar a action `delete` em vez de `disconnect`:

```typescript
const disconnect = useMutation({
  mutationFn: async () => {
    if (!user) throw new Error('User not authenticated');
    if (!connection?.instance_name) throw new Error('No connection found');

    const { data, error } = await supabase.functions.invoke('whatsapp-qrcode/delete', {
      body: { userId: user.id, instanceName: connection.instance_name }
    });

    if (error) throw error;
    return data;
  },
  onSuccess: () => {
    toast.success('WhatsApp desconectado e instância removida');
    queryClient.invalidateQueries({ queryKey: ['whatsapp-connection'] });
  },
  onError: (error) => {
    console.error('Error deleting connection:', error);
    toast.error('Erro ao desconectar');
  }
});
```

---

#### 4. Expor `disconnect` no Dialog

**Arquivo:** `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

Adicionar o `disconnect` e `isDisconnecting` do hook e usar no botao:

```tsx
const {
  connection,
  isConnected,
  qrCode,
  isPolling,
  isGenerating,
  isDisconnecting, // ← Adicionar
  generateQRCode,
  disconnect,      // ← Adicionar
  stopPolling,
  setQrCode
} = useWhatsAppConnection();

// No botao de desconectar:
<Button 
  variant="outline"
  onClick={() => disconnect()}
  disabled={isDisconnecting}
  className="w-full text-destructive hover:text-destructive"
>
  {isDisconnecting ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      Desconectando...
    </>
  ) : (
    'Desconectar WhatsApp'
  )}
</Button>
```

---

### Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx` | Melhorar tela de sucesso, adicionar botao desconectar |
| `src/hooks/use-whatsapp-connection.ts` | Mudar disconnect para chamar action `delete` |
| `supabase/functions/whatsapp-qrcode/index.ts` | Adicionar action `delete` que remove instancia e registro |

---

### Fluxo de Desconexao

```text
Usuario clica "Desconectar"
         │
         ▼
┌─────────────────────────┐
│ Edge Function: delete   │
└─────────────────────────┘
         │
    ┌────┴────┬────────────┐
    ▼         ▼            ▼
 Logout    Delete       Delete DB
 (API)   Instance(API)   Record
         │
         ▼
┌─────────────────────────┐
│ Query invalidada        │
│ UI atualiza para        │
│ "Desconectado"          │
└─────────────────────────┘
```

