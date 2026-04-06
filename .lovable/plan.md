

## Fase 7 - Aplicar Cores da Campanha na Roleta Publica + Cooldown

### Contexto
As fases 1-6 do plano competitivo foram concluidas. Esta fase conecta as configuracoes criadas na Fase 6 (cores primaria/secundaria, cooldown) com a experiencia publica do cliente.

### O que muda

**1. SpinWheel usa cores da campanha e dos premios**
O componente `SpinWheel.tsx` atualmente tem cores hardcoded (`#1a1a2e`, `#722F37`). Vamos:
- Aceitar props `primaryColor` e `secondaryColor` (vindas da campanha)
- Usar `prize.color` como cor do segmento quando disponivel, com fallback para alternancia primaria/secundaria
- Usar as cores da campanha na borda e centro do botao

**2. PublicEvaluation passa as cores da campanha para o SpinWheel**
O componente `PublicEvaluation.tsx` ja tem acesso ao `campaign`. Vamos:
- Extrair `wheel_primary_color` e `wheel_secondary_color` do campaign
- Passar como props para `<SpinWheel />`

**3. Implementar verificacao de cooldown**
Quando `roulette_cooldown_hours > 0`:
- Ao abrir a pagina publica, verificar no `localStorage` se existe um registro de ultimo giro para aquela campanha
- Se o tempo decorrido for menor que o cooldown, pular a roleta e ir direto ao formulario
- Apos girar, salvar o timestamp no localStorage
- Formato da chave: `roulette_last_spin_{campaignId}`

### Arquivos alterados

1. **`src/components/public-evaluation/SpinWheel.tsx`**
   - Adicionar props `primaryColor?` e `secondaryColor?`
   - Usar `prize.color || wheelColor` nos segmentos
   - Aplicar cores na borda e botao central

2. **`src/pages/PublicEvaluation.tsx`**
   - Extrair cores e cooldown do campaign
   - Passar `primaryColor`/`secondaryColor` para SpinWheel
   - Logica de cooldown: verificar localStorage antes de mostrar roleta, salvar timestamp apos giro

### Detalhes tecnicos
- O cooldown e verificado client-side via localStorage (simples e sem custo de banco). Nao impede fraude, mas atende ao caso de uso normal de limitar giros repetidos do mesmo dispositivo.
- As cores dos segmentos priorizam `prize.color` (definido por premio), com fallback para alternancia `primaryColor`/`secondaryColor`.

