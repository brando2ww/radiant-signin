import { useState } from 'react';
import { parseNFeXML, ParsedInvoice } from '@/lib/invoice/xml-parser';
import { parseDanfePDF, PDFParseResult } from '@/lib/invoice/pdf-parser';
import { useSupabaseUpload } from './use-supabase-upload';
import { toast } from 'sonner';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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
      // Use pdf.js to extract real text from the binary PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
      }

      const result = await parseDanfePDF(fullText);
      
      // Upload PDF file
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
