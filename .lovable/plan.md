

# Centros de Produção configuráveis

Hoje as "estações de impressão" estão hardcoded em 4 valores fixos (`cozinha`, `bar`, `copa`, `confeitaria`) no `ProductDialog`, no `Kitchen.tsx` e no hook `use-pdv-kitchen.ts`. Vou substituir isso por um cadastro dinâmico de **Centros de Produção** gerenciado pelo administrador, mantendo a lógica de roteamento de itens de comanda para o centro correto.

## Conceito

- 1 comanda no garçom → vários itens
- Cada produto tem um **Centro de Produção** vinculado (ex: "Sushi Bar", "Pratos Quentes", "Entradas", "Bar")
- Ao enviar à cozinha, cada item aparece **apenas** no display/impressão do seu centro
- Cadastro flexível por estabelecimento (cada restaurante define seus próprios centros)

## Mudanças no banco

### Migration: tabela `pdv_production_centers`

```sql
CREATE TABLE public.pdv_production_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,           -- "Sushi Bar", "Pratos Quentes"
  slug text NOT NULL,           -- "sushi-bar" (usado em printer_station)
  color text DEFAULT '#3b82f6', -- cor de identificação visual
  icon text DEFAULT 'ChefHat',  -- ícone Lucide
  printer_name text,            -- nome/IP da impressora térmica (opcional)
  is_active boolean DEFAULT true,
  display_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, slug)
);
```

- RLS: dono (`user_id = auth.uid()`) + membros do estabelecimento (`is_establishment_member`)
- Seed automático na 1ª abertura: cria os 4 centros padrão (Cozinha, Bar, Copa, Confeitaria) para não quebrar produtos existentes
- Campo `pdv_products.printer_station` continua sendo `text` (compatível) — armazena o `slug` do centro

## Arquivos novos

### 1. `src/hooks/use-production-centers.ts`
Hook React Query com CRUD: `centers`, `createCenter`, `updateCenter`, `deleteCenter` (soft via `is_active`), `reorderCenters`.

### 2. `src/components/pdv/settings/ProductionCentersTab.tsx`
Nova aba em **Configurações do PDV** com:
- Lista de centros (drag-to-reorder, cor, ícone, nome, impressora, ativo/inativo)
- Botão "Novo Centro de Produção" → dialog com nome, cor, ícone, nome da impressora
- Edição inline e exclusão (com aviso se houver produtos vinculados)
- Mensagem explicativa do conceito para o usuário

### 3. `src/components/pdv/settings/ProductionCenterDialog.tsx`
Modal de criar/editar centro.

## Arquivos editados

### 1. `src/pages/pdv/Settings.tsx`
Adicionar nova aba `<TabsTrigger value="production">Centros de Produção</TabsTrigger>` (grid passa de 6 para 7 colunas).

### 2. `src/components/pdv/ProductDialog.tsx` (linhas 428-453)
Substituir o `<Select>` hardcoded por opções dinâmicas vindas do `useProductionCenters()`. Mostrar bolinha colorida ao lado do nome.

### 3. `src/pages/pdv/Kitchen.tsx` (linhas 81-98)
Substituir array hardcoded `["cozinha", "bar", "copa", "confeitaria"]` por `centers` do hook. Aplicar cor do centro nos botões/badges.

### 4. `src/hooks/use-pdv-kitchen.ts`
Continua funcionando — `printer_station` agora carrega o slug dinâmico (sem mudança estrutural).

## Resumo

- **1 migration** (1 tabela nova + seed dos 4 padrões existentes)
- **3 arquivos novos** (hook + 2 componentes)
- **3 arquivos editados** (Settings, ProductDialog, Kitchen)
- **0 dependências novas**
- Compatível com produtos já cadastrados (mantém valores `cozinha`/`bar`/`copa`/`confeitaria`)

