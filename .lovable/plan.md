

## Plano: Corrigir Erro de Multiplas Conexoes no Banco

### Problema Identificado

O banco de dados tem **4 registros** para o mesmo usuario:

| instance_name | connection_status | connection_name |
|--------------|-------------------|-----------------|
| Loja 1 | **open** (conectado!) | Loja 1 |
| teste 1 | connecting | teste 1 |
| velara-a0f02206 | connecting | null |
| velara-a0f02206-loja-1 | connecting | Loja 1 |

O codigo usa `.single()` que falha quando ha mais de 1 registro, retornando erro `PGRST116: The result contains 4 rows`.

Isso faz com que `connection` seja `null`, e o sistema:
1. Nao detecta que ja esta conectado ("Loja 1" com status "open")
2. Mostra a tela de formulario/QR Code
3. O polling detecta a conexao e mostra "conectado com sucesso"
4. Mas como a query falhou, mostra tambem "Erro ao gerar QR Code"

---

### Solucao em 2 Partes

#### Parte 1: Limpar Registros Antigos do Banco

Deletar os 3 registros antigos e manter apenas a conexao ativa:

```sql
-- Deletar conexoes antigas (que nao estao 'open')
DELETE FROM whatsapp_connections 
WHERE user_id = 'a0f02206-4422-49b2-a7fb-91ac73c60562'
  AND connection_status != 'open';
```

#### Parte 2: Corrigir a Query para Pegar a Conexao Correta

**Arquivo:** `src/hooks/use-whatsapp-connection.ts`

Modificar a query para:
1. Nao falhar se houver multiplos registros
2. Priorizar conexoes com status 'open'
3. Se nao tiver 'open', pegar a mais recente

**De:**
```typescript
const { data, error } = await (supabase as any)
  .from('whatsapp_connections')
  .select('*')
  .eq('user_id', user.id)
  .single();
```

**Para:**
```typescript
const { data, error } = await supabase
  .from('whatsapp_connections')
  .select('*')
  .eq('user_id', user.id)
  .order('connection_status', { ascending: false }) // 'open' vem primeiro
  .order('updated_at', { ascending: false }) // mais recente primeiro
  .limit(1)
  .maybeSingle();
```

A ordenacao por `connection_status` descendente faz com que 'open' venha antes de 'connecting' e 'disconnected' alfabeticamente.

---

### Fluxo Corrigido

```text
Usuario abre dialog
        │
        ▼
Query busca conexoes ordenadas (open primeiro)
        │
        ▼
┌─ Tem conexao 'open'? ─┐
│                       │
Sim                     Nao
│                       │
▼                       ▼
Mostra tela           Mostra formulario
"Conectado"           para nova conexao
```

---

### Arquivos a Modificar

| Acao | Local |
|------|-------|
| Executar SQL | Deletar 3 conexoes antigas do banco |
| Editar | `src/hooks/use-whatsapp-connection.ts` - modificar query |

---

### Bonus: Prevenir Duplicatas Futuras

Na Edge Function, antes de criar nova conexao, deletar conexoes antigas do usuario:

```typescript
// Antes de criar nova conexao, limpar conexoes antigas
await supabase.from('whatsapp_connections')
  .delete()
  .eq('user_id', userId)
  .neq('connection_status', 'open');
```

