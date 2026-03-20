

## Melhorar Páginas Internas de Cada Integração

### Problema Atual
As páginas de detalhe de cada integração mostram apenas o card de configuração (conexão + switches). Falta contexto, introdução sobre o serviço, e apresentação completa das funcionalidades disponíveis via API.

### Solução

Reescrever o `IntegrationDetail.tsx` para que cada integração tenha uma página completa com:
1. **Header** com logo, nome, badge de status e botão conectar/desconectar
2. **Seção "Sobre"** com introdução explicativa do serviço e como ele se integra ao PDV
3. **Seção "Funcionalidades"** com grid de cards mostrando cada recurso disponível (ícone + título + descrição)
4. **Seção "Configurações"** com o card de configuração existente (conexão, switches, etc.)
5. **Seção "Como Conectar"** com passo-a-passo numerado para o usuário configurar

### Arquivos a Modificar

| Arquivo | Mudança |
|---------|---------|
| `src/pages/pdv/IntegrationDetail.tsx` | Transformar de wrapper simples para página completa com seções de introdução, funcionalidades, configurações e passo-a-passo. Usar os logos importados e dados descritivos por integração. |

### Estrutura da Página por Integração

Cada slug terá um objeto de dados com:
- `title`, `logo`, `description` (introdução longa)
- `features[]` (array de { icon, title, description })
- `steps[]` (passo-a-passo de conexão)
- `component` (card de configuração existente)
- `docsUrl` e `docsLabel`

**Exemplo - iFood:**
- Sobre: "O iFood é a maior plataforma de delivery do Brasil. Com esta integração, seu PDV recebe pedidos automaticamente..."
- Funcionalidades: Recebimento de pedidos, Sincronização de cardápio, Atualização de status, Aceite automático, Gestão de horários, Relatórios de vendas
- Como Conectar: 1. Acesse o Portal do Parceiro iFood → 2. Gere o Client ID e Secret → 3. Cole as credenciais → 4. Autorize a conexão
- Configurações: IFoodIntegrationCard existente

**Exemplo - PagSeguro:**
- Sobre: "PagSeguro é uma das maiores adquirentes do Brasil..."
- Funcionalidades: Débito/crédito, Parcelamento, Comprovante digital, Bluetooth/USB, Captura automática, Antecipação
- Como Conectar: 1. Acesse PagSeguro → Minha Conta → 2. Gere token de integração → 3. Cole no campo → 4. Conecte a maquininha

**Exemplo - Stone:**
- Sobre: "Stone é referência em soluções de pagamento para o varejo..."
- Funcionalidades: Terminal integrado, Split de pagamento, Pré-autorização, Comprovante, Dashboard financeiro, Antecipação
- Como Conectar: 1. Localize o Stone Code → 2. Informe no campo → 3. Configure captura

**Exemplo - NF Automática:**
- Sobre: "A emissão automática de NF-e e NFC-e garante conformidade fiscal..."
- Funcionalidades: NFC-e automática, NF-e, Envio SEFAZ, Cancelamento, Carta de correção, DANFE/XML, Envio por e-mail
- Como Conectar: 1. Obtenha certificado A1 (.pfx) → 2. Faça upload → 3. Configure dados fiscais → 4. Ative emissão automática

**Exemplo - Goomer:**
- Sobre: "Goomer transforma a experiência do cliente com cardápio digital interativo..."
- Funcionalidades: Cardápio digital, QR Code por mesa, Pedidos tablet, Sync automático, Personalização visual, Relatórios
- Como Conectar: 1. Acesse Goomer → Configurações → 2. Copie o token → 3. Cole e conecte

### Layout da Página

```text
┌─────────────────────────────────────────────┐
│ ← Voltar    [Logo] Nome    Badge   [Botão]  │
├─────────────────────────────────────────────┤
│ SOBRE                                       │
│ Parágrafo descritivo da integração          │
├─────────────────────────────────────────────┤
│ FUNCIONALIDADES                             │
│ ┌──────┐ ┌──────┐ ┌──────┐                 │
│ │ feat │ │ feat │ │ feat │                 │
│ └──────┘ └──────┘ └──────┘                 │
│ ┌──────┐ ┌──────┐ ┌──────┐                 │
│ │ feat │ │ feat │ │ feat │                 │
│ └──────┘ └──────┘ └──────┘                 │
├─────────────────────────────────────────────┤
│ COMO CONECTAR                               │
│ 1. Passo um                                 │
│ 2. Passo dois                               │
│ 3. Passo três                               │
├─────────────────────────────────────────────┤
│ CONFIGURAÇÕES                               │
│ [Card de configuração existente]            │
├─────────────────────────────────────────────┤
│ 📄 Link documentação oficial               │
└─────────────────────────────────────────────┘
```

