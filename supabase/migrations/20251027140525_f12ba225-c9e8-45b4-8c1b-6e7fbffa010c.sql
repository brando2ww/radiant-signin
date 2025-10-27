-- Inserir leads de exemplo no CRM
-- Nota: Substitua 'YOUR_USER_ID' pelo ID do usuário logado
-- Esta migration insere dados apenas se a tabela estiver vazia

DO $$
DECLARE
  sample_user_id uuid;
BEGIN
  -- Pegar o primeiro usuário da tabela profiles (você pode ajustar isso)
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;
  
  -- Se encontrou um usuário, inserir os leads de exemplo
  IF sample_user_id IS NOT NULL THEN
    -- Verificar se já existem leads para não duplicar
    IF NOT EXISTS (SELECT 1 FROM public.crm_leads WHERE user_id = sample_user_id) THEN
      
      -- ESTÁGIO: INCOMING (Novos Leads)
      INSERT INTO public.crm_leads (user_id, name, email, phone, company, position, project_title, project_description, estimated_value, stage, priority, tags, source, first_contact_date, expected_close_date, win_probability) VALUES
      (sample_user_id, 'Maria Silva', 'maria.silva@exemplo.com', '(11) 98765-4321', 'Tech Inovações', 'Gerente de TI', 'Sistema de Gestão Empresarial', 'Desenvolvimento de sistema completo para gestão de estoque, vendas e financeiro.', 45000, 'incoming', 'high', ARRAY['Hot Lead', 'Sistema'], 'website', NOW() - INTERVAL '2 days', NOW() + INTERVAL '30 days', 75),
      
      (sample_user_id, 'João Santos', 'joao@comerciodigital.com', '(21) 99876-5432', 'Comércio Digital Ltda', 'CEO', 'E-commerce + App Mobile', 'Criar plataforma de e-commerce integrada com aplicativo mobile para iOS e Android.', 85000, 'incoming', 'urgent', ARRAY['VIP', 'E-commerce', 'App'], 'referral', NOW() - INTERVAL '1 day', NOW() + INTERVAL '45 days', 80),
      
      (sample_user_id, 'Ana Paula Costa', 'ana.costa@consultoria.com', '(31) 97654-3210', 'Consultoria Estratégica', 'Diretora', 'Website Institucional', 'Website moderno e responsivo para consultoria empresarial.', 12000, 'incoming', 'medium', ARRAY['Website'], 'social', NOW() - INTERVAL '3 days', NOW() + INTERVAL '20 days', 60),
      
      (sample_user_id, 'Carlos Eduardo', 'carlos@startuptech.io', '(11) 96543-2109', 'StartupTech', 'CTO', 'MVP SaaS', 'Desenvolvimento de MVP para plataforma SaaS de gestão de projetos.', 55000, 'incoming', 'high', ARRAY['SaaS', 'MVP', 'Hot Lead'], 'event', NOW() - INTERVAL '5 days', NOW() + INTERVAL '60 days', 70),
      
      -- ESTÁGIO: FIRST_CONTACT (Primeiro Contato)
      (sample_user_id, 'Patricia Ferreira', 'patricia@escolaonline.com.br', '(41) 95432-1098', 'Escola Online Brasil', 'Coordenadora', 'Plataforma EAD', 'Plataforma de ensino a distância com videoaulas, exercícios e certificados.', 68000, 'first_contact', 'high', ARRAY['Educação', 'Plataforma'], 'cold_call', NOW() - INTERVAL '7 days', NOW() + INTERVAL '40 days', 65),
      
      (sample_user_id, 'Roberto Lima', 'roberto@restaurante.com', '(51) 94321-0987', 'Rede Sabores', 'Sócio', 'App de Delivery', 'Aplicativo próprio de delivery para rede de restaurantes.', 42000, 'first_contact', 'medium', ARRAY['App', 'Delivery'], 'website', NOW() - INTERVAL '10 days', NOW() + INTERVAL '35 days', 55),
      
      (sample_user_id, 'Juliana Mendes', 'juliana@clinicamed.com', '(61) 93210-9876', 'Clínica Médica Saúde+', 'Administradora', 'Sistema de Agendamento', 'Sistema web para agendamento de consultas, prontuário eletrônico e telemedicina.', 38000, 'first_contact', 'urgent', ARRAY['Saúde', 'Sistema'], 'referral', NOW() - INTERVAL '8 days', NOW() + INTERVAL '25 days', 70),
      
      -- ESTÁGIO: DISCUSSION (Em Discussão)
      (sample_user_id, 'Fernando Alves', 'fernando@logistica.net', '(71) 92109-8765', 'Logística Express', 'Diretor de Operações', 'Sistema de Rastreamento', 'Sistema de rastreamento de entregas em tempo real com painel administrativo.', 52000, 'discussion', 'high', ARRAY['Logística', 'Rastreamento'], 'website', NOW() - INTERVAL '15 days', NOW() + INTERVAL '20 days', 75),
      
      (sample_user_id, 'Camila Rodrigues', 'camila@marketingpro.com', '(81) 91098-7654', 'Marketing Pro', 'Head de Marketing', 'Portal de Conteúdo + CRM', 'Portal de marketing de conteúdo integrado com CRM para gestão de leads.', 35000, 'discussion', 'medium', ARRAY['Marketing', 'CRM'], 'social', NOW() - INTERVAL '12 days', NOW() + INTERVAL '30 days', 60),
      
      (sample_user_id, 'Ricardo Souza', 'ricardo@construtora.com.br', '(85) 90987-6543', 'Construtora Forte', 'Gerente de Projetos', 'Sistema de Orçamentos', 'Sistema para geração automática de orçamentos de obras com banco de dados de preços.', 48000, 'discussion', 'high', ARRAY['Construção', 'Sistema'], 'referral', NOW() - INTERVAL '18 days', NOW() + INTERVAL '28 days', 65),
      
      -- ESTÁGIO: NEGOTIATION (Negociação)
      (sample_user_id, 'Beatriz Oliveira', 'beatriz@fashionstore.com', '(11) 89876-5432', 'Fashion Store Online', 'Owner', 'E-commerce de Moda', 'Loja virtual completa para venda de roupas e acessórios com integração de pagamento.', 32000, 'negotiation', 'urgent', ARRAY['E-commerce', 'Moda', 'Quase Fechado'], 'website', NOW() - INTERVAL '25 days', NOW() + INTERVAL '10 days', 85),
      
      (sample_user_id, 'André Martins', 'andre@advocacia.adv.br', '(21) 88765-4321', 'Martins & Associados', 'Advogado Sócio', 'Sistema Jurídico', 'Sistema de gestão de processos jurídicos com controle de prazos e documentos.', 58000, 'negotiation', 'high', ARRAY['Jurídico', 'Sistema', 'VIP'], 'referral', NOW() - INTERVAL '30 days', NOW() + INTERVAL '15 days', 90),
      
      (sample_user_id, 'Luciana Barbosa', 'luciana@academiafit.com', '(31) 87654-3210', 'Academia Fit Plus', 'Diretora', 'App + Sistema de Academia', 'Aplicativo para alunos + sistema de gestão de academia com controle de acesso.', 44000, 'negotiation', 'medium', ARRAY['Fitness', 'App', 'Sistema'], 'event', NOW() - INTERVAL '22 days', NOW() + INTERVAL '12 days', 80);

      -- Inserir algumas atividades de exemplo para alguns leads
      INSERT INTO public.crm_activities (user_id, lead_id, type, title, description, scheduled_at, is_completed)
      SELECT 
        sample_user_id,
        id,
        'call',
        'Ligação inicial de apresentação',
        'Apresentar serviços e entender necessidades do cliente.',
        NOW() + INTERVAL '2 days',
        false
      FROM public.crm_leads 
      WHERE user_id = sample_user_id AND stage = 'incoming'
      LIMIT 2;

      INSERT INTO public.crm_activities (user_id, lead_id, type, title, description, completed_at, is_completed)
      SELECT 
        sample_user_id,
        id,
        'email',
        'Proposta comercial enviada',
        'Enviada proposta comercial detalhada com valores e cronograma.',
        NOW() - INTERVAL '3 days',
        true
      FROM public.crm_leads 
      WHERE user_id = sample_user_id AND stage = 'discussion'
      LIMIT 2;

      INSERT INTO public.crm_activities (user_id, lead_id, type, title, description, scheduled_at, is_completed)
      SELECT 
        sample_user_id,
        id,
        'meeting',
        'Reunião de fechamento',
        'Reunião para alinhamento final e assinatura de contrato.',
        NOW() + INTERVAL '5 days',
        false
      FROM public.crm_leads 
      WHERE user_id = sample_user_id AND stage = 'negotiation'
      LIMIT 2;

      -- Inserir notas de exemplo
      INSERT INTO public.crm_notes (user_id, lead_id, content, is_pinned)
      SELECT 
        sample_user_id,
        id,
        'Cliente muito interessado no projeto. Demonstrou urgência e disponibilidade de investimento.',
        true
      FROM public.crm_leads 
      WHERE user_id = sample_user_id AND priority = 'urgent'
      LIMIT 3;

    END IF;
  END IF;
END $$;