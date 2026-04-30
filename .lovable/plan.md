Vou corrigir a roleta que aparece em `/pdv/avaliacoes/cupons/roletas`, pois o ajuste anterior foi aplicado na roleta pública (`SpinWheel`), mas a tela do print usa outro componente: `RoulettePreview`.

Plano de alteração:

1. Atualizar `src/components/pdv/evaluations/RoulettePreview.tsx`
   - Trocar a rotação atual do texto (`midAngleDeg`) para alinhamento radial (`midAngleDeg - 90`), igual ao comportamento corrigido na roleta pública.
   - Manter o flip automático de 180° no lado esquerdo da roleta para impedir texto de cabeça para baixo.
   - Ajustar a posição do texto para ficar mais ao centro útil da fatia, sem encostar demais no miolo nem na borda.
   - Aplicar truncamento com reticências em nomes longos para evitar que invadam fatias vizinhas.
   - Ajustar levemente o tamanho mínimo/máximo da fonte para melhorar leitura no preview pequeno de 220px.

2. Manter consistência entre telas
   - A mesma regra visual valerá para as duas áreas que usam `RoulettePreview`:
     - `Cupons > Roletas`
     - configuração de roleta por campanha, quando aplicável.

3. Não alterar dados dos prêmios
   - Os nomes como “Petit Gateau”, “01 Drink Sugestão”, etc. continuarão vindo do cadastro; a mudança será apenas na renderização para ficarem legíveis.

Após aprovado, implemento diretamente esse ajuste no componente de preview.