

## Melhorar Tela de Configuracao de Roleta + Cores Primaria/Secundaria

### Problema atual
- A roleta usa `prize.color` (cor individual do premio) como prioridade, ignorando as cores primaria/secundaria da campanha
- A UI das telas de configuracao (tanto em `/cupons/roletas` quanto dentro da campanha) e basica e pode ser muito melhorada
- O campo "Cor da Fatia" no PrizeDialog nao faz mais sentido se as cores sao controladas pela campanha

### O que muda

**1. Cores da roleta sempre usam primaria/secundaria da campanha**
- `RoulettePreview.tsx` e `SpinWheel.tsx`: remover prioridade de `prize.color`, sempre alternar entre `primaryColor` e `secondaryColor`
- `PrizeDialog.tsx`: remover o campo "Cor da Fatia" do formulario (a cor e definida pela campanha, nao pelo premio)

**2. Melhorar UI do `CouponsRoulettes.tsx` (pagina /cupons/roletas)**
- Layout mais organizado com secoes visuais claras
- Cores primaria/secundaria com preview lado a lado + hex input editavel
- Cooldown com icone e descricao mais clara
- Lista de premios com cards mais ricos (barra de probabilidade visual por premio, badge de status)
- Preview da roleta maior e mais destacado
- Separadores visuais e spacing melhorados

**3. Melhorar UI do `CampaignRoulette.tsx` (dentro da campanha)**
- Adicionar configuracao de cores primaria/secundaria e cooldown (hoje so tem toggle + lista de premios)
- Passar cores da campanha para o `RoulettePreview`
- Mesma qualidade visual da tela de roletas

### Arquivos alterados

1. **`src/components/pdv/evaluations/RoulettePreview.tsx`** — ignorar `prize.color`, sempre usar alternancia primaria/secundaria
2. **`src/components/public-evaluation/SpinWheel.tsx`** — mesma mudanca: ignorar `prize.color`
3. **`src/components/pdv/evaluations/PrizeDialog.tsx`** — remover campo de cor da fatia
4. **`src/pages/pdv/evaluations/coupons/CouponsRoulettes.tsx`** — redesign completo do card com melhor layout, hex inputs para cores, premios com cards mais ricos
5. **`src/components/pdv/evaluations/CampaignRoulette.tsx`** — adicionar secao de cores + cooldown, passar cores para preview, melhorar layout

