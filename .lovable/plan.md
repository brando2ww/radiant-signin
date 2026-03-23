
## Corrigir WhatsApp travado em “Aguardando conexão”

### Diagnóstico
Pelos logs e requests atuais, o problema não é mais DNS:
- A URL `https://evolution-evolution.3oz4cf.easypanel.host` responde corretamente.
- A edge function `whatsapp-qrcode` está sendo chamada com sucesso no endpoint `/status`.
- O retorno fica sempre em `"status":"connecting"`.
- Existe um registro no banco em `whatsapp_connections` com `instance_name = "Teste"` e `connection_status = "connecting"`.

Hoje o fluxo fica preso porque:
1. o frontend só faz polling de status e nunca se recupera de uma instância “travada”;
2. a edge function não trata bem instância antiga/stale na Evolution API;
3. se a Evolution não devolver `open`, o código mantém `connecting` indefinidamente;
4. o status não tenta devolver um QR novo nem informa motivo do bloqueio.

## O que vou implementar

### 1) Blindar a edge function `whatsapp-qrcode`
Arquivo:
- `supabase/functions/whatsapp-qrcode/index.ts`

Mudanças:
- Criar helper para chamadas à Evolution API com:
  - `response.ok` obrigatório
  - log de status HTTP e corpo retornado
  - tratamento consistente de JSON inválido
- Usar `encodeURIComponent(instanceName)` nas rotas com nome da instância.
- Normalizar leitura do status da instância para cobrir variações da Evolution API.
- Se existir instância em `connecting`/stale:
  - remover também na Evolution API, não só no banco
  - recriar do zero antes de gerar novo QR.
- No `generate`:
  - criar instância limpa
  - tentar obter QR tanto na resposta do `create` quanto em chamadas subsequentes ao `connect`
  - se a API responder sem QR (`count: 0`), fazer pequenas tentativas server-side antes de devolver erro.
- No `status`:
  - se continuar `connecting`, tentar buscar QR atualizado novamente via `connect`
  - se encontrar QR, devolver `{ status: 'pending', qrcode }`
  - se a instância não existir mais, devolver `disconnected`
  - se passar do tempo esperado sem conexão, atualizar banco para `disconnected` em vez de ficar eterno em `connecting`.

### 2) Ajustar o hook do frontend para reagir ao QR renovado e erros reais
Arquivo:
- `src/hooks/use-whatsapp-connection.ts`

Mudanças:
- Permitir que `checkStatus()` receba também `qrcode` retornado pelo endpoint de status.
- Se o status vier com QR novo, atualizar o QR mostrado no modal.
- Parar de engolir erro silenciosamente:
  - mostrar toast com mensagem útil
  - encerrar polling quando houver erro fatal.
- Se a conexão ficar presa por muito tempo:
  - encerrar o polling
  - informar que a sessão expirou/travou
  - pedir para gerar novamente.

### 3) Melhorar o modal para recuperação clara
Arquivo:
- `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

Mudanças:
- Mostrar estado mais claro quando:
  - QR expirou
  - instância travou
  - houve erro na Evolution API
- Adicionar ação explícita para:
  - “Gerar novo QR Code”
  - opcionalmente “Reiniciar conexão”
- Evitar que o modal fique eternamente em “Aguardando conexão...” sem feedback.

### 4) Tratar instância antiga “Teste” que já ficou presa
Fluxo de recuperação embutido:
- Ao gerar novamente, se houver instância não aberta para o mesmo usuário/nome:
  - apagar da Evolution
  - apagar/sobrescrever no banco
  - recriar limpa
Isso resolve o estado atual travado.

## Resultado esperado
Depois da correção:
1. o QR aparece normalmente;
2. ao escanear, o status muda para `open`;
3. se a Evolution travar, o sistema tenta se recuperar;
4. se não conseguir, o usuário recebe erro claro e consegue regenerar a conexão;
5. não haverá mais conexão infinita em `connecting`.

## Detalhes técnicos
Arquivos a alterar:
- `supabase/functions/whatsapp-qrcode/index.ts`
- `src/hooks/use-whatsapp-connection.ts`
- `src/components/pdv/settings/WhatsAppQRCodeDialog.tsx`

Fluxo novo:
```text
Gerar QR
  -> limpar instância stale na Evolution
  -> criar instância
  -> buscar QR
  -> frontend exibe QR
  -> polling de status
      -> se open: conectar
      -> se pending + qrcode novo: atualizar QR
      -> se stale/erro: encerrar com mensagem e opção de regenerar
```
