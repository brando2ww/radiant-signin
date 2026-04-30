O texto está cortando porque está centralizado em um único ponto da fatia, e palavras longas como "01 Drink Sugestão" ultrapassam a borda da roleta. Vou corrigir mudando a forma como o texto é ancorado e aumentando o tamanho da prévia.

Alterações:

1. `src/components/pdv/evaluations/RoulettePreview.tsx` — reescrita do posicionamento do label
   - Ancorar o texto logo após o miolo (24% do raio) com `textAnchor="start"`, deixando o texto crescer ao longo do raio em direção à borda. Isso aproveita praticamente todo o comprimento da fatia (~72% do raio) em vez de centralizá-lo em um ponto.
   - No lado esquerdo da roleta (90°–270°), ancorar na borda externa (96% do raio) e aplicar flip de 180°, para o texto continuar lendo do centro para fora sem ficar de cabeça para baixo.
   - Calcular truncamento com base em dois orçamentos:
     - Orçamento radial: comprimento útil dividido pelo tamanho da fonte (≈0.55× por caractere).
     - Orçamento angular: largura da fatia em graus.
     - Usa o menor dos dois e adiciona reticências quando ultrapassar.
   - Aumentar levemente a faixa de fonte (9–13px) para ficar mais legível.

2. `src/pages/pdv/evaluations/coupons/CouponsRoulettes.tsx` — aumentar o tamanho da prévia
   - Trocar `size={220}` por `size={280}` para ganhar mais espaço para os labels.

3. `src/components/pdv/evaluations/CampaignRoulette.tsx` — manter consistência
   - Trocar `size={220}` por `size={280}` no preview da configuração de campanha.

Resultado esperado: nomes longos como "01 Drink Sugestão", "01 Harm. Espumante" e "01 Sequência" caberão dentro da fatia, sem cortar na borda da roleta.