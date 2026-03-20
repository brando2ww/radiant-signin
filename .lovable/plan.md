

## Novo Menu "Integrações" com Páginas Dedicadas

### O Que Será Criado

Um novo menu "Integrações" na navegação do PDV com uma página dedicada contendo cards de configuração para cada integração: iFood, PagSeguro, Stone, Geração de NF Automática e Goomer. Cada integração terá status de conexão, configurações específicas e instruções de como conectar.

### Arquivos a Criar

| Arquivo | Descrição |
|---------|-----------|
| `src/pages/pdv/Integrations.tsx` | Página principal de integrações com tabs para cada serviço |
| `src/components/pdv/integrations/IFoodIntegrationCard.tsx` | Card iFood (migrado do IntegrationsTab existente) com todas as configs |
| `src/components/pdv/integrations/PagSeguroIntegrationCard.tsx` | Card PagSeguro: conexão via token, configuração de maquininha, taxas |
| `src/components/pdv/integrations/StoneIntegrationCard.tsx` | Card Stone: stone code, configuração de maquininha, split de pagamento |
| `src/components/pdv/integrations/NFAutomaticaIntegrationCard.tsx` | Card NF Automática: certificado digital, série NF, regime tributário, emissão automática |
| `src/components/pdv/integrations/GoomerIntegrationCard.tsx` | Card Goomer: token API, sincronização de cardápio, QR code de mesa |

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/components/pdv/PDVHeaderNav.tsx` | Adicionar seção "Integrações" com ícone `Plug` e item único apontando para `/pdv/integracoes` |
| `src/pages/PDV.tsx` | Importar `Integrations` e adicionar rota `integracoes` |

### Estrutura de Cada Card de Integração

Cada card seguirá o mesmo padrão:
1. **Header**: Nome, logo/ícone, badge de status (Conectado/Desconectado/Em breve)
2. **Conexão**: Campos para credenciais (token, client_id, etc.) com botão conectar/desconectar
3. **Configurações**: Switches e inputs específicos de cada integração (quando conectado)
4. **Info**: Lista de funcionalidades e link para documentação

### Detalhes por Integração

**iFood** - Migrar lógica existente do `IntegrationsTab` + hook `use-ifood-integration`
- Merchant ID, auto-accept, sync de cardápio, status do token

**PagSeguro** - Token de autenticação, configurações de maquininha
- Taxas por bandeira, parcelamento, antecipação, tipo de conexão (Bluetooth/USB)

**Stone** - Stone Code, configuração de terminal
- Split de pagamento, taxas, tipo de captura, status do terminal

**NF Automática** - Certificado A1, dados fiscais
- Série da NF, regime tributário (Simples/Lucro Presumido/Real), emissão automática ao fechar venda, CFOP padrão

**Goomer** - Token de API, sincronização
- Sync de cardápio, QR code por mesa, pedidos via tablet

### Navegação

Nova seção no header nav entre "Financeiro" e as seções existentes:
```text
Frente de Caixa | Delivery | Administrador | Financeiro | Integrações
```

Rota: `/pdv/integracoes`

