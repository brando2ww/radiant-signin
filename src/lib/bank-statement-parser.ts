export interface ParsedTransaction {
  date: Date;
  amount: number;
  description: string;
  type: 'income' | 'expense';
}

export interface ParseResult {
  transactions: ParsedTransaction[];
  errors: string[];
  warnings: string[];
}

// Parse CSV bank statement
export function parseCSV(content: string): ParseResult {
  const result: ParseResult = {
    transactions: [],
    errors: [],
    warnings: [],
  };

  try {
    const lines = content.trim().split(/\r?\n/);
    if (lines.length < 2) {
      result.errors.push('Arquivo CSV vazio ou sem dados');
      return result;
    }

    // Try to detect the header row and column mapping
    const headerRow = lines[0].toLowerCase();
    const delimiter = headerRow.includes(';') ? ';' : ',';
    const headers = headerRow.split(delimiter).map(h => h.trim().replace(/"/g, ''));

    // Try to find column indices
    const dateIndex = headers.findIndex(h => 
      h.includes('data') || h.includes('date') || h.includes('dt')
    );
    const amountIndex = headers.findIndex(h => 
      h.includes('valor') || h.includes('amount') || h.includes('vlr') || h.includes('value')
    );
    const descriptionIndex = headers.findIndex(h => 
      h.includes('descri') || h.includes('memo') || h.includes('hist') || h.includes('description')
    );

    if (dateIndex === -1) {
      result.errors.push('Coluna de data não encontrada. Use "Data", "Date" ou "Dt"');
      return result;
    }
    if (amountIndex === -1) {
      result.errors.push('Coluna de valor não encontrada. Use "Valor", "Amount" ou "Vlr"');
      return result;
    }

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const columns = line.split(delimiter).map(c => c.trim().replace(/"/g, ''));
      
      try {
        const dateStr = columns[dateIndex];
        const amountStr = columns[amountIndex];
        const description = descriptionIndex !== -1 ? columns[descriptionIndex] : 'Transação importada';

        // Parse date (try multiple formats)
        const date = parseDate(dateStr);
        if (!date) {
          result.warnings.push(`Linha ${i + 1}: Data inválida "${dateStr}"`);
          continue;
        }

        // Parse amount (handle Brazilian format: 1.234,56)
        const amount = parseAmount(amountStr);
        if (isNaN(amount) || amount === 0) {
          result.warnings.push(`Linha ${i + 1}: Valor inválido "${amountStr}"`);
          continue;
        }

        result.transactions.push({
          date,
          amount: Math.abs(amount),
          description: description || 'Transação importada',
          type: amount < 0 ? 'expense' : 'income',
        });
      } catch (e) {
        result.warnings.push(`Linha ${i + 1}: Erro ao processar`);
      }
    }

    if (result.transactions.length === 0) {
      result.errors.push('Nenhuma transação válida encontrada no arquivo');
    }
  } catch (e) {
    result.errors.push('Erro ao processar arquivo CSV');
  }

  return result;
}

// Parse OFX bank statement
export function parseOFX(content: string): ParseResult {
  const result: ParseResult = {
    transactions: [],
    errors: [],
    warnings: [],
  };

  try {
    // OFX can be SGML (not valid XML), so we use regex to parse
    const transactionRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi;
    const matches = content.matchAll(transactionRegex);

    for (const match of matches) {
      const block = match[1];
      
      try {
        // Extract fields
        const typeMatch = block.match(/<TRNTYPE>([^<\r\n]+)/i);
        const dateMatch = block.match(/<DTPOSTED>([^<\r\n]+)/i);
        const amountMatch = block.match(/<TRNAMT>([^<\r\n]+)/i);
        const memoMatch = block.match(/<MEMO>([^<\r\n]+)/i);
        const nameMatch = block.match(/<NAME>([^<\r\n]+)/i);

        if (!dateMatch || !amountMatch) {
          result.warnings.push('Transação sem data ou valor encontrada');
          continue;
        }

        // Parse OFX date format: YYYYMMDD or YYYYMMDDHHMMSS
        const dateStr = dateMatch[1].trim();
        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1;
        const day = parseInt(dateStr.substring(6, 8));
        const date = new Date(year, month, day);

        if (isNaN(date.getTime())) {
          result.warnings.push(`Data inválida: ${dateStr}`);
          continue;
        }

        // Parse amount
        const amount = parseFloat(amountMatch[1].trim().replace(',', '.'));
        if (isNaN(amount) || amount === 0) {
          result.warnings.push(`Valor inválido: ${amountMatch[1]}`);
          continue;
        }

        // Get description from MEMO or NAME
        const description = memoMatch?.[1]?.trim() || nameMatch?.[1]?.trim() || 'Transação OFX';

        // Determine type from amount or TRNTYPE
        let type: 'income' | 'expense' = amount < 0 ? 'expense' : 'income';
        if (typeMatch) {
          const trnType = typeMatch[1].trim().toUpperCase();
          if (trnType === 'DEBIT' || trnType === 'PAYMENT') {
            type = 'expense';
          } else if (trnType === 'CREDIT' || trnType === 'DEP') {
            type = 'income';
          }
        }

        result.transactions.push({
          date,
          amount: Math.abs(amount),
          description,
          type,
        });
      } catch (e) {
        result.warnings.push('Erro ao processar transação OFX');
      }
    }

    if (result.transactions.length === 0) {
      result.errors.push('Nenhuma transação encontrada no arquivo OFX');
    }
  } catch (e) {
    result.errors.push('Erro ao processar arquivo OFX');
  }

  return result;
}

// Helper: Parse date from various formats
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const cleanDate = dateStr.trim();
  
  // Try DD/MM/YYYY or DD-MM-YYYY
  let match = cleanDate.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (match) {
    const [, day, month, year] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Try YYYY-MM-DD or YYYY/MM/DD
  match = cleanDate.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    if (!isNaN(date.getTime())) return date;
  }

  // Try native Date parsing as fallback
  const date = new Date(cleanDate);
  if (!isNaN(date.getTime())) return date;

  return null;
}

// Helper: Parse amount from various formats
function parseAmount(amountStr: string): number {
  if (!amountStr) return NaN;

  let clean = amountStr.trim();
  
  // Remove currency symbols and spaces
  clean = clean.replace(/[R$\s]/g, '');
  
  // Handle Brazilian format (1.234,56) vs US format (1,234.56)
  const hasCommaSeparator = clean.includes(',');
  const hasDotSeparator = clean.includes('.');
  
  if (hasCommaSeparator && hasDotSeparator) {
    // Check which comes last to determine format
    const lastComma = clean.lastIndexOf(',');
    const lastDot = clean.lastIndexOf('.');
    
    if (lastComma > lastDot) {
      // Brazilian format: 1.234,56
      clean = clean.replace(/\./g, '').replace(',', '.');
    } else {
      // US format: 1,234.56
      clean = clean.replace(/,/g, '');
    }
  } else if (hasCommaSeparator) {
    // Assume Brazilian format
    clean = clean.replace(',', '.');
  }

  return parseFloat(clean);
}

// Detect file type from content
export function detectFileType(content: string): 'csv' | 'ofx' | 'unknown' {
  const trimmed = content.trim();
  
  if (trimmed.includes('<OFX>') || trimmed.includes('<OFXHEADER')) {
    return 'ofx';
  }
  
  // Check if it looks like CSV (has consistent delimiters)
  const lines = trimmed.split(/\r?\n/).slice(0, 5);
  if (lines.length >= 2) {
    const semicolonCount = (lines[0].match(/;/g) || []).length;
    const commaCount = (lines[0].match(/,/g) || []).length;
    
    if (semicolonCount >= 2 || commaCount >= 2) {
      return 'csv';
    }
  }

  return 'unknown';
}
