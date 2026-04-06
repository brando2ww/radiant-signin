

## Fase 8 - Enriquecer Relatorios (Diario, Semanal, Mensal)

### Contexto
Os relatorios atuais sao basicos comparados ao concorrente. Faltam: NPS por pergunta individual (com donuts), perfil de clientes (novos vs recorrentes), tabela paginada de respostas, secao de aniversariantes/cupons, e exportacao CSV nos relatorios diario/semanal.

### O que muda

**1. Relatorio Diario (`ReportDaily.tsx`) — reescrever**
Adicionar ao que ja existe (KPIs + hourly chart + alertas):
- **NPS Donut**: distribuicao promotores/neutros/detratores do dia
- **NPS por Pergunta**: para cada pergunta da avaliacao, calcular o NPS individual e mostrar mini-donut ou barra horizontal
- **Perfil de Clientes**: donut mostrando "Novos" vs "Recorrentes" (baseado em quantas avaliacoes o cliente tem no historico total)
- **Tabela de Respostas**: lista paginada com nome, whatsapp, media, NPS, horario — limitada a 10 por pagina
- **Exportar CSV**: botao no header

**2. Relatorio Semanal (`ReportWeekly.tsx`) — enriquecer**
Adicionar ao comparativo existente:
- **NPS Donut** da semana atual
- **NPS por Pergunta** (barras horizontais com media de cada pergunta)
- **Perfil de Clientes** (novos vs recorrentes na semana)
- **Exportar CSV**

**3. Relatorio Mensal (`ReportMonthly.tsx`) — enriquecer**
Adicionar ao que ja existe (KPIs + NPS donut + score dist + weekday + age):
- **NPS por Pergunta** (barras horizontais)
- **Perfil de Clientes** (novos vs recorrentes no mes)
- **Secao Aniversariantes do Mes**: listar clientes que fazem aniversario no mes corrente (dados de `customer_birth_date`)

### Detalhes tecnicos

- **Novos vs Recorrentes**: buscar todas as avaliacoes do usuario (sem filtro de data) para contar quantas vezes cada whatsapp aparece. Se a avaliacao no periodo e a primeira do cliente, e "Novo"; se ja tinha avaliacoes anteriores, e "Recorrente".
- **NPS por Pergunta**: usar `evaluation_answers` agrupado por `question_id`, cruzar com `question_text` (precisa de query adicional ou usar dados ja existentes no hook `useEvaluationStats`). Calcular promotores/detratores por pergunta usando os scores 1-5 (considerar 4-5 = promotor, 1-2 = detrator, 3 = neutro — adaptacao do NPS para escala 1-5).
- **Aniversariantes**: filtrar avaliacoes onde `customer_birth_date` tem mes igual ao mes corrente, deduplificar por whatsapp.
- **Paginacao da tabela**: estado local com `page` e `pageSize = 10`.

### Arquivos alterados

1. **`src/pages/pdv/evaluations/reports/ReportDaily.tsx`** — adicionar NPS donut, NPS por pergunta, perfil clientes, tabela paginada, export CSV
2. **`src/pages/pdv/evaluations/reports/ReportWeekly.tsx`** — adicionar NPS donut, NPS por pergunta, perfil clientes, export CSV
3. **`src/pages/pdv/evaluations/reports/ReportMonthly.tsx`** — adicionar NPS por pergunta, perfil clientes, secao aniversariantes

Nenhuma migracao de banco necessaria. Todos os dados ja estao disponiveis via hooks existentes.

