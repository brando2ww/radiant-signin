import { ParsedInvoice, ParsedInvoiceItem } from './xml-parser';

export interface PDFParseResult {
  invoice: Partial<ParsedInvoice>;
  confidence: 'high' | 'medium' | 'low';
  warnings: string[];
}

export async function parseDanfePDF(pdfContent: string): Promise<PDFParseResult> {
  // This is a simplified parser that extracts basic information from DANFE PDF text
  // In a production environment, you would use more sophisticated OCR and pattern matching
  
  const warnings: string[] = [];
  
  // Extract invoice key (44 digits)
  const keyMatch = pdfContent.match(/(\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4}\s+\d{4})/);
  const invoiceKey = keyMatch ? keyMatch[1].replace(/\s+/g, '') : '';
  
  if (!invoiceKey) {
    warnings.push('Chave da nota fiscal não encontrada no PDF');
  }

  // Extract invoice number
  const numberMatch = pdfContent.match(/N[ºo°]\s*(\d+)/i);
  const invoiceNumber = numberMatch ? numberMatch[1] : '';

  // Extract series
  const seriesMatch = pdfContent.match(/S[ée]rie\s*[:.]?\s*(\d+)/i);
  const series = seriesMatch ? seriesMatch[1] : '';

  // Extract emission date
  const dateMatch = pdfContent.match(/Emiss[ãa]o[:\s]+(\d{2}\/\d{2}\/\d{4})/i);
  let emissionDate: Date | undefined;
  if (dateMatch) {
    const [day, month, year] = dateMatch[1].split('/');
    emissionDate = new Date(`${year}-${month}-${day}`);
  } else {
    warnings.push('Data de emissão não encontrada no PDF');
  }

  // Extract CNPJ
  const cnpjMatch = pdfContent.match(/CNPJ[:\s]+(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i);
  const cnpj = cnpjMatch ? cnpjMatch[1].replace(/\D/g, '') : '';

  if (!cnpj) {
    warnings.push('CNPJ do fornecedor não encontrado no PDF');
  }

  // Extract supplier name
  const nameMatch = pdfContent.match(/Raz[ãa]o\s+Social[:\s]+([^\n]+)/i);
  const supplierName = nameMatch ? nameMatch[1].trim() : '';

  // Extract total value
  const totalMatch = pdfContent.match(/Valor\s+Total\s+da\s+Nota[:\s]+R?\$?\s*([\d.,]+)/i);
  const totalInvoice = totalMatch ? parseFloat(totalMatch[1].replace(/\./g, '').replace(',', '.')) : 0;

  // Determine confidence based on extracted data
  let confidence: 'high' | 'medium' | 'low' = 'low';
  if (invoiceKey && cnpj && supplierName && totalInvoice > 0) {
    confidence = 'high';
  } else if (invoiceKey || (cnpj && supplierName)) {
    confidence = 'medium';
  }

  // Try to extract items (this is very basic and may not work for all DANFE formats)
  const items: ParsedInvoiceItem[] = [];
  const itemsSection = pdfContent.match(/DADOS\s+DOS\s+PRODUTOS.*?DADOS\s+ADICIONAIS/is);
  
  if (itemsSection) {
    // This is a very simplified item extraction - in production you'd need more robust parsing
    warnings.push('Extração de itens do PDF é limitada - recomenda-se usar XML para melhor precisão');
  } else {
    warnings.push('Não foi possível extrair itens do PDF - use XML para importação completa');
  }

  const invoice: Partial<ParsedInvoice> = {
    invoiceKey,
    invoiceNumber,
    series,
    emissionDate,
    supplier: cnpj && supplierName ? {
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

  return {
    invoice,
    confidence,
    warnings,
  };
}
