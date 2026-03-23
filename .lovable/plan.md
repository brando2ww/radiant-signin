

## Fix: PDF parser não extrai dados da NF-e

### Problema

O `pdfjs-dist` extrai texto do PDF unindo todos os itens com espaço simples (`.join(' ')`), perdendo a estrutura espacial do DANFE. Os regex do parser esperam formatação específica (ex: `CNPJ: 00.000.000/0000-00`, `Razão Social: Nome`) que não corresponde ao texto extraído.

Resultado: apenas a chave de acesso (44 dígitos agrupados) e série são encontrados. CNPJ, fornecedor, número, totais ficam vazios.

### Solução

1. **Melhorar extração de texto** — usar posição Y dos itens para reconstruir linhas, preservando layout
2. **Tornar regex mais flexíveis** — aceitar variações comuns de formatação DANFE
3. **Adicionar log de debug** — logar texto extraído para diagnóstico

### Mudanças

| Arquivo | Ação |
|---------|------|
| `src/hooks/use-invoice-parser.ts` | Melhorar `extractTextFromPDF` para agrupar por posição Y (linhas reais) |
| `src/lib/invoice/pdf-parser.ts` | Tornar regex mais robustos + extrair dados da chave de 44 dígitos + log debug |

### Detalhes

**1. Extração com layout (`use-invoice-parser.ts`)**

Agrupar itens de texto por coordenada Y (com tolerância de 2px), ordenar por X dentro de cada linha, juntar com espaço. Isso recria a estrutura visual do DANFE:

```typescript
async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  // ...
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Agrupar por Y, ordenar por X
    const lines = new Map<number, {x: number, str: string}[]>();
    content.items.forEach((item: any) => {
      const y = Math.round(item.transform[5] / 2) * 2; // tolerância 2px
      if (!lines.has(y)) lines.set(y, []);
      lines.get(y)!.push({ x: item.transform[4], str: item.str });
    });
    // Ordenar linhas de cima para baixo, itens da esquerda para direita
    [...lines.entries()]
      .sort((a, b) => b[0] - a[0])
      .forEach(([_, items]) => {
        items.sort((a, b) => a.x - b.x);
        fullText += items.map(i => i.str).join(' ') + '\n';
      });
  }
}
```

**2. Regex mais robustos (`pdf-parser.ts`)**

- CNPJ: aceitar com ou sem label, formato `XX.XXX.XXX/XXXX-XX` em qualquer contexto
- Fornecedor: buscar por `Razão Social`, `RAZAO SOCIAL`, `Nome / Razão Social`, ou texto após CNPJ
- Número NF: aceitar `Nº`, `No.`, `N.`, `NÚMERO`, `NF-e`, formatos variados
- Total: aceitar `VALOR TOTAL DA NOTA`, `V. TOTAL DA NF`, `TOTAL DA NOTA`
- **Fallback da chave**: extrair UF, CNPJ emitente, número e série diretamente dos 44 dígitos da chave (posições fixas no padrão NF-e)
- Adicionar `console.log` do texto extraído para debug

