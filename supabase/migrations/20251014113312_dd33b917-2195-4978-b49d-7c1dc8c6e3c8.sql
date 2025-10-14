-- Adicionar colunas para URLs de imagens e biografia
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS cover_image_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;