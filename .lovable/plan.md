

## Analise Competitiva e Plano de Melhorias por Fases

### O que o concorrente tem (baseado nas screenshots)

**1. Painel de Cupons** (screenshots 1 e 7)
- 6 KPIs: Total, Utilizados, Ativos, Vencidos, Utilização (%), Vencendo
- 4 graficos: Tipos de cupons (donut), Dia do Vencimento (bar por dia da semana), Dias utilizados (bar por semana do mes), Perfil etario dos clientes que usaram cupom (bar por faixa etaria)

**2. Relatorio Diario** (screenshot 2)
- KPIs de respostas, NPS, media de horario
- Grafico de respostas por hora do dia
- Donut de perfil de clientes (novos vs recorrentes)
- Donuts de perguntas de multipla escolha
- NPS Geral com donut + tabela paginada de respostas
- NPS por pergunta individual (cada uma com donut)
- Secoes de aniversariantes e cupons no rodape

**3. Painel de Clientes** (screenshot 3)
- 3 KPIs: Total, Engajados, Taxa Engajamento
- 6 graficos: Total de Clientes por semana do mes, Horario do Cadastro (bar por hora), Dias da Semana, Engajados por dia da semana, Perfil do Cliente (faixa etaria), Aniversariantes por mes

**4. Gestao de Clientes** (screenshot 4)
- Tabela com: Nome, Empresa, E-mail, Telefone, Data Aniversario, Cadastro, Total Respostas, Ultimo Contato
- Botoes de acao: WhatsApp, Detalhes, Editar, Deletar
- Busca, paginacao, importar, adicionar

**5. Aniversariantes** (screenshot 5)
- Tabela com: Nome, E-mail, Telefone, Data Aniversario, Cadastro, Ultimo Contato, Acoes
- Botoes: WhatsApp, Bonus (gerar cupom), Detalhes
- Modal de selecao de bonus para gerar cupom

**6. Gestao de Cupons** (screenshot 8)
- Tabela com: Codigo, Cliente, Empresa, Premio, Data Utilizacao, Data Criacao, Ultimo Contato, Validade, Status, Acoes
- Botoes: Visualizar cupom, Detalhes, WhatsApp, Validar, Deletar
- Modal de preview do cupom com download

**7. Roletas** (screenshot 9)
- Listagem de roletas com edicao
- Campos: Nome, Tempo para rodar novamente, Limite de giros, Pesquisa vinculada, Cor primaria/secundaria, Probabilidade customizada
- Preview da roleta ao lado

---

### Plano de Implementacao por Fases

#### FASE 1 - Enriquecer Painel de Cupons
**Arquivo:** `src/pages/pdv/evaluations/coupons/CouponsPanel.tsx`

O que adicionar ao painel atual (que ja tem 4 KPIs + 2 graficos):
- Adicionar KPIs: "Ativos", "Vencendo" (proximos 7 dias)
- Adicionar graficos: Dia do Vencimento (bar por dia da semana), Perfil Etario dos clientes (bar por faixa etaria calculada do birth_date), Distribuicao por semana do mes
- Renomear: "Resgatados" -> "Utilizados" para diferenciar do concorrente

#### FASE 2 - Enriquecer Painel de Clientes
**Arquivo:** `src/pages/pdv/evaluations/clients/ClientsPanel.tsx`

Adicionar graficos que faltam:
- Horario de Cadastro (bar por hora do dia)
- Distribuicao por dia da semana
- Perfil do Cliente (faixa etaria)
- Aniversariantes por mes (bar 12 meses)
- KPI "Taxa de Engajamento"

#### FASE 3 - Melhorar Gestao de Clientes
**Arquivo:** `src/pages/pdv/evaluations/clients/ClientsManagement.tsx`

Adicionar colunas que faltam:
- E-mail (campo nao existe no schema atual - pode ficar vazio)
- Data de Aniversario
- Data de Cadastro (primeira avaliacao)
- Ultimo Contato
- Botoes de acao: abrir WhatsApp (link wa.me), detalhes (modal com historico)

#### FASE 4 - Melhorar Aniversariantes
**Arquivo:** `src/pages/pdv/evaluations/clients/ClientsBirthdays.tsx`

Adicionar:
- E-mail na tabela
- Data de cadastro
- Ultimo contato
- Botao de WhatsApp (link direto wa.me)
- Botao de gerar bonus/cupom (modal para selecionar premio da roleta)
- Filtro por periodo com date picker

#### FASE 5 - Melhorar Gestao de Cupons
**Arquivo:** `src/pages/pdv/evaluations/coupons/CouponsManagement.tsx`

Adicionar:
- Colunas: Data de Utilizacao, Validade formatada, Ultimo Contato
- Botoes de acao: Preview do cupom (modal com visual do cupom + download), WhatsApp, Validar direto, Deletar
- Date range filter
- Exportar CSV

#### FASE 6 - Melhorar Roletas
**Arquivo:** `src/pages/pdv/evaluations/coupons/CouponsRoulettes.tsx`

Adicionar capacidade de edicao inline:
- Campos de cor primaria/secundaria por roleta (salvar no campaign)
- Preview interativo ao lado do formulario
- Campo de tempo para rodar novamente (cooldown)

---

### Nomenclaturas diferenciadas (anti-plagio)
- "Roleta" -> manter (termo generico)
- "Cupom" -> manter
- "Painel de Cupons" -> "Central de Premios"
- "Gestao dos Cupons" -> "Premios Emitidos"
- "Gestao de Clientes" -> "Base de Clientes"
- "Validacao" -> manter
- "Aniversariantes" -> manter
- "Indicador" / "Premiado" -> nao usar (termos do concorrente)

### Nota sobre fases
Cada fase e independente e pode ser implementada separadamente. Sugiro comecar pela **Fase 1** (Painel de Cupons) por ser a mais visivel e impactante com os dados ja disponiveis.

