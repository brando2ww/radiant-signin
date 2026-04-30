## Diagnóstico
A campanha lista 14 respostas e o "Total de Respostas" do Dashboard também 14, mas com pessoas diferentes. A causa, confirmada via consulta ao banco:

- `customer_evaluations.evaluation_date` é `timestamptz`.
- O Dashboard filtra por intervalo de datas usando strings `"yyyy-MM-dd"` (ex.: `endDate = "2026-04-30"`).
- Em SQL isso é interpretado como `2026-04-30 00:00:00 UTC`. Logo, `.lte("evaluation_date", "2026-04-30")` corta tudo o que aconteceu **depois da meia-noite UTC do último dia**.
- Cristiane (`30/04 01:13 UTC` = `29/04 22:13 BRT`), Larissa (`30/04 00:53 UTC` = `29/04 21:53 BRT`) e Luísa (mesmo) ficam de fora — o usuário vê "29/04" na UI da campanha, mas o filtro do dashboard descarta porque já passou da meia-noite UTC.
- O mesmo erro de borda acontece em `startDate`.

## Correção
Em `src/hooks/use-customer-evaluations.ts`, no `useCustomerEvaluations`:

- Trocar:
  ```ts
  if (filters?.startDate) query = query.gte("evaluation_date", filters.startDate);
  if (filters?.endDate)   query = query.lte("evaluation_date", filters.endDate);
  ```
- Por:
  ```ts
  if (filters?.startDate) query = query.gte("evaluation_date", `${filters.startDate}T00:00:00`);
  if (filters?.endDate)   query = query.lte("evaluation_date", `${filters.endDate}T23:59:59.999`);
  ```
  Isso compara timestamptz contra um instante explícito no fim do dia, garantindo que toda quinta-feira 29/04 (BRT) entre — e que respostas até as ~21h BRT de 30/04 também entrem quando o usuário escolher 30/04 como `endDate`. Para um filtro 100% calcado em fuso de Brasília bastaria adicionar `-03:00`, mas a maioria dos relatórios já trabalha implicitamente em horário local; a correção `T00:00:00 / T23:59:59.999` resolve o caso reportado e mantém comportamento previsível.

Aplicar a mesma correção em `useExportEvaluations` no mesmo arquivo, para que a exportação CSV fique consistente com a tela.

## Critério de aceitação
- Abrindo "Total de Respostas" no Dashboard com range padrão (últimos 30 dias), Cristiane Secrieru, Larissa Zibetti e Luísa Fransetto passam a aparecer (assim como qualquer resposta no fim do dia em horário Brasília).
- Contagens "Total de Respostas" do Dashboard e "Respostas" na tela da campanha passam a coincidir quando o range cobre o período da campanha.
- Exportação CSV reflete o mesmo conjunto.