import { useState } from 'react';
import { parseNFeXML, ParsedInvoice } from '@/lib/invoice/xml-parser';
import { parseDanfePDF, PDFParseResult } from '@/lib/invoice/pdf-parser';
import { useSupabaseUpload } from './use-supabase-upload';
import { toast } from 'sonner';

export function useInvoiceParser() {
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<Error | null>(null);
  const { uploadFile } = useSupabaseUpload({ bucket: 'product-images', folder: 'invoices' });

  const parseXML = async (file: File): Promise<ParsedInvoice | null> => {
    setParsing(true);
    setParseError(null);

    try {
      // Read file content
      const content = await file.text();
      
      // Parse XML
      const parsed = await parseNFeXML(content);
      
      // Upload XML file
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
      // For PDF parsing, we would use the document parser
      // This is a simplified version - in production you'd use proper OCR
      const content = await file.text();
      
      const result = await parseDanfePDF(content);
      
      // Upload PDF file
      await uploadFile(file, `invoice_${Date.now()}_pdf`);
      
      setParsing(false);
      
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => toast.warning(warning));
      }
      
      if (result.confidence === 'low') {
        toast.warning('Qualidade de extração baixa - recomenda-se usar arquivo XML');
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
