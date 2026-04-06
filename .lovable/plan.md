

## Mover Personalização da Campanha para Configurações de Avaliação

### O que muda
A aba "Personalização" sai de dentro da campanha (`CampaignDetail`) e vai para a página de Configurações (`/pdv/avaliacoes/configuracoes`). As configurações visuais (logo, cor de fundo, mensagens) passam a ser globais do usuário, não por campanha.

### Arquivos a editar

**1. `src/pages/evaluations/EvaluationsSettings.tsx`**
- Importar e renderizar `CampaignPersonalization` adaptado (ou criar uma nova seção inline) com os cards de Logo, Cor de Fundo e Mensagens
- Em vez de usar `campaignId`, salvar em `business_settings` via `useBusinessSettings` (que já tem `logo_url`, `welcome_message`, `thank_you_message`, `primary_color`)
- Adicionar seção "Personalização da Pesquisa" antes dos cards de Perfil/Aparência

**2. `src/components/pdv/evaluations/CampaignPersonalization.tsx`**
- Refatorar para não depender de `campaignId` — usar `useBusinessSettings` em vez de `useUpdateCampaign`
- Campos: `logo_url`, `background_color` (precisará ser adicionado ao `business_settings` ou usar `primary_color`), `welcome_message`, `thank_you_message`

**3. `src/components/pdv/evaluations/CampaignDetail.tsx`**
- Remover a aba "Personalização" do TabsList e o TabsContent correspondente
- Remover import de `CampaignPersonalization`

**4. `src/pages/PublicEvaluation.tsx`**
- Alterar a leitura de `bgColor`, `logoUrl`, `welcomeMsg`, `thankYouMsg` de `campaign` para `business_settings` do user (usando `usePublicBusinessSettings(campaign.user_id)`)

### Detalhes técnicos
- `business_settings` já possui `logo_url`, `welcome_message`, `thank_you_message` — reutilizamos esses campos
- Para `background_color`, verificaremos se a coluna existe na tabela; se não, usaremos `primary_color` ou adicionaremos via migration
- A roleta e perguntas continuam por campanha; apenas branding/mensagens ficam globais

