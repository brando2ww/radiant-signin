import { useState } from 'react';
import { parseNFeXML, ParsedInvoice } from '@/lib/invoice/xml-parser';
import { parseDanfePDF, PDFParseResult } from '@/lib/invoice/pdf-parser';
import { useSupabaseUpload } from './use-supabase-upload';
import { toast } from 'sonner';

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let fullText = '';
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    // Agrupar itens por coordenada Y para reconstruir linhas reais do DANFE
    const lines = new Map<number, { x: number; str: string }[]>();
    content.items.forEach((item: any) => {
      if (!item.str || item.str.trim() === '') return;
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
  console.log('[PDF Parser] Texto extraído:', fullText.substring(0, 2000));
  return fullText;
}

export function useInvoiceParser() {
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<Error | null>(null);
  const { uploadFile } = useSupabaseUpload({ bucket: 'product-images', folder: 'invoices' });

  const parseXML = async (file: File): Promise<ParsedInvoice | null> => {
    setParsing(true);
    setParseError(null);

    try {
      const content = await file.text();
      const parsed = await parseNFeXML(content);
      const xmlUrl = await uploadFile(file, `${parsed.invoiceKey}_xml`);
      
      setParsing(false);
      return parsed;
    } catch (error: any) {
      console.error('Erro ao fazer parse do XML:', error);
      setParseError(error);
      setParsing(false);
      toast.error(error.message || 'Erro ao processar arquivo XML');
      return null;
    }
  };

  const parsePDF = async (file: File): Promise<PDFParseResult | null> => {
    setParsing(true);
    setParseError(null);

    try {
      const fullText = await extractTextFromPDF(file);
      const result = await parseDanfePDF(fullText);
      
      await uploadFile(file, `invoice_${Date.now()}_pdf`);
      
      setParsing(false);
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => toast.warning(warning));
      }
      
      if (result.confidence === 'low') {
        toast.warning('Qualidade de extração baixa - revise os dados antes de confirmar');
      }
      
      return result;
    } catch (error: any) {
      console.error('Erro ao fazer parse do PDF:', error);
      setParseError(error);
      setParsing(false);
      toast.error('Erro ao processar arquivo PDF');
      return null;
    }
  };

  return {
    parseXML,
    parsePDF,
    parsing,
    parseError,
  };
}
