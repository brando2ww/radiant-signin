-- Criar bucket para imagens de perfil
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política: Usuários podem fazer upload de suas próprias imagens
CREATE POLICY "Usuários podem fazer upload de avatares próprios"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Usuários podem atualizar suas próprias imagens
CREATE POLICY "Usuários podem atualizar avatares próprios"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Usuários podem deletar suas próprias imagens
CREATE POLICY "Usuários podem deletar avatares próprios"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política: Qualquer pessoa pode ver avatares (bucket público)
CREATE POLICY "Avatares são públicos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');