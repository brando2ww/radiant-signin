
## Diagnóstico Confirmado pelos Logs

### Bug 1 (Principal): O `ilike` falha por causa da formatação do telefone com traço

O número do CARLOS no banco é `(54) 99223-2827`. O código extrai os últimos 8 dígitos do número recebido (`5554992232827`) que são `92232827`. Porém o `ilike('%92232827%')` busca essa sequência dentro de `(54) 99223-2827` — e ela **não existe contiguamente**: o traço interrompe (`99223` + `-` + `2827`).

A busca deveria remover os não-dígitos do campo `phone` do banco antes de comparar, mas o `ilike` compara diretamente no valor formatado. Solução: usar os **últimos 8 dígitos do número limpo** do banco na comparação, o que requer buscar todos os fornecedores do usuário e filtrar no código (como já é feito no debug log), em vez de usar `ilike` no banco.

### Bug 2 (Consequência): O agente Velara responde ao fornecedor

Quando `findSupplierByPhone` retorna `null`, o código passa para `findUserByPhone`. Se o número do fornecedor (CARLOS) coincide com um número verificado na tabela `whatsapp_verifications`, o agente Velara responde ao fornecedor como se fosse um usuário — exatamente o que aconteceu na imagem.

A correção do Bug 1 elimina o Bug 2. Mas como salvaguarda adicional, quando a instância recebida é de uma loja (`LOJA 2`), o sistema já deve saber que qualquer mensagem recebida **naquele número de WhatsApp comercial** provavelmente é de um fornecedor ou cliente, e não do próprio usuário dono da loja — então não deve nunca acionar o agente de finanças para mensagens recebidas nas instâncias de loja.

---

## Correções

### Correção 1 — `findSupplierByPhone`: busca correta por dígitos

Em vez de `ilike` no campo formatado, buscar por `user_id` do usuário dono da instância e filtrar no lado do Deno comparando os últimos 8 dígitos do número limpo do banco com os últimos 8 do número recebido:

```typescript
async function findSupplierByPhone(phoneNumber: string, userId?: string) {
  const incomingClean = phoneNumber.replace(/\D/g, '');
  const incomingLast8 = incomingClean.slice(-8);

  // Busca todos fornecedores do usuário com telefone preenchido
  const query = supabase
    .from('pdv_suppliers')
    .select('id, name, phone, user_id')
    .not('phone', 'is', null);

  if (userId) query.eq('user_id', userId);

  const { data } = await query;

  // Compara os últimos 8 dígitos ignorando formatação
  const match = data?.find(s => {
    const clean = s.phone?.replace(/\D/g, '') || '';
    return clean.slice(-8) === incomingLast8;
  });

  return match || null;
}
```

Isso resolve o problema do traço na formatação do telefone.

### Correção 2 — Passar `userId` resolvido para `findSupplierByPhone`

Em `processMessage`, quando a instância é conhecida, resolver o `userId` **antes** de buscar o fornecedor, e passar esse `userId` para a busca — garantindo que apenas fornecedores do dono daquela instância sejam considerados:

```typescript
async function processMessage(remoteJid, messageText, instanceName) {
  const formattedPhone = formatPhoneNumber(remoteJid);
  
  // Resolve o user_id da instância primeiro
  const resolvedUserId = instanceName
    ? await resolveUserIdByInstance(instanceName)
    : null;

  // Busca fornecedor com filtro por userId da loja
  const supplier = await findSupplierByPhone(formattedPhone, resolvedUserId);
  
  if (supplier) {
    // ... processa cotação e retorna — NUNCA aciona o agente Velara
    return;
  }

  // Só aciona o agente Velara se NÃO for fornecedor
  const user = await findUserByPhone(formattedPhone);
  ...
}
```

### Correção 3 — Salvaguarda: ignorar mensagens de instância de loja que não são de usuário verificado

Quando a mensagem vem de uma instância de loja (`LOJA 2`) e o remetente não é um fornecedor reconhecido, **não acionar o agente Velara** — apenas ignorar silenciosamente. O agente de finanças só deve responder quando o usuário envia mensagem para seu próprio WhatsApp pessoal verificado, não para o número comercial da loja.

```typescript
// Se a mensagem veio de uma instância de loja (não pessoal)
// e não era um fornecedor com cotação → ignorar
if (resolvedUserId && !supplier) {
  console.log('⏭️ Mensagem recebida na instância da loja por não-fornecedor — ignorando');
  return;
}
```

---

## Arquivo a Modificar

| Arquivo | Alterações |
|---------|-----------|
| `supabase/functions/whatsapp-transactions/index.ts` | (1) Refatorar `findSupplierByPhone` para comparar últimos 8 dígitos do campo limpo; (2) Resolver `userId` antes de buscar fornecedor; (3) Adicionar salvaguarda para ignorar mensagens de instância de loja que não sejam de fornecedor |

---

## Fluxo Correto Após a Correção

```text
Mensagem recebida na LOJA 2 de (54) 99223-2827
  → Resolve userId = dono da LOJA 2
  → Busca fornecedor: limpa número do banco "(54) 99223-2827" → "54992232827" → últimos 8 "92232827"
  → Compara com últimos 8 do número recebido "5554992232827" → "92232827" ✅ MATCH!
  → Encontrou: CARLOS EDUARDO MALHEIROS BENVINDA
  → Busca cotações pendentes para CARLOS no user_id correto
  → IA extrai preços → salva em pdv_quotation_responses → confirma ao CARLOS ✅
  → NÃO aciona o agente Velara ✅
```
