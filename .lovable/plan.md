

## Fix: Geocoding de CEPs brasileiros no mapa de calor

### Problema
O Nominatim não consegue resolver CEPs brasileiros (ex: `95170416`) em coordenadas. A função `geocodeCEP` retorna `null` para todos os CEPs, resultando em `points = []` e o mapa mostrando "Nenhum pedido com CEP encontrado".

### Solução
Usar uma abordagem em duas etapas:
1. **ViaCEP** (`https://viacep.com.br/ws/{cep}/json/`) para obter cidade, estado e logradouro do CEP
2. **Nominatim** com busca por cidade+estado+bairro (que funciona) em vez de postalcode (que não funciona para BR)

### Arquivo a modificar

**`src/hooks/use-delivery-heatmap.ts`** — Reescrever a função `geocodeCEP`:

```typescript
async function geocodeCEP(cep: string) {
  // 1. Buscar dados do CEP via ViaCEP
  const viaCepRes = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
  const viaCepData = await viaCepRes.json();
  if (viaCepData.erro) return null;

  // 2. Geocodificar usando cidade + estado + bairro
  const query = `${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brazil`;
  const nominatimRes = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`
  );
  // ... extrair lat/lng
}
```

Também reduzir o delay entre requests de 300ms para 200ms (ViaCEP não tem rate limit rígido, e o delay do Nominatim de 1req/s já é respeitado pelo processamento sequencial).

