

## Adicionar integração Rede + atualizar logos Getnet e Rede

### O que será feito

1. **Copiar os logos** enviados pelo usuário para `src/assets/integrations/` (rede-logo.png e getnet-logo atualizado)
2. **Criar componente `RedeIntegrationCard`** seguindo o mesmo padrão do `GetnetIntegrationCard` — campos de credenciais (PV, Token), ambiente, tipo de conexão, toggles de configuração (captura automática, Pix, comprovante), taxas
3. **Registrar a Rede no hub** (`IntegrationsHub.tsx`) como novo item na categoria "Maquininha"
4. **Registrar a Rede no detail** (`IntegrationDetail.tsx`) com dados de features, steps e o componente `RedeIntegrationCard`
5. **Atualizar logo da Getnet** no hub e detail para usar o novo logo enviado

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/assets/integrations/rede.png` | Copiar logo da Rede |
| `src/assets/integrations/getnet.png` | Substituir pelo novo logo Getnet |
| `src/components/pdv/integrations/RedeIntegrationCard.tsx` | Criar — mesmo padrão do GetnetIntegrationCard com credenciais Rede (PV + Token), ambiente, tipo de conexão (USB/Bluetooth/HTTP), toggles, taxas |
| `src/pages/pdv/IntegrationsHub.tsx` | Adicionar item "Rede" no array `integrations` com logo e categoria "Maquininha" |
| `src/pages/pdv/IntegrationDetail.tsx` | Adicionar entrada `rede` no record `integrations` com features (débito/crédito, Pix, e-Rede, split, comprovante, dashboard), steps de conexão e componente `RedeIntegrationCard` |

### Detalhes do RedeIntegrationCard

- **Credenciais**: PV (Ponto de Venda / Filiação), Token de autenticação
- **Ambiente**: Sandbox / Produção
- **Tipo de conexão**: USB, Bluetooth, HTTP (Wi-Fi)
- **Toggles**: Captura automática, Pix no terminal, Imprimir comprovante
- **Taxas**: Débito 1,39%, Crédito à vista 2,79%, Parcelado 2-6x 3,29%, 7-12x 3,79%, Pix 0,79%
- **Docs URL**: https://www.userede.com.br/desenvolvedores

### Features da Rede (para a page detail)

- Terminal integrado via USB, Bluetooth ou HTTP
- Débito e crédito de todas as bandeiras
- Pix no terminal via e-Rede
- Captura automática de transações
- Comprovante digital (SMS/e-mail)
- Dashboard financeiro e-Rede

