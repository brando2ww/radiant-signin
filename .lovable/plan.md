

## Adicionar Logo NF-e e Nova Integração Getnet

### Mudanças

#### 1. Copiar assets
- `user-uploads://nfe.png` → `src/assets/integrations/nfe.png`
- `user-uploads://logo-getnet.png` → `src/assets/integrations/getnet.png`

#### 2. `src/pages/pdv/IntegrationsHub.tsx`
- Importar logo NF-e e substituir `logo: null` / `icon: FileText` por `logo: nfeLogo`
- Adicionar card Getnet com `slug: "getnet"`, categoria "Maquininha", logo importado

#### 3. `src/components/pdv/integrations/GetnetIntegrationCard.tsx` (novo)
Card de configuração seguindo o padrão do Stone/PagSeguro:
- Campo Merchant ID (EC) e Client ID / Client Secret (credenciais OAuth da API Getnet)
- Seletor de ambiente (Sandbox / Produção)
- Tipo de conexão: Cloud-to-Cloud, USB/Serial ou HTTP (Wi-Fi/Ethernet) — conforme documentação da Getnet Integrated POS
- Switches: captura automática, impressão de comprovante, Pix via terminal
- Tabela de taxas informativas (débito, crédito à vista, parcelado)
- Status de conexão (badge conectado/desconectado)

**Baseado na pesquisa da API Getnet:**
- A Getnet oferece POS Integrado que comunica com automação comercial via Cloud, USB ou HTTP
- Credenciais OAuth: seller_id + client_id + client_secret obtidos no portal developers.getnet.com.br
- Suporta débito, crédito, parcelamento, Pix, pré-autorização e cancelamento

#### 4. `src/pages/pdv/IntegrationDetail.tsx`
- Importar `GetnetIntegrationCard` e `getnetLogo`
- Importar `nfeLogo` e atualizar entrada `nf-automatica` para usar `logo: nfeLogo` em vez de `fallbackIcon`
- Adicionar entrada `getnet` no objeto `integrations` com:
  - Descrição: Getnet (Santander) como adquirente com POS integrado
  - Features: Terminal integrado (Cloud/USB/HTTP), débito e crédito, Pix no terminal, parcelamento, pré-autorização, dashboard financeiro
  - Steps: 1. Acesse portal Getnet → 2. Gere Client ID e Secret → 3. Cole credenciais → 4. Configure tipo de conexão
  - Docs: `https://predocs.globalgetnet.com`

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/assets/integrations/nfe.png` | Criar (copiar upload) |
| `src/assets/integrations/getnet.png` | Criar (copiar upload) |
| `src/pages/pdv/IntegrationsHub.tsx` | Atualizar NF-e com logo, adicionar card Getnet |
| `src/components/pdv/integrations/GetnetIntegrationCard.tsx` | Criar componente |
| `src/pages/pdv/IntegrationDetail.tsx` | Adicionar Getnet, atualizar NF-e logo |

