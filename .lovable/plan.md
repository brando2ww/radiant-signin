

## Plano: Tela de Conexao WhatsApp via QR Code

### Objetivo
Criar uma tela que permita aos usuarios conectar seu WhatsApp ao sistema via escaneamento de QR Code, utilizando a Evolution API internamente via edge function.

---

### Arquitetura do Fluxo

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│  FLUXO DE CONEXAO WHATSAPP VIA QR CODE                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  1. USUARIO ACESSA TELA DE CONEXAO                                              │
│     └─> Clica em "Conectar WhatsApp"                                           │
│                                                                                 │
│  2. SISTEMA GERA QR CODE                                                        │
│     └─> Edge Function chama Evolution API                                       │
│     └─> Busca instancia do usuario (fetch-instances)                           │
│     └─> Conecta instancia (instance-connect)                                    │
│     └─> Retorna QR Code em base64                                              │
│                                                                                 │
│  3. USUARIO ESCANEIA                                                            │
│     └─> QR Code exibido na tela                                                │
│     └─> Sistema faz polling para verificar conexao                              │
│                                                                                 │
│  4. CONEXAO ESTABELECIDA                                                        │
│     └─> Status muda para "open"                                                │
│     └─> Salva conexao no banco de dados                                        │
│     └─> Exibe mensagem de sucesso                                              │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1. Alteracoes no Banco de Dados

**Nova tabela: `whatsapp_connections` (Conexoes WhatsApp dos usuarios)**

```sql
CREATE TABLE whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  instance_name TEXT NOT NULL,           -- Nome da instancia na Evolution API
  phone_number TEXT,                      -- Numero conectado
  connection_status TEXT DEFAULT 'disconnected', -- disconnected, connecting, open
  profile_name TEXT,                      -- Nome do perfil WhatsApp
  profile_picture_url TEXT,               -- Foto do perfil
  connected_at TIMESTAMPTZ,               -- Data/hora da conexao
  last_seen_at TIMESTAMPTZ,               -- Ultima atividade
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, instance_name)
);

-- RLS Policies
ALTER TABLE whatsapp_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own connections"
  ON whatsapp_connections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections"
  ON whatsapp_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections"
  ON whatsapp_connections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections"
  ON whatsapp_connections FOR DELETE
  USING (auth.uid() = user_id);
```

---

### 2. Edge Function: `whatsapp-qrcode`

**Arquivo: `supabase/functions/whatsapp-qrcode/index.ts`**

A edge function adaptara o fluxo n8n com as seguintes operacoes:

| Endpoint | Metodo | Descricao |
|----------|--------|-----------|
| `/generate` | POST | Gera QR Code para conexao |
| `/status` | POST | Verifica status da conexao |
| `/disconnect` | POST | Desconecta instancia |

**Fluxo interno da edge function:**

1. **Gerar QR Code (`/generate`):**
   - Recebe `userId` e `instanceName`
   - Chama Evolution API: `GET /instance/fetchInstances?instanceName={name}`
   - Se instancia nao existe: criar nova instancia
   - Chama Evolution API: `GET /instance/connect/{instanceName}`
   - Verifica `connectionStatus`:
     - Se `open`: retorna `{ status: "connected" }`
     - Se nao: extrai base64 do QR code e retorna `{ status: "pending", qrcode: "base64..." }`

2. **Verificar Status (`/status`):**
   - Chama Evolution API: `GET /instance/fetchInstances?instanceName={name}`
   - Retorna status atual da conexao

3. **Desconectar (`/disconnect`):**
   - Chama Evolution API: `DELETE /instance/logout/{instanceName}`
   - Atualiza banco de dados

**Codigo da edge function:**

```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')!
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')!
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const url = new URL(req.url)
  const action = url.pathname.split('/').pop()

  try {
    const { userId, instanceName } = await req.json()
    
    if (action === 'generate') {
      // 1. Buscar instancia
      const fetchResponse = await fetch(
        `${evolutionApiUrl}/instance/fetchInstances?instanceName=${instanceName}`,
        { headers: { 'apikey': evolutionApiKey } }
      )
      const instances = await fetchResponse.json()
      
      // 2. Conectar instancia (gera QR code)
      const connectResponse = await fetch(
        `${evolutionApiUrl}/instance/connect/${instanceName}`,
        { headers: { 'apikey': evolutionApiKey } }
      )
      const connectData = await connectResponse.json()
      
      // 3. Verificar status
      if (instances[0]?.instance?.status === 'open') {
        // Ja conectado
        await supabase.from('whatsapp_connections').upsert({
          user_id: userId,
          instance_name: instanceName,
          connection_status: 'open',
          connected_at: new Date().toISOString()
        })
        
        return new Response(
          JSON.stringify({ status: 'connected' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      // 4. Retornar QR code
      const base64 = connectData.base64?.split(',').pop() || connectData.base64
      
      return new Response(
        JSON.stringify({ status: 'pending', qrcode: base64 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // ... demais acoes
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

### 3. Novos Arquivos a Criar

| Arquivo | Descricao |
|---------|-----------|
| `supabase/functions/whatsapp-qrcode/index.ts` | Edge function para gerenciar conexao |
| `src/hooks/use-whatsapp-connection.ts` | Hook para gerenciar estado da conexao |
| `src/components/pdv/settings/WhatsAppConnectionCard.tsx` | Card de conexao WhatsApp |
| `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx` | Dialog com QR Code |

---

### 4. Interface - Card de Conexao WhatsApp

**Adicionar em `IntegrationsTab.tsx`:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  WhatsApp Business                                              │
│  [Badge: Conectado] ou [Badge: Desconectado]                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Se CONECTADO:                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [Foto]  Nome do Perfil                                 │   │
│  │          +55 11 99999-9999                              │   │
│  │          Conectado desde 13/01/2026 10:30              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Se DESCONECTADO:                                               │
│  Conecte seu WhatsApp para enviar cotacoes e pedidos           │
│  diretamente pelo sistema.                                      │
│                                                                 │
│                          [Conectar WhatsApp]                    │
└─────────────────────────────────────────────────────────────────┘
```

