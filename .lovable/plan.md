
## Diagnóstico Final — Por Que a Resposta Não É Reconhecida

### O Que os Logs Revelam

Analisando os logs da edge function e os dados do banco, foram identificadas **2 causas raízes independentes**:

---

### Causa 1: Webhook da instância `LOJA 2` não está registrado na Evolution API

O banco de dados confirma:
- Instância conectada: `LOJA 2` (status: `open`)
- A cotação foi enviada pela `LOJA 2` com `sent_at: 2026-02-20 13:20:03`
- O código de registro automático do webhook foi adicionado nesta última atualização — mas a cotação **já tinha sido enviada antes** dessa atualização

Resultado: **a `LOJA 2` nunca registrou o webhook** na Evolution API. A resposta do CARLOS chegou na `LOJA 2`, ficou lá, e nunca foi encaminhada para a edge function `whatsapp-transactions`. Os logs mostram ZERO chamadas vindas da instância `LOJA 2`.

**Solução:** Criar uma nova edge function `register-whatsapp-webhook` ou adicionar um botão nas configurações para registrar o webhook manualmente quando necessário. Também chamar o registro imediatamente ao abrir o `WhatsAppSendDialog`.

---

### Causa 2: Número do CARLOS pode estar diferente no WhatsApp

O fornecedor CARLOS está cadastrado como `(54) 99223-2827`, que normalizado seria `5499223-2827` → `54992232827`.

Para que o sistema encontre o fornecedor, os últimos 8 dígitos precisam bater. Os 8 últimos de `54992232827` são `99232827` — mas é necessário confirmar que o número do WhatsApp do CARLOS é exatamente esse.

---

### Solução: Registro Forçado do Webhook via Botão + Chamada no Envio

#### Parte 1 — Endpoint para registrar webhook manualmente

Criar a chamada de registro do webhook diretamente no frontend ao abrir o diálogo de envio via WhatsApp, garantindo que a `LOJA 2` esteja sempre configurada antes de qualquer envio.

No `WhatsAppSendDialog.tsx`, ao abrir o diálogo, chamar `supabase.functions.invoke('send-quotation-whatsapp')` ou criar um endpoint separado que registre o webhook.

**Abordagem mais simples:** Criar uma nova edge function `register-whatsapp-webhook` que recebe o `instanceName` e registra o webhook na Evolution API. Chamada ao abrir o diálogo de envio.

#### Parte 2 — Adicionar botão "Registrar Webhook" nas Configurações do WhatsApp

Em `src/components/pdv/settings/WhatsAppConnectionCard.tsx`, adicionar um botão que chama a nova edge function para registrar/atualizar o webhook da instância conectada.

Isso resolve o caso de instâncias antigas que foram conectadas antes dessa funcionalidade existir.

#### Parte 3 — Log de debug do número do fornecedor

Adicionar log mais detalhado no `findSupplierByPhone` para mostrar quais variantes de número estão sendo testadas e quais números existem no banco — facilitando identificar incompatibilidades futuras.

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `supabase/functions/register-whatsapp-webhook/index.ts` | Nova edge function que registra webhook de uma instância na Evolution API |
| `src/components/pdv/settings/WhatsAppConnectionCard.tsx` | Botão "Configurar Webhook" que chama a nova edge function |
| `src/components/pdv/purchases/WhatsAppSendDialog.tsx` | Registrar webhook automaticamente ao abrir o diálogo (antes de enviar) |
| `supabase/functions/whatsapp-transactions/index.ts` | Melhorar logs do `findSupplierByPhone` para debug de número |

---

### Fluxo Após a Correção

```text
Usuário abre diálogo de envio de cotação
  → Sistema registra automaticamente webhook da LOJA 2 na Evolution API

Usuário envia cotação para CARLOS
  → CARLOS responde no WhatsApp da LOJA 2

Evolution API (LOJA 2) → webhook → whatsapp-transactions
  → Sistema encontra CARLOS pelo telefone (54) 99223-2827
  → IA extrai o preço R$122,00/kg, validade 31/03/2026, entrega 12/03/2026, mínimo 3KG
  → Salva em pdv_quotation_responses automaticamente ✅
```

---

### Sobre o Número do CARLOS

O telefone cadastrado `(54) 99223-2827` tem DDD 54 (Serra Gaúcha). O sistema busca pelos últimos 8 dígitos `99232827`. Se o número no WhatsApp for diferente (ex: com 9 adicional ou outro formato), não será encontrado. Após o webhook da LOJA 2 estar ativo, os logs vão mostrar o número exato que chega e poderemos confirmar.
