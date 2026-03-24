

## Atualizar Estrutura Básica do Plano de Contas

### O que muda

Substituir o seed simplificado atual por uma estrutura hierárquica completa com contas-pai (grupos) e contas-filho (sub-contas), conforme o padrão enviado.

### Mudança

**`src/hooks/use-pdv-chart-of-accounts.ts`** — reescrever `seedBasicStructure`:

1. Inserir primeiro as contas-pai (grupos: 1.000, 2.000, ..., 40.000)
2. Após inserção, buscar os IDs das contas-pai criadas
3. Inserir as contas-filho com `parent_id` apontando para o grupo correto

**Mapeamento de `account_type`** (compatível com constraint do DB):
- Grupos 1-13, 40 → `expense`
- Grupo 20 (Entrada de Produtos) → `cost`
- Grupo 30 (Receitas) → `revenue`

**Estrutura completa**: 14 grupos-pai + ~100 sub-contas, exatamente como listado na mensagem.

A mutation usará duas inserções sequenciais: primeiro os pais, depois os filhos com `parent_id` obtido via query dos pais recém-criados.

