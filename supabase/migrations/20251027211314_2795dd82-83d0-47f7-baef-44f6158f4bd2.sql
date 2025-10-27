-- Adicionar módulo PDV para o usuário giuseppe@agenciaquantique.com
INSERT INTO public.user_modules (user_id, module, is_active, acquired_at, expires_at, trial_ends_at)
VALUES (
  'c418df6e-102e-4a31-ae28-be2e9d59f8ec',
  'pdv',
  true,
  now(),
  NULL, -- sem expiração
  NULL  -- não é trial
)
ON CONFLICT (user_id, module) 
DO UPDATE SET 
  is_active = true,
  expires_at = NULL,
  updated_at = now();