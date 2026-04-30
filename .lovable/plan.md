## Problema

Os textos dos prêmios na roleta (`SpinWheel`) estão sendo desenhados **perpendicularmente ao raio** do segmento, ou seja, atravessando a fatia de um lado para o outro. Isso faz com que cada label fique "deitado" sobre a borda da fatia, dificultando a leitura — especialmente quando há vários prêmios pequenos como na imagem enviada.

## Causa

Em `src/components/public-evaluation/SpinWheel.tsx` (linhas 83-90), a rotação do texto é feita com:

```ts
let textRotation = midAngleDeg; // tangencial à circunferência
```

O ideal em uma roleta de prêmios é que o texto fique **alinhado ao raio** (lendo do centro para a borda), não tangencial.

## Correção proposta

Em `src/components/public-evaluation/SpinWheel.tsx`:

1. **Mudar a rotação do texto para `midAngleDeg - 90`**, alinhando o texto ao longo da linha radial (lendo do centro em direção à borda).
2. **Manter o flip de 180°** para os segmentos do lado esquerdo (90° < mid < 270°) para que o texto nunca apareça de cabeça para baixo.
3. **Mover o texto um pouco mais para fora** (de 58% → ~62% do raio), aproveitando o eixo radial mais longo.
4. **Aumentar levemente o tamanho mínimo da fonte** (de 10 → 11) e ajustar o divisor (`s.deg / 3.5` em vez de `/4`) para melhor legibilidade.
5. **Truncar nomes muito longos** com `…` baseado no tamanho do segmento, evitando que o texto vaze para fora da fatia.

## Resultado esperado

Cada nome de prêmio aparecerá disposto ao longo do raio da fatia, lendo naturalmente do centro para a borda, exatamente como em uma roleta de prêmios tradicional — fácil de ler em qualquer quantidade de segmentos.

Nenhuma outra parte do componente é afetada (animação, sorteio, cores e ponteiro permanecem iguais).