-- Dados da empresa (complementares)
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_inscricao_municipal TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_nome_fantasia TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_endereco_fiscal JSONB;

-- Certificado digital
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_certificate_url TEXT;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_certificate_password TEXT;

-- Configurações NF-e
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_serie TEXT DEFAULT '1';
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_serie_nfce TEXT DEFAULT '1';
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_numero_inicial INTEGER DEFAULT 1;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_cfop_padrao TEXT DEFAULT '5102';
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_ambiente TEXT DEFAULT 'homologacao';

-- Tributação padrão
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_cst_csosn TEXT DEFAULT '102';
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_aliquota_icms NUMERIC(5,2) DEFAULT 0;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_aliquota_pis NUMERIC(5,2) DEFAULT 0;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_aliquota_cofins NUMERIC(5,2) DEFAULT 0;

-- Automação
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_auto_emit BOOLEAN DEFAULT false;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_email_customer BOOLEAN DEFAULT true;
ALTER TABLE pdv_settings ADD COLUMN IF NOT EXISTS nfe_enable_nfce BOOLEAN DEFAULT false;

-- Bucket privado para certificados digitais
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', false)
ON CONFLICT (id) DO NOTHING;

-- RLS para bucket certificates
CREATE POLICY "Users can upload certificates" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own certificates" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own certificates" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'certificates' AND (storage.foldername(name))[1] = auth.uid()::text);