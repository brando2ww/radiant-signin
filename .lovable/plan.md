

## Sistema de Cobertura de Entrega por CEP (Híbrido)

### Visão Geral
Substituir o sistema atual de "Zonas de Entrega" (bairros manuais) por um sistema híbrido com 3 seções:

1. **Cobertura por Cidade/Bairros** — Selecionar UF → Cidade (API IBGE), depois adicionar bairros com taxa individual
2. **Exclusões** — Bloquear CEPs específicos ou buscar ruas pelo nome (via ViaCEP) para impedir entregas

### APIs Externas (gratuitas, sem chave)
- **IBGE**: `servicodados.ibge.gov.br/api/v1/localidades/estados/{UF}/municipios` — lista municípios por estado
- **ViaCEP**: `viacep.com.br/ws/{UF}/{cidade}/{rua}/json/` — busca ruas por nome (retorna CEP, bairro, logradouro)

### Mudanças no Banco de Dados
**Migração** — Adicionar 2 colunas JSONB na tabela `delivery_settings`:
- `excluded_ceps` (JSONB, default `[]`) — Lista de objetos `{ cep, street, neighborhood, reason? }`
- `covered_city` (JSONB, default `null`) — Objeto `{ uf, city, ibge_code }` para a cidade selecionada

O campo `delivery_zones` existente continua sendo usado para bairros com taxas.

### Mudanças na Interface (`DeliverySettings.tsx`)

**Card 1 — Configurações Gerais** (mantém igual)

**Card 2 — Área de Cobertura** (substitui "Zonas de Entrega")
- Select de UF (27 estados) → Select de Cidade (busca IBGE ao selecionar UF)
- Badge mostrando a cidade selecionada
- Abaixo: lista de bairros com taxa (mesmo sistema atual, mas agora contextualizado pela cidade)
- Input para adicionar bairro + taxa

**Card 3 — Exclusões de Entrega** (novo)
- Duas formas de adicionar exclusão:
  - **Por CEP**: Input com máscara CEP → ao digitar 8 dígitos, busca ViaCEP e mostra endereço completo → confirmar bloqueio
  - **Por Rua**: Input de busca de rua → seleciona cidade configurada → busca ViaCEP por nome → lista resultados → selecionar ruas para bloquear (adiciona todos os CEPs daquela rua)
- Lista de exclusões com chips removíveis mostrando CEP + rua/bairro
- Campo opcional de motivo por exclusão

### Arquivos Alterados

1. **Migração SQL** — Adicionar `excluded_ceps` e `covered_city` em `delivery_settings`
2. **`src/hooks/use-delivery-settings.ts`** — Expandir interfaces `DeliverySettings` com novos campos; parsear JSON
3. **`src/hooks/use-ibge-lookup.ts`** (novo) — Hook para buscar estados e municípios via API IBGE
4. **`src/components/delivery/settings/DeliverySettings.tsx`** — Refatorar UI com os 3 cards: Configurações Gerais, Área de Cobertura (UF/cidade + bairros), Exclusões (CEP + rua)
5. **`src/components/delivery/settings/ExcludedZones.tsx`** (novo) — Componente para gerenciar a lista de CEPs/ruas bloqueados

### Fluxo de Validação no Checkout
O campo `delivery_zones` (bairros atendidos) e `excluded_ceps` (bloqueios) serão verificados no checkout público quando o cliente informa o CEP de entrega — se o CEP está na lista de exclusão ou o bairro não está coberto, exibe mensagem de "Endereço fora da área de entrega".

