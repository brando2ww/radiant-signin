

# Reformular Pagina de Equipe (Colaboradores)

Transformar o `OperatorsManager` de lista simples + modal em uma pagina rica com cards visuais, indicadores, filtros, drawer lateral para criar/editar, e perfil com abas de desempenho e historico.

## Mudancas no banco de dados

### Migration: Novas colunas em `checklist_operators`

```sql
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS avatar_color text DEFAULT '#6366f1';
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS default_shift text DEFAULT 'variavel';
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS hired_at date DEFAULT NULL;
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;
ALTER TABLE checklist_operators ADD COLUMN IF NOT EXISTS last_access_at timestamptz DEFAULT NULL;
```

Campos: cor do avatar, turno padrao, data de entrada, observacao interna, ultimo acesso.

## Arquivos novos

### 1. `src/components/pdv/checklists/team/TeamIndicators.tsx`

4 mini-cards no topo:
- Total de colaboradores ativos
- Melhor score da semana (nome + pontuacao)
- Menor score da semana (nome + pontuacao)
- Quantos acessaram hoje (baseado em `last_access_at`)

Usa dados de `useChecklistOperators` + `useOperatorRanking`.

### 2. `src/components/pdv/checklists/team/TeamFilters.tsx`

Barra de filtros:
- Busca por nome (input)
- Filtro setor (select)
- Filtro nivel de acesso (select)
- Filtro status (ativo/inativo)
- Ordenar por: nome, score, ultimo acesso, setor

### 3. `src/components/pdv/checklists/team/OperatorCard.tsx`

Card visual por colaborador:
- Avatar circular com iniciais + cor por setor
- Nome, cargo, setor com icone, badge de nivel de acesso
- Score da semana em destaque (numero grande)
- Status ativo/inativo, ultimo acesso
- Card esmaecido se inativo
- `onClick` abre perfil drawer

### 4. `src/components/pdv/checklists/team/OperatorDrawer.tsx`

Substitui `OperatorDialog`. Sheet lateral (side="right") com:
- Campos existentes melhorados: nome, cargo, setor (botoes visuais), PIN (com gerar aleatorio e revelar/ocultar), nivel de acesso (3 cards visuais com descricao), status toggle
- Campos novos: cor do avatar (circulos coloridos), turno padrao (4 botoes), data de entrada (date picker), observacao interna (textarea)
- Rodape fixo: Cancelar + Salvar

### 5. `src/components/pdv/checklists/team/OperatorProfileDrawer.tsx`

Drawer de perfil ao clicar no card. 3 abas:

**Aba Perfil**: dados cadastrados + botao editar (abre OperatorDrawer)

**Aba Desempenho**: score atual (numero grande), taxa conclusao no prazo, total checklists mes, badges. Reutiliza dados de `useOperatorRanking` + `useScoreHistory`.

**Aba Historico**: lista das ultimas execucoes (nome checklist, data, status). Query paginada em `checklist_executions` filtrada por `operator_id`, limit 30.

## Arquivos editados

### 6. `src/components/pdv/checklists/OperatorsManager.tsx`

Reescrita completa:
- Importa `TeamIndicators`, `TeamFilters`, grid de `OperatorCard`, drawers
- Gerencia estados de filtro, busca, ordenacao, drawers abertos
- Estado vazio: ilustracao + texto convidativo + botao cadastrar no centro
- Mantem `AlertDialog` de exclusao

### 7. `src/hooks/use-checklist-operators.ts`

- Incluir novas colunas nas mutations de create/update (`avatar_color`, `default_shift`, `hired_at`, `notes`)

### 8. `src/components/pdv/checklists/OperatorDialog.tsx`

Removido (substituido por `OperatorDrawer`).

## Resumo tecnico

- **1 migration** (5 colunas novas em `checklist_operators`)
- **5 arquivos novos** (TeamIndicators, TeamFilters, OperatorCard, OperatorDrawer, OperatorProfileDrawer)
- **2 arquivos editados** (OperatorsManager, use-checklist-operators)
- **1 arquivo removido** (OperatorDialog)
- **0 dependencias novas** (Sheet/Tabs/Calendar ja existem)