---

### 5. Interface - Dialog QR Code

```text
┌─────────────────────────────────────────────────────────────────┐
│  Conectar WhatsApp                                         [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│           ┌───────────────────────────────────┐                │
│           │                                   │                │
│           │         [QR CODE IMAGE]           │                │
│           │           256x256px               │                │
│           │                                   │                │
│           └───────────────────────────────────┘                │
│                                                                 │
│           Escaneie o QR Code com seu WhatsApp                  │
│                                                                 │
│  Instrucoes:                                                    │
│  1. Abra o WhatsApp no seu celular                             │
│  2. Toque em Configuracoes > Dispositivos conectados           │
│  3. Toque em "Conectar um dispositivo"                         │
│  4. Aponte a camera para este QR Code                          │
│                                                                 │
│  [Spinner] Aguardando conexao...                               │
│                                                                 │
│  O QR Code expira em 45 segundos                               │
│                            [Gerar novo QR Code]                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Apos conexao bem-sucedida:**

```text
┌─────────────────────────────────────────────────────────────────┐
│  Conectar WhatsApp                                         [X] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    [Icone Check Verde]                         │
│                                                                 │
│              WhatsApp conectado com sucesso!                   │
│                                                                 │
│           ┌───────────────────────────────────┐                │
│           │  [Foto]  Nome do Perfil           │                │
│           │          +55 11 99999-9999        │                │
│           └───────────────────────────────────┘                │
│                                                                 │
│                         [Concluir]                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 6. Hook: `use-whatsapp-connection.ts`

```typescript
export function useWhatsAppConnection() {
  // Estados
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'open'>('disconnected')
  const [pollingInterval, setPollingInterval] = useState<number | null>(null)
  
  // Gerar QR Code
  const generateQRCode = async () => {
    const { data } = await supabase.functions.invoke('whatsapp-qrcode/generate', {
      body: { userId: user.id, instanceName: `velara-${user.id}` }
    })
    
    if (data.status === 'connected') {
      setConnectionStatus('open')
    } else {
      setQrCode(data.qrcode)
      startPolling()
    }
  }
  
  // Polling para verificar conexao
  const startPolling = () => {
    const interval = setInterval(async () => {
      const { data } = await supabase.functions.invoke('whatsapp-qrcode/status', {
        body: { instanceName: `velara-${user.id}` }
      })
      
      if (data.status === 'open') {
        setConnectionStatus('open')
        clearInterval(interval)
      }
    }, 3000) // A cada 3 segundos
    
    // Timeout de 2 minutos
    setTimeout(() => clearInterval(interval), 120000)
  }
  
  // Desconectar
  const disconnect = async () => {
    await supabase.functions.invoke('whatsapp-qrcode/disconnect', {
      body: { instanceName: `velara-${user.id}` }
    })
    setConnectionStatus('disconnected')
  }
  
  return { qrCode, connectionStatus, generateQRCode, disconnect, isGenerating }
}
```

---

### 7. Arquivos a Modificar

| Arquivo | Alteracao |
|---------|-----------|
| `src/components/pdv/settings/IntegrationsTab.tsx` | Adicionar card de conexao WhatsApp |
| `supabase/config.toml` | Adicionar configuracao da edge function (se necessario) |

---

### 8. Consideracoes Tecnicas

**Geracao de Nome da Instancia:**
- Formato: `velara-{userId}` para garantir unicidade por usuario
- Cada usuario tera sua propria instancia na Evolution API

**Polling Strategy:**
- Intervalo: 3 segundos
- Timeout: 2 minutos (apos isso, usuario pode gerar novo QR Code)
- Limpar interval ao desmontar componente

**Tratamento de Erros:**
- QR Code expirado: botao para gerar novo
- Falha na Evolution API: mensagem de erro amigavel
- Usuario ja conectado em outra sessao: exibir aviso

**Seguranca:**
- Edge function valida userId via JWT
- RLS policies protegem dados no banco
- Secrets da Evolution API nunca expostos ao frontend

---

### Resumo das Alteracoes

| Tipo | Quantidade |
|------|------------|
| Tabelas no banco | 1 nova |
| Edge Functions | 1 nova |
| Componentes | 2 novos |
| Hooks | 1 novo |
| Arquivos modificados | 1 |

