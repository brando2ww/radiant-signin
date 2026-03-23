import { ParsedInvoice, ParsedInvoiceItem } from './xml-parser';

export interface PDFParseResult {
  invoice: Partial<ParsedInvoice>;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

/**
 * Extrai CNPJ emitente, número da NF e série diretamente da chave de acesso de 44 dígitos.
 * Formato: UF(2) AAMM(4) CNPJ(14) MOD(2) SERIE(3) NUM(9) ...
 */
function parseAccessKey(key: string) {
  if (key.length !== 44) return null;
  const cnpjRaw = key.substring(6, 20);
  const cnpj = cnpjRaw.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  const series = String(parseInt(key.substring(22, 25), 10));
  const invoiceNumber = String(parseInt(key.substring(25, 34), 10));
  return { cnpj, cnpjRaw, series, invoiceNumber };
}

export async function parseDanfePDF(pdfContent: string): Promise<PDFParseResult> {
  const warnings: string[] = [];

  // Extract invoice key (44 digits, possibly with spaces)
  const keyMatch = pdfContent.match(/(\d[\d\s]{42}\d)/);
  let invoiceKey = '';
  if (keyMatch) {
    const candidate = keyMatch[1].replace(/\s+/g, '');
    if (candidate.length === 44) {
      invoiceKey = candidate;
    }
  }

  if (!invoiceKey) {
    warnings.push('Chave da nota fiscal não encontrada no PDF');
  }

  // Fallback data from access key
  const keyData = invoiceKey ? parseAccessKey(invoiceKey) : null;

  // Extract invoice number — multiple patterns
  const numberPatterns = [
    /N[ºo°\.]\s*[:.]?\s*(\d{1,9})/i,
    /N[ÚU]MERO\s*[:.]?\s*(\d{1,9})/i,
    /NF-?e?\s*[:.]?\s*N?[ºo°]?\s*(\d{1,9})/i,
  ];
  let invoiceNumber = '';
  for (const pat of numberPatterns) {
    const m = pdfContent.match(pat);
    if (m) { invoiceNumber = m[1]; break; }
  }
  if (!invoiceNumber && keyData) {
    invoiceNumber = keyData.invoiceNumber;
  }

  // Extract series
  const seriesMatch = pdfContent.match(/S[ÉEée]rie\s*[:.]?\s*(\d+)/i);
  const series = seriesMatch ? seriesMatch[1] : (keyData?.series || '');

  // Extract emission date
  const datePatterns = [
    /Emiss[ãa]o[:\s]*(\d{2}\/\d{2}\/\d{4})/i,
    /DATA\s*(?:DE\s*)?EMISS[ÃA]O[:\s]*(\d{2}\/\d{2}\/\d{4})/i,
    /(\d{2}\/\d{2}\/\d{4})\s*(?:HORA|DATA)/i,
  ];
  let emissionDate: Date | undefined;
  for (const pat of datePatterns) {
    const m = pdfContent.match(pat);
    if (m) {
      const [day, month, year] = m[1].split('/');
      emissionDate = new Date(`${year}-${month}-${day}`);
      break;
    }
  }
  if (!emissionDate) {
    warnings.push('Data de emissão não encontrada no PDF');
  }

  // Extract CNPJ — find any formatted CNPJ
  const cnpjPatterns = [
    /CNPJ[:\s]*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i,
    /(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/,
  ];
  let cnpj = '';
  for (const pat of cnpjPatterns) {
    const m = pdfContent.match(pat);
    if (m) { cnpj = m[1].replace(/\D/g, ''); break; }
  }
  if (!cnpj && keyData) {
    cnpj = keyData.cnpjRaw;
  }
  if (!cnpj) {
    warnings.push('CNPJ do fornecedor não encontrado no PDF');
  }

  // Extract supplier name — multiple patterns
  const namePatterns = [
    /(?:Raz[ãa]o\s*Social|RAZAO\s*SOCIAL|Nome\s*\/\s*Raz[ãa]o\s*Social)[:\s]+([^\n]{3,60})/i,
    /NOME\s*FANTASIA[:\s]+([^\n]{3,60})/i,
  ];
  let supplierName = '';
  for (const pat of namePatterns) {
    const m = pdfContent.match(pat);
    if (m) { supplierName = m[1].trim(); break; }
  }

  // Extract total value — multiple patterns
  const totalPatterns = [
    /(?:VALOR\s*TOTAL\s*DA\s*NOTA|V\.?\s*TOTAL\s*DA\s*NF|TOTAL\s*DA\s*NOTA)[:\s]*R?\$?\s*([\d.,]+)/i,
    /(?:VALOR\s*TOTAL)[:\s]*R?\$?\s*([\d.,]+)/i,
  ];
  let totalInvoice = 0;
  for (const pat of totalPatterns) {
    const m = pdfContent.match(pat);
    if (m) {
      totalInvoice = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
      if (totalInvoice > 0) break;
    }
  }

  // Determine confidence
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (invoiceKey && cnpj && supplierName && totalInvoice > 0) {
    confidence = 'high';
  } else if (invoiceKey || (cnpj && totalInvoice > 0)) {
    confidence = 'medium';
  }

  const items: ParsedInvoiceItem[] = extractItemsFromText(pdfContent);
  if (items.length === 0) {
    warnings.push('Nenhum item encontrado no PDF - recomenda-se usar XML para melhor precisão');
  } else {
    warnings.push(`${items.length} item(ns) extraído(s) do PDF - revise os dados antes de confirmar`);
  }

  const invoice: Partial<ParsedInvoice> = {
    invoiceKey,
    invoiceNumber,
    series,
    emissionDate,
    supplier: cnpj || supplierName ? {
      cnpj,
      name: supplierName,
    } : undefined,
    totals: totalInvoice > 0 ? {
      products: totalInvoice,
      tax: 0,
      invoice: totalInvoice,
    } : undefined,
    items,
  };

  console.log('[PDF Parser] Resultado:', { confidence, invoiceKey: !!invoiceKey, cnpj: !!cnpj, supplierName: !!supplierName, totalInvoice, invoiceNumber });

  return {
    invoice,
    confidence,
    warnings,
  };
}
