

## Fase 6 - Melhorar Roletas (CouponsRoulettes)

### O que muda
Transformar a pagina de roletas de uma visao somente-leitura para uma interface de edicao completa com cores customizaveis, preview interativo usando as cores reais dos premios, e campo de cooldown.

### Migracao de banco de dados
Adicionar 3 colunas na tabela `evaluation_campaigns`:
- `wheel_primary_color` (text, default `#1a1a2e`)
- `wheel_secondary_color` (text, default `#722F37`)
- `roulette_cooldown_hours` (integer, default `0` — 0 = sem cooldown)

### Arquivos alterados

**1. Migracao SQL** — nova migracao para adicionar as 3 colunas

**2. `src/integrations/supabase/types.ts`** — atualizar Row/Insert/Update de `evaluation_campaigns` com os novos campos

**3. `src/hooks/use-evaluation-campaigns.ts`** — incluir os novos campos no `useUpdateCampaign`

**4. `src/components/pdv/evaluations/RoulettePreview.tsx`** — aceitar props `primaryColor` e `secondaryColor` opcionais (fallback para as cores atuais hardcoded), e usar as cores reais de cada premio (`prize.color`) nos segmentos ao inves de alternancia fixa

**5. `src/pages/pdv/evaluations/coupons/CouponsRoulettes.tsx`** — reescrever o card de cada campanha para incluir:
- Inputs de cor primaria/secundaria (color pickers) com save automatico
- Input de cooldown em horas
- Toggle de ativo/inativo da roleta
- Preview da roleta usando cores customizadas e cores dos premios
- Edicao inline dos premios (editar/deletar) + botao de adicionar premio
- Reutilizar `PrizeDialog` para criar/editar premios

### Detalhes tecnicos
- As cores dos segmentos da roleta usarao `prize.color` (ja existe no schema) — as cores primaria/secundaria servem como fallback para premios sem cor definida e para a borda/centro
- O cooldown sera salvo em horas no campo `roulette_cooldown_hours` e verificado na pagina publica (se o cliente ja girou dentro do periodo, nao pode girar novamente)
- O `useUpdateCampaign` ja suporta campos extras via cast `as any`, mas vamos tipar corretamente

### Resultado visual
Cada card de campanha mostra: formulario de configuracao a esquerda (cores, cooldown, lista de premios editavel) + preview interativo da roleta a direita, atualizado em tempo real conforme o usuario muda cores e premios.

