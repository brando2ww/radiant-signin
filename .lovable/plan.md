

## Mover Integrações do Settings para o Hub de Integrações

### O que muda

Mover **WhatsApp Business**, **Uber Eats** e **Delivery Próprio** da aba "Integrações" das Configurações (`IntegrationsTab`) para a página principal de Integrações (`IntegrationsHub`). Remover **iFood** e **Rappi** do hub.

### IntegrationsHub — Novos cards

Adicionar 3 novos cards ao array de integrações (sem logo/imagem, usando ícone fallback):

| Card | Categoria | Ação do botão |
|------|-----------|---------------|
| WhatsApp Business | Comunicação | Acessar → `/pdv/integracoes/whatsapp` |
| Uber Eats | Delivery (Em Breve) | Botão desabilitado |
| Delivery Próprio | Delivery (Ativo) | Acessar → `/pdv/integracoes/delivery-proprio` |

Remover o card do **iFood** do array. O resultado final terá: PagSeguro, Stone, Getnet, NF Automática, Goomer, WhatsApp, Uber Eats, Delivery Próprio.

### IntegrationsTab — Simplificar

Remover WhatsApp, Uber Eats e Delivery Próprio da tab. Manter apenas iFood (que já tem lógica de conexão real com hook e dialog). A tab continua existindo para gerenciar a conexão iFood nas configurações.

### IntegrationDetail — Adicionar WhatsApp

Adicionar entrada `whatsapp` no registro de integrações do `IntegrationDetail.tsx`, renderizando o `WhatsAppConnectionCard` existente como componente de configuração.

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/pages/pdv/IntegrationsHub.tsx` | Remover iFood do array, adicionar WhatsApp/Uber Eats/Delivery Próprio com ícones (MessageCircle, Bike, Store). Cards "Em Breve" terão botão desabilitado |
| `src/components/pdv/settings/IntegrationsTab.tsx` | Remover seções WhatsApp, Rappi, Uber Eats e Delivery Próprio. Manter apenas iFood |
| `src/pages/pdv/IntegrationDetail.tsx` | Adicionar entrada `whatsapp` usando `WhatsAppConnectionCard` como componente |

Nenhuma edge function será modificada.

