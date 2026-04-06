

## Pins de pedidos + zoom automático no mapa de calor

### O que muda

**Arquivo: `src/components/delivery/heatmap/DeliveryHeatMap.tsx`**

1. **Adicionar markers (pins)** para cada ponto no mapa, além do heatmap layer
   - Usar `L.circleMarker` (bolinha colorida) em vez do pin padrão do Leaflet (que precisa de imagens externas)
   - Cada marker mostra um popup com: CEP, quantidade de pedidos
   - Para isso, o `HeatmapPoint` precisa incluir info extra (CEP, bairro) — expandir a interface ou passar dados adicionais

2. **Zoom automático nos pins** em vez de abrir mapa geral do Brasil
   - Atualmente o mapa inicia em `setView([-14.235, -51.9253], 4)` (visão geral do Brasil)
   - Quando há pontos, o `fitBounds` já funciona mas o zoom inicial permanece largo
   - Solução: aumentar o `maxZoom` no fitBounds e usar padding menor para dar mais zoom nos pins
   - Quando não há pontos, mostrar uma mensagem em vez do mapa vazio do Brasil

**Arquivo: `src/hooks/use-delivery-heatmap.ts`**

- Expandir `HeatmapPoint` para incluir `zipCode` e `neighborhood` para exibir no popup dos markers

### Detalhes técnicos

- Markers: `L.circleMarker([lat, lng], { radius: 8, color: '#3b82f6', fillOpacity: 0.8 })` com `.bindPopup(...)`
- FitBounds: usar `maxZoom: 15` para garantir zoom próximo quando há poucos pontos
- Limpar markers junto com o heat layer ao atualizar dados (armazenar em ref de `L.LayerGroup`)

