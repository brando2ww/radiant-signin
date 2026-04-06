

## Melhorar Visual da Roleta

### Problemas atuais (vistos nas imagens)
1. **Cores**: Usa as cores do banco (`p.color`) que podem ser parecidas/escuras. Precisa alternar entre dois tons contrastantes (escuro/claro) como na imagem de referência.
2. **Texto**: Labels truncados e pequenos. Na referência, o texto segue radialmente do centro para fora, bem legível, com tamanho proporcional ao segmento.
3. **Preview (RoulettePreview)**: Mesmo problema de cores e texto.

### Solução

**Padrão de cores alternadas**: Ignorar `p.color` do banco para o visual da roleta. Usar dois tons alternados (ex: `#1a1a2e` escuro e `#6b2737` bordô, inspirado na referência). Manter `p.color` apenas nos badges/listagens.

**Texto radial corrigido (SpinWheel + RoulettePreview)**:
- Usar SVG `<text>` com `textAnchor="end"` posicionado radialmente
- Texto alinhado do centro para a borda, orientado ao longo do raio do segmento
- Sem truncamento agressivo — usar tamanho de fonte menor se necessário
- Garantir que texto nunca fique de cabeça para baixo (flip 180deg quando no lado inferior)

### Arquivos a editar

**1. `src/components/public-evaluation/SpinWheel.tsx`**
- Substituir `conic-gradient` com cores do banco por padrão alternado de 2 cores
- Reescrever labels SVG: texto radial alinhado do centro para fora
- Manter ponteiro, centro, dots decorativos e lógica de spin

**2. `src/components/pdv/evaluations/RoulettePreview.tsx`**
- Mesma lógica de cores alternadas
- Reescrever labels com SVG radial (como SpinWheel)
- Manter ponteiro e centro

### Detalhes técnicos
- Cores alternadas: `const WHEEL_COLORS = ["#1a1a2e", "#6b2737"]` — segmento[i] usa `WHEEL_COLORS[i % 2]`
- Labels SVG: posicionar texto a 65% do raio, rotacionar `midAngleDeg - 90` para alinhar radialmente, usar `textAnchor="middle"` 
- Font size proporcional: `Math.max(9, Math.min(14, deg / 3))` para adaptar ao tamanho do segmento
- Texto branco com `text-shadow` forte para legibilidade em ambos os tons

