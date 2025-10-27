-- Inserir leads de exemplo para o usuário atual
-- Esta migration copia os leads existentes para o usuário logado

INSERT INTO public.crm_leads (user_id, name, email, phone, company, position, project_title, project_description, estimated_value, stage, priority, tags, source, first_contact_date, expected_close_date, win_probability)
SELECT 
  'c418df6e-102e-4a31-ae28-be2e9d59f8ec'::uuid,
  name,
  email,
  phone,
  company,
  position,
  project_title,
  project_description,
  estimated_value,
  stage,
  priority,
  tags,
  source,
  first_contact_date,
  expected_close_date,
  win_probability
FROM public.crm_leads
WHERE user_id = 'a0f02206-4422-49b2-a7fb-91ac73c60562'::uuid
ON CONFLICT DO NOTHING;

-- Inserir atividades correspondentes
INSERT INTO public.crm_activities (user_id, lead_id, type, title, description, scheduled_at, completed_at, is_completed)
SELECT 
  'c418df6e-102e-4a31-ae28-be2e9d59f8ec'::uuid,
  new_leads.id,
  old_activities.type,
  old_activities.title,
  old_activities.description,
  old_activities.scheduled_at,
  old_activities.completed_at,
  old_activities.is_completed
FROM public.crm_activities old_activities
JOIN public.crm_leads old_leads ON old_activities.lead_id = old_leads.id
JOIN public.crm_leads new_leads ON new_leads.name = old_leads.name 
  AND new_leads.user_id = 'c418df6e-102e-4a31-ae28-be2e9d59f8ec'::uuid
WHERE old_leads.user_id = 'a0f02206-4422-49b2-a7fb-91ac73c60562'::uuid
ON CONFLICT DO NOTHING;

-- Inserir notas correspondentes
INSERT INTO public.crm_notes (user_id, lead_id, content, is_pinned)
SELECT 
  'c418df6e-102e-4a31-ae28-be2e9d59f8ec'::uuid,
  new_leads.id,
  old_notes.content,
  old_notes.is_pinned
FROM public.crm_notes old_notes
JOIN public.crm_leads old_leads ON old_notes.lead_id = old_leads.id
JOIN public.crm_leads new_leads ON new_leads.name = old_leads.name 
  AND new_leads.user_id = 'c418df6e-102e-4a31-ae28-be2e9d59f8ec'::uuid
WHERE old_leads.user_id = 'a0f02206-4422-49b2-a7fb-91ac73c60562'::uuid
ON CONFLICT DO NOTHING;