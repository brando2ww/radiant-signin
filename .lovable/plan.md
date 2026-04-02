

## Redesign UX da Página Pública de Avaliação

### Objetivo
Melhorar a experiência do cliente na página pública de avaliação para aumentar a taxa de preenchimento, com design minimalista e estratégias de engajamento.

### Estratégias de UX para conversão

1. **Progress indicator** — Barra de progresso sutil no topo mostrando % de completude do formulário (incentiva conclusão)
2. **Micro-interações** — Estrelas com animação de escala/cor ao selecionar; NPS buttons com feedback visual mais rico
3. **Ordem invertida** — Começar pelas perguntas de avaliação (engaja primeiro) e pedir dados pessoais por último (reduz atrito inicial)
4. **Feedback positivo progressivo** — Mensagens de encorajamento conforme preenche ("Quase lá!", "Falta pouco!")
5. **Visual minimalista premium** — Cards com glassmorphism sutil, tipografia mais refinada, espaçamento generoso

### Mudanças técnicas

**`src/pages/PublicEvaluation.tsx`**
- Reordenar seções: Avaliação (estrelas) → NPS → Dados pessoais
- Adicionar barra de progresso animada no topo da página
- Mensagens de encorajamento dinâmicas baseadas no progresso
- Animações de entrada por seção (staggered fade-in)
- Estrelas maiores com animação de pulse ao clicar
- NPS redesenhado: números em grid mais elegante com labels coloridos (detratores/neutros/promotores)
- Botão de submit com estado visual que "desperta" conforme formulário é completado
- Tipografia: títulos mais leves, subtítulos com mais breathing room
- Cards com `backdrop-blur` e bordas sutis (glassmorphism leve)
- Seção de dados pessoais com texto explicativo mais amigável ("Para entregarmos seu prêmio" / "Para personalizarmos sua experiência")

**`src/components/public-evaluation/PrizeResult.tsx`**
- Animação de confetti sutil (CSS-only) no resultado do prêmio
- Layout mais celebratório e visual

### Detalhes de implementação

| Elemento | Antes | Depois |
|----------|-------|--------|
| Ordem | Dados → Perguntas → NPS | Perguntas → NPS → Dados |
| Progresso | Nenhum | Barra animada no topo |
| Estrelas | 36px estáticas | 40px com pulse animation |
| NPS | Grid simples | Grid com gradiente de cor e labels |
| Cards | `bg-card border shadow-sm` | `bg-white/80 backdrop-blur border-white/20` |
| Submit | Sempre visível | Aparece com destaque quando formulário completo |
| Feedback | Nenhum | Mensagens dinâmicas de progresso |

Nenhuma tabela ou hook de dados será alterada — apenas UI/UX.

