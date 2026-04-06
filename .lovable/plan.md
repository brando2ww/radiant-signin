

## Segmentos Iguais na Roleta (Visual) com Probabilidade Respeitada no Sorteio

### Problema
Atualmente, o tamanho visual de cada segmento é proporcional à probabilidade. Um prêmio com 5% fica minúsculo e ilegível (ex: "Garrafa de Vinho" aparece como "Garrafa..."), enquanto prêmios com 40-50% dominam a roleta.

### Solução
Separar visual de lógica:
- **Visual**: todos os segmentos com tamanho igual (`360 / prizes.length` graus)
- **Sorteio**: `pickPrize()` já usa probabilidade ponderada — não muda nada
- **Spin landing**: calcular ângulo de parada usando os segmentos visuais (iguais), não os ponderados

### Arquivos a editar

**1. `src/components/pdv/evaluations/RoulettePreview.tsx`**
- Linha 25: trocar `deg` de proporcional à probabilidade para `360 / prizes.length`
- Remover truncamento de label (linha 54-55) — com segmentos iguais, todos terão espaço suficiente
- Font size fixo ou baseado em `360 / prizes.length`

**2. `src/components/public-evaluation/SpinWheel.tsx`**
- Linha 23: trocar `deg` para `360 / prizes.length` (visual igual)
- Linha 39-43: ajustar cálculo de `midAngle`/`targetAngle` para usar segmentos visuais iguais (já que a roleta gira visualmente com fatias iguais)
- `pickPrize()` continua usando probabilidade real — sem alteração

### Detalhes técnicos
```text
Antes (visual proporcional):
  Garrafa 5%  → fatia de 18°  → texto ilegível
  Drink  45%  → fatia de 162° → enorme

Depois (visual igual):
  Garrafa → fatia de 120° → texto legível
  Drink   → fatia de 120° → mesmo tamanho
  Sorteio → Garrafa ainda cai 5% das vezes
```

