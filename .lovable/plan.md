
## Plano: Rastrear Respostas de Cotação via WhatsApp

### Problema Central

Quando o fornecedor recebe a cotação e responde via WhatsApp, o sistema não sabe:
- Que aquela resposta é referente a uma cotação específica
- Qual item da cotação está sendo respondido
- Qual valor foi informado

Atualmente, o usuário precisa registrar manualmente cada resposta no diálogo de "Registrar Resposta", sem contexto automático do que o fornecedor disse.

### Estratégia da Solução

Existem 2 abordagens complementares que serão implementadas juntas:

---

### Abordagem 1: Incluir número da cotação na mensagem enviada

Adicionar o número da cotação (ex: `COT-2026-0001`) diretamente no texto enviado ao fornecedor. Assim, quando ele responder, a mensagem de resposta deverá conter esse código, permitindo rastreamento.

Mensagem atual:
```
Olá! Estamos solicitando cotação para os seguintes produtos:

1. SALMÃO 2K: 15 kg
...
```

Mensagem melhorada:
```
Olá! [Nome do Negócio]
Ref. Cotação: COT-2026-0001

Estamos solicitando cotação para os seguintes produtos:

1. SALMÃO 2K: 15 kg

Por favor, informe para cada item:
• Preço unitário
• Validade do produto
• Prazo de entrega
• Pedido mínimo (se houver)

Aguardamos retorno até 31/01/2026.
Obrigado!
```

---

### Abordagem 2: Webhook WhatsApp com IA para interpretar respostas de fornecedores

Estender a edge function `whatsapp-transactions` (que já recebe webhooks) para detectar quando uma mensagem recebida é de um fornecedor vinculado a uma cotação pendente, e usar IA (OpenAI) para extrair os valores informados.

**Fluxo:**
```
Fornecedor responde no WhatsApp
        ↓
webhook → whatsapp-transactions
        ↓
Verificar se o remetente é um fornecedor cadastrado
        ↓  (Sim)
Verificar se existe cotação pendente/em andamento para esse fornecedor
        ↓  (Sim)
Extrair valores com IA (preço unitário, prazo, validade, etc.)
        ↓
Salvar automaticamente em pdv_quotation_responses
        ↓
Responder ao fornecedor confirmando o recebimento
        ↓
Notificar o usuário da plataforma
```

---

### Alterações Técnicas

#### 1. Atualizar `src/lib/whatsapp-message.ts`

Modificar `generateQuotationMessage` para aceitar e incluir:
- `requestNumber: string` — número da cotação (ex: `COT-2026-0001`)
- `businessName?: string` — nome do negócio (já existia)

Formato da referência no início da mensagem:
```
📋 *Ref.: COT-2026-0001*
```

#### 2. Atualizar `src/components/pdv/purchases/WhatsAppSendDialog.tsx`

Passar `quotation.request_number` para o `generateQuotationMessage` ao construir o payload de envio.

#### 3. Estender `supabase/functions/whatsapp-transactions/index.ts`

Adicionar nova lógica de processamento para mensagens de fornecedores:

**a) Verificar se remetente é fornecedor cadastrado:**
```typescript
async function findSupplierByPhone(phoneNumber: string) {
  // Busca em pdv_suppliers pelo campo phone
  // Formata o número para comparação (remove +55, DDI, etc.)
}
```

**b) Encontrar cotações pendentes para esse fornecedor:**
```typescript
async function findPendingQuotationsForSupplier(supplierId: string) {
  // Busca pdv_quotation_item_suppliers com sent_at preenchido
  // Junta com pdv_quotation_requests com status 'pending' ou 'in_progress'
  // Retorna os itens aguardando resposta desse fornecedor
}
```

**c) Usar IA para extrair valores da resposta:**
```typescript
async function extractQuotationResponse(message: string, pendingItems: QuotationItem[]) {
  // Prompt para OpenAI:
  // "Dado que o fornecedor recebeu uma cotação com os seguintes itens: [lista]
  //  e respondeu com: '[mensagem]'
  //  Extraia os preços informados por item em JSON"
  // Retorna: { items: [{ ingredient: string, unit_price: number, delivery_days: number, ... }] }
}
```

**d) Salvar respostas automaticamente:**
```typescript
// Para cada item com preço extraído:
await supabase.from('pdv_quotation_responses').insert({
  quotation_item_id: item.id,
  supplier_id: supplierId,
  unit_price: extracted.unit_price,
  total_price: extracted.unit_price * item.quantity_needed,
  delivery_days: extracted.delivery_days,
  notes: originalMessage,
})
```

**e) Responder ao fornecedor confirmando:**
```typescript
await sendWhatsAppMessage(remoteJid,
  `✅ Obrigado! Recebemos sua cotação para:\n` +
  `• Salmão 2K: R$ 45,00/kg\n\n` +
  `Retornaremos em breve com a decisão.`
)
```

---

### Alterações por Arquivo

| Arquivo | Alteração |
|---------|-----------|
| `src/lib/whatsapp-message.ts` | Adicionar `requestNumber` ao `generateQuotationMessage` |
| `src/components/pdv/purchases/WhatsAppSendDialog.tsx` | Passar `request_number` para a geração da mensagem |
| `supabase/functions/whatsapp-transactions/index.ts` | Adicionar detecção de fornecedores + extração IA de cotações |

---

### Comportamento Final

1. Mensagem enviada ao fornecedor inclui `📋 Ref.: COT-2026-0001`
2. Fornecedor responde livremente, ex: *"Salmão: R$ 45/kg, entrego em 2 dias"*
3. Webhook recebe a mensagem e identifica que o número é do fornecedor X
4. Sistema encontra a cotação pendente COT-2026-0001 com itens aguardando resposta
5. IA extrai preços e prazos da mensagem livre
6. Resposta é salva automaticamente em `pdv_quotation_responses`
7. Fornecedor recebe confirmação automática
8. Usuário vê a resposta registrada no painel de comparação de cotações

---

### Consideração Importante sobre o Webhook

A edge function `whatsapp-transactions` atualmente só processa mensagens de usuários **verificados** (tabela `whatsapp_verifications`). A nova lógica precisará de uma verificação paralela: se o remetente NÃO é um usuário verificado mas É um fornecedor cadastrado com cotação pendente, processar como resposta de cotação — sem interferir no fluxo atual de transações financeiras.
