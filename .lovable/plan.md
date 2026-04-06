

## Mapa de Calor de Pedidos por CEP — Nova página no Delivery

### Resumo
Criar uma nova página "Mapa de Calor" dentro do módulo Delivery que exibe um mapa interativo com heatmap baseado nos CEPs dos pedidos, além de um relatório com ranking de CEPs/bairros e métricas de concentração.

### Dados disponíveis
A tabela `delivery_orders` tem `delivery_address_id` que referencia `delivery_addresses`, que contém `zip_code`, `neighborhood`, `city`, e `state`. Para construir o heatmap, vamos:
1. Buscar pedidos com seus endereços (join)
2. Agrupar por CEP
3. Converter CEPs em coordenadas via API ViaCEP + geocoding simples (centro do CEP)

### Abordagem do mapa
Usar **Leaflet** (via `react-leaflet`) com plugin de heatmap (`leaflet.heat`). É leve, gratuito, sem necessidade de API key (usa OpenStreetMap tiles). Alternativa seria Google Maps, mas requer chave de API.

### Arquivos a criar/modificar

**1. Novo: `src/pages/pdv/delivery/HeatMap.tsx`**
- Página principal com título, filtros de período (date range picker) e dois painéis:
  - **Mapa**: componente Leaflet com layer de heatmap
  - **Relatório**: tabela com ranking de CEPs (quantidade de pedidos, receita, ticket médio, % do total)
- Cards de resumo: total de CEPs atendidos, CEP com mais pedidos, bairro mais frequente, raio de cobertura

**2. Novo: `src/hooks/use-delivery-heatmap.ts`**
- Hook que busca pedidos com join na `delivery_addresses` para pegar `zip_code`, `neighborhood`, `city`
- Agrupa por CEP: conta pedidos, soma receita
- Retorna dados formatados para o mapa e para a tabela

**3. Novo: `src/components/delivery/heatmap/DeliveryHeatMap.tsx`**
- Componente do mapa Leaflet com heatmap layer
- Recebe array de `{ lat, lng, intensity }` e renderiza o mapa centrado na média das coordenadas
- Usa geocoding por CEP (ViaCEP retorna IBGE code, usaremos uma abordagem de cache/lookup para converter CEPs em lat/lng via API pública do IBGE ou nominatim)

**4. Novo: `src/components/delivery/heatmap/CEPRankingTable.tsx`**
- Tabela com colunas: CEP, Bairro, Cidade, Qtd Pedidos, Receita, Ticket Médio, % Total
- Ordenável por coluna
- Barra de progresso visual na coluna de quantidade

**5. Modificar: `src/pages/PDV.tsx`**
- Adicionar rota `delivery/mapa-calor` apontando para `HeatMap`

**6. Modificar: `src/components/pdv/PDVHeaderNav.tsx`**
- Adicionar item "Mapa de Calor" na seção Delivery com ícone `MapPin`

### Geocoding de CEPs
Para converter CEPs em coordenadas geográficas:
- Usar a API gratuita do Nominatim (OpenStreetMap): `https://nominatim.openstreetmap.org/search?postalcode={cep}&country=BR&format=json`
- Fazer cache dos resultados por CEP para evitar chamadas repetidas
- Rate limit: máximo 1 req/segundo — processar em sequência com delay
- Fallback: se não encontrar coordenadas, agrupar na tabela mas não plotar no mapa

### Dependências a instalar
- `react-leaflet` + `leaflet` (mapa base)
- `leaflet.heat` (plugin de heatmap)
- Types: `@types/leaflet`

### Fluxo do usuário
1. Acessa Delivery → Mapa de Calor
2. Vê o mapa com pontos de calor concentrados nos CEPs com mais pedidos
3. Abaixo do mapa, vê cards de resumo e tabela com ranking detalhado
4. Pode filtrar por período para analisar diferentes janelas de tempo

