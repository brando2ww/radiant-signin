
-- Create role enum
CREATE TYPE public.app_role AS ENUM (
  'proprietario', 'gerente', 'caixa', 'garcom', 
  'cozinheiro', 'estoquista', 'financeiro', 'atendente_delivery'
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without recursive RLS
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create establishment_users table
CREATE TABLE public.establishment_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  establishment_owner_id UUID REFERENCES auth.users(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'garcom',
  display_name TEXT,
  email TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (establishment_owner_id, user_id)
);

ALTER TABLE public.establishment_users ENABLE ROW LEVEL SECURITY;

-- RLS: owners can manage their establishment users
CREATE POLICY "Owners can view their establishment users"
ON public.establishment_users
FOR SELECT
TO authenticated
USING (establishment_owner_id = auth.uid());

CREATE POLICY "Owners can insert establishment users"
ON public.establishment_users
FOR INSERT
TO authenticated
WITH CHECK (establishment_owner_id = auth.uid());

CREATE POLICY "Owners can update their establishment users"
ON public.establishment_users
FOR UPDATE
TO authenticated
USING (establishment_owner_id = auth.uid())
WITH CHECK (establishment_owner_id = auth.uid());

CREATE POLICY "Owners can delete their establishment users"
ON public.establishment_users
FOR DELETE
TO authenticated
USING (establishment_owner_id = auth.uid());

-- RLS for user_roles: only owners/managers can view
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER handle_establishment_users_updated_at
  BEFORE UPDATE ON public.establishment_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
