

## Fix: Melhorar texto nas fatias da roleta e posição do botão

### Problemas identificados
1. **Texto nas fatias**: As labels estão rotacionadas no ângulo do meio do segmento, ficando de cabeça para baixo em fatias na metade inferior. O texto precisa seguir a direção radial (de fora para dentro) e usar SVG para melhor posicionamento ao longo do arco.
2. **Botão "Girar Roleta!"**: Está colado logo abaixo da roleta (`gap-6`). Precisa de mais espaçamento.

### Solução

| Arquivo | Ação |
|---------|------|
| `src/components/public-evaluation/SpinWheel.tsx` | Refatorar labels e botão |

### Mudanças detalhadas

**1. Labels nas fatias — usar SVG com texto radial**
- Substituir as `<span>` absolutas por um SVG overlay no mesmo tamanho da roleta
- Para cada segmento, desenhar o texto ao longo de uma linha radial do centro para a borda
- Rotacionar cada texto para que fique alinhado radialmente (apontando para fora do centro)
- Para fatias na metade inferior (180-360deg), inverter a rotação (+180deg) para que o texto nunca fique de cabeça para baixo
- Aumentar font-size para `11px` e usar `text-shadow` para legibilidade
- Posicionar labels a ~65% do raio (entre centro e borda)

**2. Botão "Girar Roleta!"**
- Aumentar gap de `gap-6` para `gap-10` (mais espaço entre roleta e botão)
- Adicionar `mt-4` no botão para separação extra

