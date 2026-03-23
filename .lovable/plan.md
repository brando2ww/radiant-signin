

## Fix: Extrair produtos/itens do PDF da NF-e (DANFE)

### Problema

O parser de PDF (`pdf-parser.ts`) **nunca extrai itens**. Na linha 130, cria um array vazio e adiciona um warning. Não existe lógica para parsear a tabela de produtos do DANFE.

### Solução

Implementar extração de itens da tabela de produtos do DANFE via regex. O layout típico da tabela de produtos em um DANFE tem colunas: Código, Descrição, NCM, CST, CFOP, UN, QTD, Valor Unit, Valor Total.

### Mudança

**`src/lib/invoice/pdf-parser.ts`** — adicionar lógica de extração de itens:

1. Buscar linhas que contenham padrão de item (código numérico + descrição + unidade + quantidade + valores)
2. Usar regex para capturar: nome do produto, unidade, quantidade, valor unitário, valor total
3. Padrões comuns em DANFE:
   - Linhas com sequência: `CÓDIGO DESCRIÇÃO NCM ... UN QTD VL_UNIT VL_TOTAL`
   - Itens aparecem após header da tabela e antes dos totais
4. Regex robusto que capture linhas com valores monetários e unidades (UN, KG, CX, PCT, LT, etc.)

A extração de itens do PDF não será 100% precisa (por isso existe o wizard de revisão), mas capturará o máximo possível para o usuário revisar e ajustar.

### Estratégia de parsing

Buscar padrões de linhas que contenham:
- Uma unidade de medida conhecida (UN, KG, CX, PCT, LT, ML, G, etc.)
- Seguida de valores numéricos (quantidade, valor unitário, valor total)
- Texto antes da unidade = nome do produto

Isso funciona porque a tabela de produtos do DANFE segue um padrão estruturado onde cada linha de item contém esses elementos.

