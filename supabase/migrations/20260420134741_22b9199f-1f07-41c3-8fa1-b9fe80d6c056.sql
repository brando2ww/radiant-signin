-- 1. Add qr_access_enabled column
ALTER TABLE public.checklists
ADD COLUMN IF NOT EXISTS qr_access_enabled boolean NOT NULL DEFAULT true;

-- 2. Public read policy for checklists (only when active + qr enabled)
DROP POLICY IF EXISTS "Public can view qr-enabled checklists" ON public.checklists;
CREATE POLICY "Public can view qr-enabled checklists"
ON public.checklists
FOR SELECT
TO anon, authenticated
USING (is_active = true AND qr_access_enabled = true);

-- 3. Public read policy for checklist_items of qr-enabled checklists
DROP POLICY IF EXISTS "Public can view items of qr-enabled checklists" ON public.checklist_items;
CREATE POLICY "Public can view items of qr-enabled checklists"
ON public.checklist_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.checklists c
    WHERE c.id = checklist_items.checklist_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);

-- 4. Public read policy for checklist_operators (needed for PIN validation in public flow)
-- Only expose minimal fields via app code; RLS allows row read for operators of a qr-enabled checklist owner
DROP POLICY IF EXISTS "Public can validate operators for qr access" ON public.checklist_operators;
CREATE POLICY "Public can validate operators for qr access"
ON public.checklist_operators
FOR SELECT
TO anon, authenticated
USING (
  is_active = true
  AND EXISTS (
    SELECT 1 FROM public.checklists c
    WHERE c.user_id = checklist_operators.user_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);

-- 5. Public insert policy for access logs (anyone can log a qr access attempt)
DROP POLICY IF EXISTS "Public can insert qr access logs" ON public.checklist_access_logs;
CREATE POLICY "Public can insert qr access logs"
ON public.checklist_access_logs
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.checklists c
    WHERE c.user_id = checklist_access_logs.user_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);

-- 6. Public insert/update for executions when accessed via qr
DROP POLICY IF EXISTS "Public can create executions for qr-enabled checklists" ON public.checklist_executions;
CREATE POLICY "Public can create executions for qr-enabled checklists"
ON public.checklist_executions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.checklists c
    WHERE c.id = checklist_executions.checklist_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);

DROP POLICY IF EXISTS "Public can read executions for qr-enabled checklists" ON public.checklist_executions;
CREATE POLICY "Public can read executions for qr-enabled checklists"
ON public.checklist_executions
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.checklists c
    WHERE c.id = checklist_executions.checklist_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);

DROP POLICY IF EXISTS "Public can update executions for qr-enabled checklists" ON public.checklist_executions;
CREATE POLICY "Public can update executions for qr-enabled checklists"
ON public.checklist_executions
FOR UPDATE
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.checklists c
    WHERE c.id = checklist_executions.checklist_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);

-- 7. Public insert/update execution items for qr-enabled checklists
DROP POLICY IF EXISTS "Public can write execution items for qr-enabled checklists" ON public.checklist_execution_items;
CREATE POLICY "Public can write execution items for qr-enabled checklists"
ON public.checklist_execution_items
FOR INSERT
TO anon, authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.checklist_executions e
    JOIN public.checklists c ON c.id = e.checklist_id
    WHERE e.id = checklist_execution_items.execution_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);

DROP POLICY IF EXISTS "Public can read execution items for qr-enabled checklists" ON public.checklist_execution_items;
CREATE POLICY "Public can read execution items for qr-enabled checklists"
ON public.checklist_execution_items
FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_executions e
    JOIN public.checklists c ON c.id = e.checklist_id
    WHERE e.id = checklist_execution_items.execution_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);

DROP POLICY IF EXISTS "Public can update execution items for qr-enabled checklists" ON public.checklist_execution_items;
CREATE POLICY "Public can update execution items for qr-enabled checklists"
ON public.checklist_execution_items
FOR UPDATE
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.checklist_executions e
    JOIN public.checklists c ON c.id = e.checklist_id
    WHERE e.id = checklist_execution_items.execution_id
      AND c.is_active = true
      AND c.qr_access_enabled = true
  )
);