

## Fix: Adicionar entrada "delivery-proprio" no IntegrationDetail

### Problema
O `IntegrationsHub` navega para `/pdv/integracoes/delivery-proprio`, mas o `IntegrationDetail.tsx` não tem uma entrada `"delivery-proprio"` no objeto `integrations` (termina na linha 244 com `whatsapp` sendo o último). Resultado: "Integração não encontrada."

### Solução

| Arquivo | Acao |
|---------|------|
| `src/pages/pdv/IntegrationDetail.tsx` | Adicionar entrada `"delivery-proprio"` no registry com dados do módulo Delivery Velara |

### Detalhes da entrada

- **title**: "Delivery Próprio"
- **logo**: `velaraLogo` (já importado no IntegrationsHub, precisa importar aqui)
- **category**: "Delivery"
- **description**: Texto sobre o sistema de delivery integrado da Velara
- **features**: 6 cards (Cardápio online, Pedidos em tempo real, Gestão de entregadores, Cupons de desconto, Personalização visual, Relatórios de delivery)
- **steps**: 4 passos (Ativar módulo, Configurar cardápio, Personalizar, Compartilhar link)
- **component**: Link/redirect para `/pdv/delivery` ou um card informativo simples que redireciona ao módulo Delivery
- **docsUrl**: Link interno para `/pdv/delivery/configuracoes`

Será necessário criar um componente simples `DeliveryProprioIntegrationCard` que mostra status da integração e botões para acessar o módulo Delivery, ou reutilizar um componente existente que redirecione.

