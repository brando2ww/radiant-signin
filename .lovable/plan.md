

## Plano: Criar Instância Antes de Gerar QR Code

### Problema Atual
O fluxo atual:
1. Usuário clica em "Gerar QR Code"
2. Sistema cria instância automaticamente com nome fixo (`velara-{userId}`)
3. Tenta gerar QR Code imediatamente

O que o usuário quer:
1. Usuário digita **nome da conexão** e **número de telefone**
2. Sistema cria a instância na Evolution API
3. Após criar com sucesso, gera o QR Code

---

### Alterações Necessárias

#### 1. Modificar o Dialog de Conexão

**Arquivo:** `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

Adicionar um formulário inicial com dois campos antes de mostrar o QR Code:

```text
┌──────────────────────────────────────┐
│  Conectar WhatsApp                   │
├──────────────────────────────────────┤
│                                      │
│  Nome da conexão:                    │
│  ┌────────────────────────────────┐  │
│  │ Ex: Loja Principal             │  │
│  └────────────────────────────────┘  │
│                                      │
│  Número do WhatsApp:                 │
│  ┌────────────────────────────────┐  │
│  │ (11) 99999-9999                │  │
│  └────────────────────────────────┘  │
│                                      │
│  ┌────────────────────────────────┐  │
│  │     Conectar WhatsApp          │  │
│  └────────────────────────────────┘  │
│                                      │
└──────────────────────────────────────┘
```

Após clicar em "Conectar WhatsApp":
1. Salva os dados no banco (whatsapp_connections)
2. Cria a instância na Evolution API
3. Só então mostra o QR Code

---

#### 2. Atualizar o Hook de Conexão

**Arquivo:** `src/hooks/use-whatsapp-connection.ts`

Modificar a mutation `generateQRCode` para aceitar parâmetros:
- `connectionName`: Nome personalizado da conexão
- `phoneNumber`: Número de telefone do WhatsApp

O `instanceName` será gerado como: `velara-{userId}-{slug do connectionName}`

---

#### 3. Atualizar a Edge Function

**Arquivo:** `supabase/functions/whatsapp-qrcode/index.ts`

Modificar a action `generate` para:
1. Receber `connectionName` e `phoneNumber` no body
2. Criar o registro no banco com esses dados ANTES de criar na Evolution API
3. Só gerar QR Code após instância criada com sucesso

---

### Novo Fluxo

```text
Estado Inicial
     │
     ▼
┌─────────────┐
│ Formulário  │  ← Nome + Número
└─────────────┘
     │
     ▼
┌─────────────┐
│ Criar       │  ← Evolution API: instance/create
│ Instância   │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Gerar       │  ← Evolution API: instance/connect
│ QR Code     │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Aguardar    │  ← Polling: status
│ Conexão     │
└─────────────┘
     │
     ▼
┌─────────────┐
│ Conectado!  │
└─────────────┘
```

---

### Arquivos a Modificar

| Arquivo | Alteração |
|---------|-----------|
| `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx` | Adicionar formulário com campos nome/número antes do QR |
| `src/hooks/use-whatsapp-connection.ts` | Aceitar parâmetros na mutation generateQRCode |
| `supabase/functions/whatsapp-qrcode/index.ts` | Receber e salvar dados adicionais |

---

### Detalhes Técnicos

**Dialog - Estados:**
1. `form` - Mostra formulário de nome + número
2. `generating` - Criando instância e gerando QR
3. `qrcode` - Mostrando QR Code para escanear
4. `connected` - Conexão estabelecida

**Validações:**
- Nome da conexão: obrigatório, mínimo 3 caracteres
- Número: obrigatório, formato telefone brasileiro

**Banco de dados:**
- Adicionar coluna `connection_name` na tabela `whatsapp_connections` para armazenar o nome amigável

