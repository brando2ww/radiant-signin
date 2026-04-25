## Remover indicadores de tempo de espera no painel Salão

Os dados de tempo (urgência por minutos, "Aguardando há X min" e "Média de espera") não são relevantes para o caixa. Remover toda essa lógica.

### Mudanças

**`src/components/pdv/cashier/SalonQueueCard.tsx`**
- Remover a linha "Aguardando há X min" e o cálculo de urgência (variáveis `urgency`, `waitingText`).
- Remover ring/borda destacada por urgência.
- Remover prop `waitingMinutes` e imports não usados (`Clock`, `AlertTriangle`).

**`src/components/pdv/cashier/SalonQueuePanel.tsx`**
- Remover o trecho "· Média de espera: X min" e a memoização `avgWaitMin`.
- Remover o cálculo de `minutes` e a prop `waitingMinutes` passada ao `SalonQueueCard`.
- Manter o sort "Mais antigas primeiro" (continua funcionando via `oldestAt` dos grupos).
- Remover o pin de "alertas (>10min)" no topo, já que urgência por tempo deixa de existir.
- Remover o intervalo `setInterval` de 60s usado só para re-render do contador (e o estado `tick`).