

## Implementacao Completa do Sistema de Avaliações — Mapeamento por Seção

Baseado nas imagens do concorrente, aqui está o mapa completo de todas as seções e sub-páginas, com o que já existe e o que precisa ser criado.

### Estrutura da Navegação

A sub-nav atual (Dashboard, Campanhas, Relatórios, Clientes, Cupons, Configurações) passará a ter **dropdowns** nos itens que possuem sub-páginas. Ao clicar no item principal, abre a primeira sub-página; ao passar o mouse ou clicar na seta, mostra as opções.

```text
Sub-Nav com dropdowns:
Dashboard          Campanhas    Relatórios ▾    Clientes ▾    Cupons ▾    Configurações
                                 ├ Diário        ├ Painel       ├ Painel
                                 ├ Semanal       ├ Gestão       ├ Gestão
                                 └ Mensal        └ Aniversários ├ Validação
                                                                ├ Sorteio
                                                                └ Roletas
```

### Etapas de Implementação

---

**Etapa 1 — Sub-nav com dropdowns + rotas** (base para tudo)
- Refatorar `EvaluationsSubNav` para suportar dropdowns nos itens com sub-páginas
- Adicionar todas as rotas no `EvaluationsLayout`
- Criar páginas placeholder para cada sub-rota
- Rotas: `/relatorios/diario`, `/relatorios/semanal`, `/relatorios/mensal`, `/clientes/painel`, `/clientes/gestao`, `/clientes/aniversariantes`, `/cupons/painel`, `/cupons/gestao`, `/cupons/validacao`, `/cupons/sorteio`, `/cupons/roletas`

---

**Etapa 2 — Dashboard (já existe, melhorar)**
- Consolidar KPIs globais: Total Respostas, NPS Global, Média Geral, Campanhas Ativas
- Gráfico de respostas dos últimos 30 dias
- Top campanhas e alertas negativos (24h)
- *Já funcional, apenas polir*

---

**Etapa 3 — Campanhas (já existe)**
- Lista de campanhas com cards
- Detalhe com tabs internas (perguntas, roleta, personalização, leads, respostas, relatórios)
- *Já funcional*

---

**Etapa 4 — Relatórios (3 sub-páginas)**
- **Diário**: Resumo do dia atual — respostas, NPS, satisfação, alertas negativos do dia
- **Semanal**: Comparativo semana atual vs anterior — gráficos de evolução, variação percentual
- **Mensal**: Evolui o relatório existente — NPS donut, satisfação por dia, distribuição por dia da semana, faixa etária, export CSV

---

**Etapa 5 — Clientes (3 sub-páginas)**
- **Painel**: KPIs — total clientes únicos, recorrentes, média de avaliações/cliente, novos no mês
- **Gestão**: Tabela de clientes agrupados por whatsapp, com busca, última avaliação, NPS médio, total de avaliações
- **Aniversariantes**: Filtro por próximos 7/15/30 dias usando `customer_birth_date`, com contagem e lista

---

**Etapa 6 — Cupons (5 sub-páginas)**
- **Painel**: KPIs — cupons emitidos, resgatados, expirados, taxa de resgate
- **Gestão**: Lista de todos os cupons (`campaign_prize_wins`) com status, busca, filtro por campanha
- **Validação**: Campo para digitar código do cupom e validar/resgatar manualmente
- **Sorteio**: Visão de sorteios realizados (spins da roleta), com resultado e data
- **Roletas**: Visão consolidada de todas as roletas de todas as campanhas, com probabilidades e prêmios

---

**Etapa 7 — Configurações (já existe)**
- Perfil, aparência (dark mode), logout
- *Já funcional*

---

### Ordem recomendada de execução

1. **Etapa 1** — Sub-nav com dropdowns + todas as rotas/placeholders
2. **Etapa 4** — Relatórios (Diário/Semanal/Mensal) — usa hooks existentes
3. **Etapa 5** — Clientes (Painel/Gestão/Aniversariantes) — dados já existem no banco
4. **Etapa 6** — Cupons (5 sub-páginas) — dados já existem em `campaign_prize_wins`
5. **Etapa 2+3** — Polir Dashboard e Campanhas se necessário

### Resumo técnico
- **Navegação**: `EvaluationsSubNav` com `DropdownMenu` do shadcn para itens com sub-páginas
- **Rotas**: ~15 rotas novas no `EvaluationsLayout` com lazy loading
- **Banco**: Nenhuma mudança de schema necessária inicialmente (dados já existem em `customer_evaluations`, `evaluation_answers`, `campaign_prize_wins`)
- **Hooks**: Novos hooks para queries consolidadas (clientes agrupados, cupons globais, relatórios por período)
- **Charts**: Recharts (já no projeto)

Quer que eu comece pela **Etapa 1** (sub-nav com dropdowns + rotas + placeholders)?

