

## Fix: Importação de PDF de NF-e

### Problemas identificados

1. **`file.text()` em PDF binário** — O hook lê o PDF como texto puro, resultando em lixo binário. Os regex do parser não encontram nada, gerando `confidence: 'low'`.
2. **Fluxo bloqueado no dialog** — Mesmo que o parse funcione, linhas 62-67 do `InvoiceUploadDialog` mostram um toast de erro e **nunca chamam `onParsed`**. O PDF é aceito visualmente mas jamais importado.

### Solução

Usar **pdf.js** (`pdfjs-dist`) no browser para extrair texto real do PDF, depois passar ao parser de regex existente. E corrigir o fluxo do dialog para aceitar dados parciais.

### Mudanças

| Arquivo | Ação |
|---------|------|
| `package.json` | Adicionar `pdfjs-dist` |
| `src/hooks/use-invoice-parser.ts` | Usar pdf.js para extrair texto antes de chamar `parseDanfePDF` |
| `src/components/pdv/invoices/InvoiceUploadDialog.tsx` | Corrigir fluxo PDF: converter `Partial<ParsedInvoice>` para `ParsedInvoice` e chamar `onParsed` com dados parciais |

### Detalhes

**1. Extração de texto com pdf.js (`use-invoice-parser.ts`)**

```typescript
import * as pdfjsLib from 'pdfjs-dist';
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const parsePDF = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(item => item.str).join(' ') + '\n';
  }
  const result = await parseDanfePDF(fullText);
  // ...
};
```

**2. Fluxo do dialog (`InvoiceUploadDialog.tsx`)**

Remover o bloqueio e converter dados parciais em `ParsedInvoice` completo com defaults para campos faltantes:

```typescript
} else if (extension === 'pdf') {
  const result = await parsePDF(file);
  if (result) {
    const fullInvoice: ParsedInvoice = {
      invoiceKey: result.invoice.invoiceKey || '',
      invoiceNumber: result.invoice.invoiceNumber || '',
      // ... defaults para campos obrigatórios
      ...result.invoice,
    };
    if (result.confidence === 'low') {
      toast.warning('Dados parciais extraídos - revise antes de confirmar');
    }
    onParsed(fullInvoice);
    onOpenChange(false);
  }
}
```

