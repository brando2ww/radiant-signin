

## Adicionar campos fiscais ao cadastro de produtos

### Contexto
A tabela `pdv_products` não possui campos fiscais. Para emissão de NF-e/NFC-e, cada produto precisa de NCM, CFOP, CEST, CST/CSOSN, alíquotas de ICMS/PIS/COFINS, origem e unidade tributável.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `supabase migration` | Adicionar colunas fiscais à tabela `pdv_products` |
| `src/hooks/use-pdv-products.ts` | Atualizar interface `PDVProduct` com campos fiscais |
| `src/components/pdv/ProductDialog.tsx` | Adicionar 4a aba "Fiscal" com os campos |
| `src/integrations/supabase/types.ts` | Atualizar tipos gerados |

### Colunas novas em `pdv_products`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `ncm` | TEXT | Nomenclatura Comum do Mercosul (8 dígitos) |
| `cest` | TEXT | Código Especificador da Substituição Tributária |
| `cfop` | TEXT | Código Fiscal de Operações (ex: 5102) |
| `origin` | TEXT | Origem da mercadoria (0-8) |
| `cst_icms` | TEXT | Código de Situação Tributária ICMS |
| `csosn` | TEXT | CST para Simples Nacional |
| `icms_rate` | NUMERIC(5,2) | Alíquota ICMS % |
| `pis_cst` | TEXT | CST do PIS |
| `pis_rate` | NUMERIC(5,2) | Alíquota PIS % |
| `cofins_cst` | TEXT | CST do COFINS |
| `cofins_rate` | NUMERIC(5,2) | Alíquota COFINS % |
| `tax_unit` | TEXT | Unidade tributável (UN, KG, L, etc.) |
| `ean` | TEXT | Código de barras EAN/GTIN |

Todos nullable — não obrigatórios no cadastro, mas necessários para emissão fiscal.

### UI — Nova aba "Fiscal"

O `TabsList` passa de 3 para 4 abas: **Informações Básicas | Preços | Receita | Fiscal**

A aba Fiscal terá campos organizados em seções:
- **Identificação**: EAN, NCM, CEST
- **ICMS**: Origem, CST/CSOSN, CFOP, Alíquota ICMS
- **PIS/COFINS**: CST PIS, Alíquota PIS, CST COFINS, Alíquota COFINS
- **Unidade Tributável**: UN, KG, L, etc.

Campos com `Select` para origem (0-8) e inputs de texto/número para os demais. Todos opcionais.

