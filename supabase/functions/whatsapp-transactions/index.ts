import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!;
const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')!;
const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')!;
const evolutionInstanceName = Deno.env.get('EVOLUTION_INSTANCE_NAME')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Formata número de telefone para padrão brasileiro
function formatPhoneNumber(phone: string): string {
  const raw = phone.replace('@s.whatsapp.net', '').replace(/\D/g, '');
  const ddd = raw.slice(2, 4);
  const rest = raw.slice(4);
  
  // Se veio sem o 9, adiciona
  if (rest.length === 8) {
    return '55' + ddd + '9' + rest;
  }
  return raw.startsWith('55') ? raw : '55' + raw;
}

// Busca usuário pelo número de WhatsApp verificado
async function findUserByPhone(phoneNumber: string) {
  console.log(`🔍 Buscando usuário pelo telefone: ${phoneNumber}`);
  
  const { data, error } = await supabase
    .from('whatsapp_verifications')
    .select('user_id, phone_number')
    .eq('phone_number', phoneNumber)
    .eq('is_verified', true)
    .single();

  if (error || !data) {
    console.log(`❌ Usuário não encontrado ou não verificado: ${error?.message}`);
    return null;
  }

  console.log(`✅ Usuário encontrado: ${data.user_id}`);
  return data;
}

// Busca ou cria contexto da sessão
async function getSessionContext(userId: string, phoneNumber: string) {
  const { data, error } = await supabase
    .from('whatsapp_session_context')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // Cria novo contexto
    const { data: newContext, error: insertError } = await supabase
      .from('whatsapp_session_context')
      .insert({
        user_id: userId,
        phone_number: phoneNumber,
        conversation_state: 'idle'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao criar contexto:', insertError);
      return null;
    }
    return newContext;
  }

  return data;
}

// Atualiza contexto da sessão
async function updateSessionContext(userId: string, updates: Record<string, unknown>) {
  const { error } = await supabase
    .from('whatsapp_session_context')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('Erro ao atualizar contexto:', error);
  }
}

// Busca contas bancárias do usuário
async function getUserAccounts(userId: string) {
  const { data, error } = await supabase
    .from('bank_accounts')
    .select('id, name, current_balance')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('Erro ao buscar contas:', error);
    return [];
  }

  return data || [];
}

// Busca cartões de crédito do usuário
async function getUserCreditCards(userId: string) {
  const { data, error } = await supabase
    .from('credit_cards')
    .select('id, name, brand, last_four_digits, credit_limit, current_balance, due_day')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) {
    console.error('Erro ao buscar cartões:', error);
    return [];
  }

  return data || [];
}

// Busca resumo de transações por período
async function getTransactionsSummary(
  userId: string, 
  days: number, 
  filterType: 'expense' | 'income' | 'all'
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startDateStr = startDate.toISOString().split('T')[0];
  
  console.log(`📊 Buscando transações: ${filterType} nos últimos ${days} dias (desde ${startDateStr})`);
  
  let query = supabase
    .from('transactions')
    .select('amount, type, description')
    .eq('user_id', userId)
    .gte('transaction_date', startDateStr);
  
  if (filterType !== 'all') {
    query = query.eq('type', filterType);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar transações:', error);
    return { total: 0, count: 0, expenses: 0, income: 0 };
  }
  
  const transactions = data || [];
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const total = filterType === 'all' 
    ? income - expenses 
    : transactions.reduce((sum, t) => sum + Number(t.amount), 0);
  
  console.log(`📊 Resultado: ${transactions.length} transações, Total: ${total}`);
  
  return { 
    total: Math.abs(total), 
    count: transactions.length, 
    expenses, 
    income,
    balance: income - expenses
  };
}

// ==================== FUNÇÕES DE AGENDA ====================

// Busca eventos por período
async function getEventsByPeriod(userId: string, startDate: Date, endDate: Date) {
  console.log(`📅 Buscando eventos de ${startDate.toISOString()} até ${endDate.toISOString()}`);
  
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', { ascending: true });
  
  if (error) {
    console.error('Erro ao buscar eventos:', error);
    return [];
  }
  
  console.log(`📅 Encontrados ${data?.length || 0} eventos`);
  return data || [];
}

// Cria evento na agenda
async function createEvent(userId: string, eventData: {
  title: string;
  date: string;
  time: string;
  location?: string;
}) {
  console.log(`📅 Criando evento: ${eventData.title} em ${eventData.date} às ${eventData.time}`);
  
  const startTime = new Date(`${eventData.date}T${eventData.time}:00`);
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1h padrão
  
  const { error } = await supabase
    .from('tasks')
    .insert({
      user_id: userId,
      title: eventData.title,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      location: eventData.location || null,
      category: 'meeting',
      status: 'pending',
      priority: 'medium',
    });
  
  if (error) {
    console.error('Erro ao criar evento:', error);
    return false;
  }
  
  console.log('✅ Evento criado com sucesso');
  return true;
}

// Atualiza evento existente
async function updateEvent(eventId: string, updates: {
  title?: string;
  date?: string;
  time?: string;
  location?: string;
}, existingEvent: { start_time: string; end_time: string }) {
  console.log(`📅 Atualizando evento ${eventId}:`, updates);
  
  const updateData: Record<string, unknown> = {};
  
  // Se alterou data ou hora, recalcula start_time e end_time
  if (updates.date || updates.time) {
    const existingStart = new Date(existingEvent.start_time);
    const existingEnd = new Date(existingEvent.end_time);
    const duration = existingEnd.getTime() - existingStart.getTime();
    
    let newDate = updates.date ? parseNaturalDate(updates.date) : existingStart.toISOString().split('T')[0];
    let newTime = updates.time ? parseNaturalTime(updates.time) : existingStart.toTimeString().slice(0, 5);
    
    if (newDate && newTime) {
      const newStartTime = new Date(`${newDate}T${newTime}:00`);
      const newEndTime = new Date(newStartTime.getTime() + duration);
      
      updateData.start_time = newStartTime.toISOString();
      updateData.end_time = newEndTime.toISOString();
    }
  }
  
  if (updates.title) {
    updateData.title = updates.title;
  }
  
  if (updates.location !== undefined) {
    updateData.location = updates.location || null;
  }
  
  updateData.updated_at = new Date().toISOString();
  
  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', eventId);
  
  if (error) {
    console.error('Erro ao atualizar evento:', error);
    return false;
  }
  
  console.log('✅ Evento atualizado com sucesso');
  return true;
}

// Busca eventos para edição (por nome ou próximos)
async function findEventsForEdit(userId: string, searchTerm?: string) {
  const now = new Date();
  
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .gte('start_time', now.toISOString())
    .order('start_time', { ascending: true })
    .limit(10);
  
  if (searchTerm) {
    query = query.ilike('title', `%${searchTerm}%`);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Erro ao buscar eventos para edição:', error);
    return [];
  }
  
  console.log(`📅 Encontrados ${data?.length || 0} eventos para edição`);
  return data || [];
}

// Formata data para exibição
function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit'
  });
}

// Formata hora para exibição
function formatTimeBR(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Parseia data natural (amanhã, próxima segunda, 20/12, daqui X dias, fim de semana, etc.)
function parseNaturalDate(input: string): string | null {
  const today = new Date();
  const lowerInput = input.toLowerCase().trim();
  
  // Hoje
  if (lowerInput === 'hoje') {
    return today.toISOString().split('T')[0];
  }
  
  // Amanhã
  if (lowerInput === 'amanhã' || lowerInput === 'amanha') {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  // Depois de amanhã
  if (lowerInput.includes('depois de amanhã') || lowerInput.includes('depois de amanha')) {
    const afterTomorrow = new Date(today);
    afterTomorrow.setDate(afterTomorrow.getDate() + 2);
    return afterTomorrow.toISOString().split('T')[0];
  }
  
  // Daqui X dias / em X dias
  const daquiMatch = lowerInput.match(/(?:daqui|em)\s*(?:a\s*)?(\d+)\s*dias?/);
  if (daquiMatch) {
    const days = parseInt(daquiMatch[1]);
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    return targetDate.toISOString().split('T')[0];
  }
  
  // Fim de semana / final de semana
  if (lowerInput.includes('fim de semana') || lowerInput.includes('final de semana')) {
    const daysUntilSat = (6 - today.getDay() + 7) % 7 || 7;
    const saturday = new Date(today);
    saturday.setDate(today.getDate() + daysUntilSat);
    return saturday.toISOString().split('T')[0];
  }
  
  // Essa semana (próximo dia útil da semana atual, ou hoje se for dia útil)
  if (lowerInput.includes('essa semana') || lowerInput.includes('esta semana')) {
    // Se hoje é dia útil (seg-sex), retorna hoje
    if (today.getDay() >= 1 && today.getDay() <= 5) {
      return today.toISOString().split('T')[0];
    }
    // Se é fim de semana, retorna próxima segunda
    const daysUntilMonday = (1 - today.getDay() + 7) % 7 || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() + daysUntilMonday);
    return monday.toISOString().split('T')[0];
  }
  
  // Semana que vem / próxima semana (próxima segunda)
  if (lowerInput.includes('semana que vem') || lowerInput.includes('próxima semana') || lowerInput.includes('proxima semana')) {
    const daysUntilNextMonday = (1 - today.getDay() + 7) % 7 || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    return nextMonday.toISOString().split('T')[0];
  }
  
  // Mês que vem / próximo mês (dia 1 do próximo mês)
  if (lowerInput.includes('mês que vem') || lowerInput.includes('mes que vem') || 
      lowerInput.includes('próximo mês') || lowerInput.includes('proximo mes')) {
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return nextMonth.toISOString().split('T')[0];
  }
  
  // No dia X (do mês atual ou próximo se já passou)
  const diaMatch = lowerInput.match(/(?:no\s*)?dia\s*(\d{1,2})/);
  if (diaMatch) {
    const targetDay = parseInt(diaMatch[1]);
    let targetDate = new Date(today.getFullYear(), today.getMonth(), targetDay);
    // Se o dia já passou neste mês, vai para o próximo mês
    if (targetDate < today) {
      targetDate = new Date(today.getFullYear(), today.getMonth() + 1, targetDay);
    }
    if (!isNaN(targetDate.getTime())) {
      return targetDate.toISOString().split('T')[0];
    }
  }
  
  // Dias da semana
  const diasSemana: Record<string, number> = {
    'domingo': 0, 'segunda': 1, 'terça': 2, 'terca': 2, 'quarta': 3,
    'quinta': 4, 'sexta': 5, 'sábado': 6, 'sabado': 6
  };
  
  for (const [dia, num] of Object.entries(diasSemana)) {
    if (lowerInput.includes(dia)) {
      const targetDay = new Date(today);
      const currentDay = today.getDay();
      let daysToAdd = num - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7;
      targetDay.setDate(today.getDate() + daysToAdd);
      return targetDay.toISOString().split('T')[0];
    }
  }
  
  // Formato DD/MM ou DD/MM/YYYY
  const dateMatch = lowerInput.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1;
    let year = dateMatch[3] ? parseInt(dateMatch[3]) : today.getFullYear();
    if (year < 100) year += 2000;
    
    const parsedDate = new Date(year, month, day);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().split('T')[0];
    }
  }
  
  return null;
}

// Parseia hora natural (14h, 14:00, 2 da tarde, etc.)
function parseNaturalTime(input: string): string | null {
  const lowerInput = input.toLowerCase().trim();
  
  // Formato HH:MM
  const timeMatch = lowerInput.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch) {
    const hour = parseInt(timeMatch[1]).toString().padStart(2, '0');
    const minute = timeMatch[2];
    return `${hour}:${minute}`;
  }
  
  // Formato XXh ou XXhMM
  const hMatch = lowerInput.match(/(\d{1,2})h(\d{2})?/);
  if (hMatch) {
    const hour = parseInt(hMatch[1]).toString().padStart(2, '0');
    const minute = hMatch[2] || '00';
    return `${hour}:${minute}`;
  }
  
  // X da tarde/noite
  const tardeManhaMath = lowerInput.match(/(\d{1,2})\s*(da\s*)?(tarde|noite)/);
  if (tardeManhaMath) {
    let hour = parseInt(tardeManhaMath[1]);
    if (hour < 12) hour += 12;
    return `${hour.toString().padStart(2, '0')}:00`;
  }
  
  // X da manhã
  const manhaMath = lowerInput.match(/(\d{1,2})\s*(da\s*)?manhã/);
  if (manhaMath) {
    const hour = parseInt(manhaMath[1]);
    return `${hour.toString().padStart(2, '0')}:00`;
  }
  
  // Só número (assume hora)
  const soloNumber = lowerInput.match(/^(\d{1,2})$/);
  if (soloNumber) {
    const hour = parseInt(soloNumber[1]);
    if (hour >= 0 && hour <= 23) {
      return `${hour.toString().padStart(2, '0')}:00`;
    }
  }
  
  return null;
}

// ==================== FIM FUNÇÕES DE AGENDA ====================

// Interpreta mensagem usando OpenAI
async function interpretMessage(message: string, context: Record<string, unknown>) {
  console.log(`🤖 Interpretando mensagem: ${message}`);
  console.log(`📋 Contexto atual:`, JSON.stringify(context));
  
  // Contexto temporal completo
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const dayOfWeek = now.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dayNumber = now.getDate();
  const month = now.toLocaleDateString('pt-BR', { month: 'long' });
  const year = now.getFullYear();
  
  // Amanhã
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowWeekday = tomorrow.toLocaleDateString('pt-BR', { weekday: 'long' });
  const tomorrowDate = tomorrow.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  
  // Depois de amanhã
  const afterTomorrow = new Date(now);
  afterTomorrow.setDate(now.getDate() + 2);
  const afterTomorrowWeekday = afterTomorrow.toLocaleDateString('pt-BR', { weekday: 'long' });
  const afterTomorrowDate = afterTomorrow.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  
  // Próximo fim de semana
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
  const nextSaturday = new Date(now);
  nextSaturday.setDate(now.getDate() + daysUntilSaturday);
  const saturdayDate = nextSaturday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  
  // Próxima segunda (início da próxima semana)
  const daysUntilMonday = (1 - now.getDay() + 7) % 7 || 7;
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + daysUntilMonday);
  const mondayDate = nextMonday.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  
  // Próximo mês
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthName = nextMonth.toLocaleDateString('pt-BR', { month: 'long' });
  
  const temporalContext = `
CONTEXTO TEMPORAL (USE PARA INTERPRETAR DATAS):
- Hoje é ${dayOfWeek}, ${dayNumber} de ${month} de ${year} (${today})
- Amanhã é ${tomorrowWeekday}, ${tomorrowDate}
- Depois de amanhã é ${afterTomorrowWeekday}, ${afterTomorrowDate}
- Próximo sábado (fim de semana): ${saturdayDate}
- Próxima segunda (semana que vem): ${mondayDate}
- Próximo mês: ${nextMonthName}

REGRAS PARA INTERPRETAR DATAS RELATIVAS:
- "daqui X dias" ou "em X dias" = some X dias à data de hoje
- "essa semana" = período de hoje até o próximo domingo
- "fim de semana" ou "final de semana" = sábado ${saturdayDate}
- "semana que vem" ou "próxima semana" = segunda ${mondayDate} em diante
- "mês que vem" ou "próximo mês" = ${nextMonthName}
- "no dia X" = dia X do mês atual (ou próximo mês se já passou)`;
  
  const systemPrompt = `Você é um assistente financeiro e de agenda via WhatsApp. Sua função é interpretar mensagens e extrair informações financeiras ou de agenda.

IMPORTANTE: Responda SEMPRE em JSON válido.
${temporalContext}

🚨🚨🚨 REGRA ABSOLUTAMENTE CRÍTICA - TIPO DE TRANSAÇÃO:

DESPESA (expense) - SEMPRE quando o usuário usa:
- "gastei", "paguei", "saiu", "comprei", "despesa", "gasto", "custo", "fiz um pix", "transferi"
- QUALQUER indicação de dinheiro SAINDO

RECEITA (income) - SEMPRE quando o usuário usa:
- "recebi", "entrou", "ganhei", "receita", "salário", "vendi", "faturei", "caiu na conta", "me pagaram"
- QUALQUER indicação de dinheiro ENTRANDO

⚠️ NUNCA confunda "gastei" com receita - "gastei" é SEMPRE DESPESA!
⚠️ NUNCA confunda "recebi" com despesa - "recebi" é SEMPRE RECEITA!

🚨🚨🚨 REGRA MAIS IMPORTANTE - ESTADOS DE AGENDA:

Se conversation_state começa com "awaiting_event_", você DEVE retornar o tipo correspondente ao estado,
INDEPENDENTE do conteúdo da mensagem. O usuário está RESPONDENDO a uma pergunta específica.

MAPEAMENTO OBRIGATÓRIO:
- conversation_state = "awaiting_event_title" → SEMPRE retorne {"type": "event_title_answer", "title": "mensagem completa do usuário"}
- conversation_state = "awaiting_event_date" → SEMPRE retorne {"type": "event_date_answer", "date": "mensagem completa do usuário"}
- conversation_state = "awaiting_event_time" → SEMPRE retorne {"type": "event_time_answer", "time": "mensagem completa do usuário"}
- conversation_state = "awaiting_event_location" → SEMPRE retorne {"type": "event_location_answer", "location": "texto ou null se negativo"}

EXEMPLOS CRÍTICOS para awaiting_event_date:
- Usuário diz "amanhã às 14h" → {"type": "event_date_answer", "date": "amanhã às 14h"}
- Usuário diz "20/12" → {"type": "event_date_answer", "date": "20/12"}
- Usuário diz "segunda" → {"type": "event_date_answer", "date": "segunda"}
- Usuário diz "dia 16 as 14h" → {"type": "event_date_answer", "date": "dia 16 as 14h"}

EXEMPLOS CRÍTICOS para awaiting_event_time:
- Usuário diz "14h" → {"type": "event_time_answer", "time": "14h"}
- Usuário diz "2 da tarde" → {"type": "event_time_answer", "time": "2 da tarde"}

EXEMPLOS CRÍTICOS para awaiting_event_location:
- Usuário diz "não", "nao", "pular", "-", "nenhum", "sem local" → {"type": "event_location_answer", "location": null}
- Usuário diz "escritório" → {"type": "event_location_answer", "location": "escritório"}
- Usuário diz "casa da maria" → {"type": "event_location_answer", "location": "casa da maria"}

⚠️ NUNCA retorne "unknown" quando o usuário está em um estado awaiting_event_*!
⚠️ MESMO que a resposta pareça conter outros dados (data+hora junto), confie no estado e retorne o tipo correto!

🚨 REGRA CRÍTICA - OUTROS ESTADOS:
- conversation_state = "awaiting_account": O usuário está SELECIONANDO UMA CONTA. 
  Se a mensagem for um NÚMERO (1, 2, 3...) ou nome de conta, retorne:
  {"type": "account_selection", "selection": "valor informado"}
  
  MAS se o usuário estiver CORRIGINDO algo (ex: "não é receita", "errado", "cancela"), retorne correction!

- conversation_state = "awaiting_description": O usuário está INFORMANDO A DESCRIÇÃO da transação.
  Se for texto simples (gasolina, almoço, etc), retorne:
  {"type": "description_answer", "description": "texto informado pelo usuário"}
  
  MAS se o usuário estiver CORRIGINDO algo (ex: "não é receita", "era despesa", "cancela"), retorne correction!

- conversation_state = "idle": O usuário está iniciando uma conversa nova.

TIPOS DE RESPOSTA:

1. TRANSAÇÃO - Se a mensagem indicar uma transação financeira:
{
  "type": "transaction",
  "transaction_type": "expense" ou "income",
  "amount": número (valor em reais),
  "description": "descrição ou null",
  "category": "categoria sugerida"
}

📝 REGRA PARA DESCRIÇÃO:
- Se o usuário MENCIONAR o que foi (gasolina, luz, mercado, almoço, salário, cliente X), use como description
- Se o usuário NÃO mencionar o que foi, retorne description: null

Exemplos CORRETOS:
- "Gastei 80 com gasolina" → transaction_type: "expense", description: "Gasolina"
- "Paguei 150 de luz" → transaction_type: "expense", description: "Luz"  
- "Gastei 80" → transaction_type: "expense", description: null
- "Saiu 200" → transaction_type: "expense", description: null
- "Recebi 500 do cliente João" → transaction_type: "income", description: "Cliente João"
- "Entrou 1000" → transaction_type: "income", description: null
- "Ganhei 300 de bônus" → transaction_type: "income", description: "Bônus"

2. CORREÇÃO - Se o usuário estiver CORRIGINDO algo que o bot interpretou errado:
{
  "type": "correction",
  "correction_type": "transaction_type" ou "amount" ou "description" ou "cancel",
  "new_value": "novo valor se aplicável",
  "message": "entendimento da correção"
}

Exemplos de correção:
- "não é receita, é despesa" → type: "correction", correction_type: "transaction_type", new_value: "expense"
- "eu gastei, não recebi" → type: "correction", correction_type: "transaction_type", new_value: "expense"
- "é receita, não despesa" → type: "correction", correction_type: "transaction_type", new_value: "income"
- "errado, era 50 não 80" → type: "correction", correction_type: "amount", new_value: 50
- "cancela" ou "deixa pra lá" → type: "correction", correction_type: "cancel"

3. CONSULTA FINANCEIRA - Se for uma pergunta sobre dados financeiros:
{
  "type": "query",
  "query_type": "accounts" ou "credit_cards" ou "balance" ou "period_summary",
  "period_days": número (ex: 7, 30, 90) - OBRIGATÓRIO para period_summary,
  "filter_type": "expense" ou "income" ou "all" - OBRIGATÓRIO para period_summary,
  "message": "resposta amigável"
}

Exemplos de CONSULTA POR PERÍODO:
- "Quanto gastei nos últimos 7 dias" → query_type: "period_summary", period_days: 7, filter_type: "expense"
- "Quanto recebi esse mês" → query_type: "period_summary", period_days: 30, filter_type: "income"
- "Quanto entrou e saiu essa semana" → query_type: "period_summary", period_days: 7, filter_type: "all"
- "Total de gastos do mês" → query_type: "period_summary", period_days: 30, filter_type: "expense"
- "Quanto gastei hoje" → query_type: "period_summary", period_days: 1, filter_type: "expense"
- "Receitas da semana" → query_type: "period_summary", period_days: 7, filter_type: "income"
- "Quais são minhas contas" → query_type: "accounts"
- "Quais cartões tenho" → query_type: "credit_cards"
- "Meus cartões de crédito" → query_type: "credit_cards"
- "Lista de cartões" → query_type: "credit_cards"
- "Quais cartões tenho cadastrado" → query_type: "credit_cards"
- "Faturas dos cartões" → query_type: "credit_cards"

REGRAS DE PERÍODO:
- "hoje" = 1 dia
- "ontem" = 2 dias
- "essa semana" ou "última semana" = 7 dias
- "esse mês" ou "último mês" ou "mês" = 30 dias
- "últimos X dias" = X dias

4. SELEÇÃO DE CONTA (quando conversation_state = "awaiting_account"):
{
  "type": "account_selection",
  "selection": "valor informado pelo usuário"
}

5. RESPOSTA DE DESCRIÇÃO (quando conversation_state = "awaiting_description"):
{
  "type": "description_answer",
  "description": "texto informado"
}

6. CRIAR EVENTO - Se o usuário quer CRIAR um evento/compromisso na agenda:
{
  "type": "create_event",
  "title": "nome do evento ou null",
  "date": "data informada ou null (ex: amanhã, 20/12, segunda)",
  "time": "horário informado ou null (ex: 14h, 14:00)",
  "location": "local informado ou null"
}

Exemplos de CRIAR EVENTO:
- "Cria evento reunião amanhã às 14h" → type: "create_event", title: "Reunião", date: "amanhã", time: "14h", location: null
- "Marca consulta médica dia 20 às 10h no hospital" → type: "create_event", title: "Consulta médica", date: "20", time: "10h", location: "Hospital"
- "Adiciona compromisso" → type: "create_event", title: null, date: null, time: null, location: null
- "Criar evento" → type: "create_event", title: null, date: null, time: null, location: null
- "Lembra de ligar pro João segunda às 15h" → type: "create_event", title: "Ligar pro João", date: "segunda", time: "15h", location: null

7. CONSULTAR EVENTOS - Se o usuário quer ver eventos da agenda:
{
  "type": "query_events",
  "query_type": "today" ou "tomorrow" ou "week" ou "date",
  "specific_date": "data específica ou null"
}

Exemplos de CONSULTAR EVENTOS:
- "O que tenho hoje?" → type: "query_events", query_type: "today"
- "Compromissos de amanhã" → type: "query_events", query_type: "tomorrow"
- "Eventos da semana" → type: "query_events", query_type: "week"
- "O que tenho dia 20?" → type: "query_events", query_type: "date", specific_date: "20"
- "Minha agenda de hoje" → type: "query_events", query_type: "today"
- "Próximos compromissos" → type: "query_events", query_type: "week"

8. RESPOSTAS PARCIAIS DE EVENTO (APENAS se no estado correspondente):
{
  "type": "event_title_answer",
  "title": "nome do evento"
}

{
  "type": "event_date_answer",
  "date": "data informada"
}

{
  "type": "event_time_answer",
  "time": "horário informado"
}

{
  "type": "event_location_answer",
  "location": "local ou null se disse não/pular"
}

9. EDITAR EVENTO - Se o usuário quer MODIFICAR um evento existente:
{
  "type": "edit_event",
  "event_identifier": "nome ou parte do nome do evento ou null",
  "field_to_edit": "title" | "date" | "time" | "location" | null,
  "new_value": "novo valor ou null"
}

Exemplos de EDITAR EVENTO:
- "Editar reunião" → type: "edit_event", event_identifier: "reunião", field_to_edit: null, new_value: null
- "Mudar horário da consulta para 15h" → type: "edit_event", event_identifier: "consulta", field_to_edit: "time", new_value: "15h"
- "Alterar data do almoço para sexta" → type: "edit_event", event_identifier: "almoço", field_to_edit: "date", new_value: "sexta"
- "Mudar local da reunião para escritório" → type: "edit_event", event_identifier: "reunião", field_to_edit: "location", new_value: "escritório"
- "Renomear evento reunião para apresentação" → type: "edit_event", event_identifier: "reunião", field_to_edit: "title", new_value: "apresentação"
- "Editar meus eventos" → type: "edit_event", event_identifier: null, field_to_edit: null, new_value: null

10. SELEÇÃO DE EVENTO PARA EDIÇÃO (quando conversation_state = "awaiting_event_selection"):
{
  "type": "event_selection",
  "selection": "número ou nome informado"
}

11. SELEÇÃO DE CAMPO PARA EDIÇÃO (quando conversation_state = "awaiting_edit_field"):
{
  "type": "edit_field_selection",
  "field": "title" | "date" | "time" | "location"
}

Pode ser número (1=nome, 2=data, 3=horário, 4=local) ou texto (nome, data, horário, local).

12. NOVO VALOR DO CAMPO (quando conversation_state = "awaiting_edit_value"):
{
  "type": "edit_value_answer",
  "value": "novo valor informado"
}

13. SAUDAÇÃO - Se for saudação ou conversa casual:
{
  "type": "greeting",
  "message": "resposta amigável e breve"
}

14. NÃO ENTENDEU (USE APENAS QUANDO conversation_state = "idle" E realmente não entender):
{
  "type": "unknown",
  "message": "mensagem pedindo esclarecimento"
}

ESTADO ATUAL DO USUÁRIO: ${JSON.stringify(context)}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.1,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log(`📝 Resposta OpenAI: ${content}`);
    
    // Tenta parsear JSON
    try {
      return JSON.parse(content);
    } catch {
      // Se não for JSON válido, extrai o JSON da resposta
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return { type: 'unknown', message: 'Desculpe, não entendi. Pode reformular?' };
    }
  } catch (error) {
    console.error('Erro ao interpretar mensagem:', error);
    return { type: 'error', message: 'Erro ao processar mensagem.' };
  }
}

// Cria transação no banco
async function createTransaction(userId: string, accountId: string, data: Record<string, unknown>) {
  console.log(`💰 Criando transação para usuário ${userId}`);
  
  const { error } = await supabase
    .from('transactions')
    .insert({
      user_id: userId,
      bank_account_id: accountId,
      amount: data.amount,
      type: data.transaction_type,
      description: data.description,
      category: data.category || 'outros',
      transaction_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Erro ao criar transação:', error);
    return false;
  }

  // Atualiza saldo da conta
  const { data: account } = await supabase
    .from('bank_accounts')
    .select('current_balance')
    .eq('id', accountId)
    .single();

  if (account) {
    const adjustment = data.transaction_type === 'income' 
      ? Number(data.amount) 
      : -Number(data.amount);
    
    await supabase
      .from('bank_accounts')
      .update({ 
        current_balance: Number(account.current_balance) + adjustment,
        updated_at: new Date().toISOString()
      })
      .eq('id', accountId);
  }

  return true;
}

// Envia mensagem via WhatsApp
async function sendWhatsAppMessage(remoteJid: string, message: string) {
  console.log(`📤 Enviando mensagem para ${remoteJid}`);
  
  try {
    const response = await fetch(`${evolutionApiUrl}/message/sendText/${evolutionInstanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionApiKey,
      },
      body: JSON.stringify({
        number: remoteJid,
        text: message,
      }),
    });

    const result = await response.json();
    console.log(`✅ Mensagem enviada:`, result);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar mensagem:', error);
    return false;
  }
}

// Formata valor em reais
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Baixa áudio via Evolution API
async function downloadAudioFromEvolution(messageKey: Record<string, unknown>): Promise<string | null> {
  console.log('📥 Baixando áudio via Evolution API...', JSON.stringify(messageKey));
  
  try {
    const response = await fetch(
      `${evolutionApiUrl}/chat/getBase64FromMediaMessage/${encodeURIComponent(evolutionInstanceName)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': evolutionApiKey,
        },
        body: JSON.stringify({
          message: { key: messageKey },
          convertToMp4: false
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro Evolution API:', response.status, errorText);
      return null;
    }

    const result = await response.json();
    console.log('📦 Resposta Evolution (parcial):', JSON.stringify(result).substring(0, 300));
    
    let base64Data = result.base64 || null;
    
    if (!base64Data) {
      console.error('❌ Nenhum base64 retornado pela Evolution API');
      return null;
    }
    
    // Remove prefixo data:... se existir (ex: data:audio/ogg;base64,...)
    if (base64Data.includes(',')) {
      base64Data = base64Data.split(',')[1];
      console.log('🔄 Prefixo data: removido do base64');
    }
    
    // Remove espaços e quebras de linha
    base64Data = base64Data.replace(/\s/g, '');
    
    console.log('✅ Áudio baixado! Tamanho base64:', base64Data.length);
    return base64Data;
  } catch (error) {
    console.error('❌ Erro ao baixar áudio:', error);
    return null;
  }
}

// Transcreve áudio usando OpenAI Whisper
async function transcribeAudio(audioBase64: string): Promise<string | null> {
  console.log('🎤 Transcrevendo áudio... Tamanho base64:', audioBase64.length);
  
  try {
    // Decodifica base64 de forma segura para binário
    const binaryString = atob(audioBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    console.log('📊 Bytes do áudio:', bytes.length);
    
    // Detecta tipo do áudio pelos magic bytes
    // OGG/Opus começa com "OggS" (0x4F 0x67 0x67 0x53)
    const isOgg = bytes.length > 4 && bytes[0] === 0x4F && bytes[1] === 0x67 && bytes[2] === 0x67 && bytes[3] === 0x53;
    // MP3 pode começar com ID3 (0x49 0x44 0x33) ou frame sync (0xFF 0xFB ou similar)
    const isMp3 = bytes.length > 3 && (
      (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) || 
      (bytes[0] === 0xFF && (bytes[1] & 0xE0) === 0xE0)
    );
    
    let mimeType: string;
    let fileName: string;
    
    if (isOgg) {
      mimeType = 'audio/ogg';
      fileName = 'audio.ogg';
    } else if (isMp3) {
      mimeType = 'audio/mpeg';
      fileName = 'audio.mp3';
    } else {
      // WhatsApp geralmente envia como OGG/Opus, mesmo sem magic bytes corretos
      mimeType = 'audio/ogg';
      fileName = 'audio.ogg';
    }
    
    console.log(`📁 Formato detectado: ${mimeType} (${fileName}) | Magic bytes: ${bytes.slice(0, 4).join(', ')}`);
    
    // Cria Blob com tipo correto
    const blob = new Blob([bytes], { type: mimeType });
    
    // Cria FormData para OpenAI
    const formData = new FormData();
    formData.append('file', blob, fileName);
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    console.log('📤 Enviando para OpenAI Whisper...');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    const responseText = await response.text();
    console.log('📨 Resposta OpenAI:', response.status, responseText.substring(0, 500));

    if (!response.ok) {
      console.error('❌ Erro OpenAI Whisper:', response.status, responseText);
      return null;
    }

    const result = JSON.parse(responseText);
    
    if (!result.text || result.text.trim() === '') {
      console.log('⚠️ Transcrição retornou vazia');
      return null;
    }
    
    console.log(`✅ Áudio transcrito com sucesso: "${result.text}"`);
    return result.text;
  } catch (error) {
    console.error('❌ Erro ao transcrever áudio:', error);
    return null;
  }
}

// Processa a mensagem recebida
async function processMessage(remoteJid: string, messageText: string) {
  const formattedPhone = formatPhoneNumber(remoteJid);
  console.log(`📱 Processando mensagem de ${formattedPhone}: ${messageText}`);

  // Busca usuário verificado
  const user = await findUserByPhone(formattedPhone);
  if (!user) {
    console.log('❌ Usuário não cadastrado ou WhatsApp não verificado');
    return; // Ignora mensagens de usuários não verificados
  }

  // Busca contexto da sessão
  const context = await getSessionContext(user.user_id, formattedPhone);
  if (!context) {
    await sendWhatsAppMessage(remoteJid, '❌ Erro ao processar. Tente novamente.');
    return;
  }

  // Busca contas do usuário
  const accounts = await getUserAccounts(user.user_id);
  
  // Interpreta a mensagem com contexto completo
  const interpretation = await interpretMessage(messageText, {
    conversation_state: context.conversation_state,
    pending_transaction: context.pending_transaction,
    pending_event: context.pending_event,
    pending_edit: context.pending_edit,
    accounts_count: accounts.length,
    last_account_id: context.last_account_id,
  });

  console.log(`🧠 Interpretação:`, interpretation);

  // Processa baseado no tipo de interpretação e estado da conversa
  switch (interpretation.type) {
    case 'greeting':
      await sendWhatsAppMessage(remoteJid, 
        interpretation.message || 
        'Olá! 👋 Como posso ajudar?\n\n' +
        '💰 *Finanças:* "Gastei 50 no almoço"\n' +
        '📅 *Agenda:* "Criar evento" ou "O que tenho hoje?"'
      );
      break;

    case 'transaction':
      if (accounts.length === 0) {
        await sendWhatsAppMessage(remoteJid, 
          '❌ Você ainda não tem contas bancárias cadastradas.\n\n' +
          '📱 Acesse o app para cadastrar sua primeira conta!'
        );
        return;
      }

      // Se não tem descrição, perguntar primeiro
      if (!interpretation.description) {
        await updateSessionContext(user.user_id, {
          pending_transaction: interpretation,
          conversation_state: 'awaiting_description'
        });

        const emojiDesc = interpretation.transaction_type === 'income' ? '💰' : '💸';
        const tipoDesc = interpretation.transaction_type === 'income' ? 'receita' : 'despesa';
        
        await sendWhatsAppMessage(remoteJid,
          `${emojiDesc} *${formatCurrency(interpretation.amount)}*\n\n` +
          `📝 O que foi essa ${tipoDesc}?`
        );
        return;
      }

      // Se só tem 1 conta, registra direto SEM perguntar
      if (accounts.length === 1) {
        const singleAccount = accounts[0];
        const success = await createTransaction(user.user_id, singleAccount.id, interpretation);
        
        if (success) {
          const emoji = interpretation.transaction_type === 'income' ? '💰' : '💸';
          const tipoTexto = interpretation.transaction_type === 'income' ? 'receita' : 'despesa';
          
          await sendWhatsAppMessage(remoteJid,
            `${emoji} *${tipoTexto.charAt(0).toUpperCase() + tipoTexto.slice(1)} registrada!*\n\n` +
            `💵 *${formatCurrency(interpretation.amount)}*\n` +
            `📝 ${interpretation.description}\n` +
            `🏦 ${singleAccount.name}`
          );
          
          // Atualiza última conta usada
          await updateSessionContext(user.user_id, {
            last_account_id: singleAccount.id,
            conversation_state: 'idle'
          });
        } else {
          await sendWhatsAppMessage(remoteJid, '❌ Erro ao registrar. Tente novamente.');
        }
        return;
      }

      // Múltiplas contas: salva pendente e pergunta qual
      await updateSessionContext(user.user_id, {
        pending_transaction: interpretation,
        conversation_state: 'awaiting_account'
      });

      const emoji = interpretation.transaction_type === 'income' ? '💰' : '💸';
      const tipoTexto = interpretation.transaction_type === 'income' ? 'receita' : 'despesa';
      
      let accountsList = '';
      accounts.forEach((acc, idx) => {
        accountsList += `${idx + 1}️⃣ ${acc.name}\n`;
      });
      
      await sendWhatsAppMessage(remoteJid, 
        `${emoji} *${formatCurrency(interpretation.amount)}* - ${interpretation.description}\n\n` +
        `📂 Qual conta?\n${accountsList}\n` +
        `_Responda com o número_`
      );
      break;

    case 'description_answer':
      // Usuário informou a descrição da transação pendente
      if (context.conversation_state !== 'awaiting_description' || !context.pending_transaction) {
        await sendWhatsAppMessage(remoteJid, '🤔 Não tenho nenhuma transação pendente. Me conte sobre um gasto ou receita!');
        return;
      }

      const pendingTxData = context.pending_transaction as Record<string, unknown>;
      const descriptionText = interpretation.description || messageText.trim();
      
      // Acessa valores com casting correto
      const txType = pendingTxData.transaction_type as string;
      const txAmount = pendingTxData.amount as number;

      const pendingWithDesc: Record<string, unknown> = {
        ...pendingTxData,
        description: descriptionText
      };

      // Se só tem 1 conta, registra direto
      if (accounts.length === 1) {
        const singleAcc = accounts[0];
        const successDesc = await createTransaction(user.user_id, singleAcc.id, pendingWithDesc);
        
        if (successDesc) {
          const emojiD = txType === 'income' ? '💰' : '💸';
          const tipoD = txType === 'income' ? 'Receita' : 'Despesa';
          
          await sendWhatsAppMessage(remoteJid,
            `${emojiD} *${tipoD} registrada!*\n\n` +
            `💵 *${formatCurrency(txAmount)}*\n` +
            `📝 ${descriptionText}\n` +
            `🏦 ${singleAcc.name}`
          );
        } else {
          await sendWhatsAppMessage(remoteJid, '❌ Erro ao registrar. Tente novamente.');
        }

        await updateSessionContext(user.user_id, {
          pending_transaction: null,
          last_account_id: singleAcc.id,
          conversation_state: 'idle'
        });
        return;
      }

      // Múltiplas contas: atualiza pending com descrição e pergunta qual conta
      await updateSessionContext(user.user_id, {
        pending_transaction: pendingWithDesc,
        conversation_state: 'awaiting_account'
      });

      const emojiAcc = txType === 'income' ? '💰' : '💸';
      
      let accsListDesc = '';
      accounts.forEach((acc, idx) => {
        accsListDesc += `${idx + 1}️⃣ ${acc.name}\n`;
      });
      
      await sendWhatsAppMessage(remoteJid, 
        `${emojiAcc} *${formatCurrency(txAmount)}* - ${descriptionText}\n\n` +
        `📂 Qual conta?\n${accsListDesc}\n` +
        `_Responda com o número_`
      );
      break;

    case 'account_selection':
      if (context.conversation_state !== 'awaiting_account' || !context.pending_transaction) {
        await sendWhatsAppMessage(remoteJid, '🤔 Não tenho nenhuma transação pendente. Me conte sobre um gasto ou receita!');
        return;
      }

      // Identifica a conta selecionada
      const selection = interpretation.selection?.toString().trim();
      let selectedAccount = null;

      // Tenta por número
      const accountIndex = parseInt(selection) - 1;
      if (!isNaN(accountIndex) && accountIndex >= 0 && accountIndex < accounts.length) {
        selectedAccount = accounts[accountIndex];
      } else {
        // Tenta por nome
        selectedAccount = accounts.find(acc => 
          acc.name.toLowerCase().includes(selection?.toLowerCase() || '')
        );
      }

      if (!selectedAccount) {
        let retryList = '';
        accounts.forEach((acc, idx) => {
          retryList += `${idx + 1}️⃣ ${acc.name}\n`;
        });
        await sendWhatsAppMessage(remoteJid, `❌ Não encontrei. Qual conta?\n\n${retryList}`);
        return;
      }

      // REGISTRA DIRETO - sem pedir confirmação
      const pendingTx = context.pending_transaction;
      const successTx = await createTransaction(user.user_id, selectedAccount.id, pendingTx);

      if (successTx) {
        const emojiTx = pendingTx.transaction_type === 'income' ? '💰' : '💸';
        const tipoTx = pendingTx.transaction_type === 'income' ? 'Receita' : 'Despesa';
        
        await sendWhatsAppMessage(remoteJid,
          `${emojiTx} *${tipoTx} registrada!*\n\n` +
          `💵 *${formatCurrency(pendingTx.amount)}*\n` +
          `📝 ${pendingTx.description}\n` +
          `🏦 ${selectedAccount.name}`
        );
      } else {
        await sendWhatsAppMessage(remoteJid, '❌ Erro ao registrar. Tente novamente.');
      }

      // Limpa estado
      await updateSessionContext(user.user_id, {
        pending_transaction: null,
        last_account_id: selectedAccount.id,
        conversation_state: 'idle'
      });
      break;

    case 'query':
      if (interpretation.query_type === 'accounts') {
        if (accounts.length === 0) {
          await sendWhatsAppMessage(remoteJid, '📭 Você ainda não tem contas cadastradas.');
        } else {
          let msg = '🏦 *Suas contas:*\n\n';
          accounts.forEach(acc => {
            msg += `• ${acc.name}: ${formatCurrency(acc.current_balance)}\n`;
          });
          await sendWhatsAppMessage(remoteJid, msg);
        }
      } else if (interpretation.query_type === 'credit_cards') {
        const creditCards = await getUserCreditCards(user.user_id);
        
        if (creditCards.length === 0) {
          await sendWhatsAppMessage(remoteJid, '💳 Você ainda não tem cartões cadastrados.');
        } else {
          let msg = '💳 *Seus cartões de crédito:*\n\n';
          creditCards.forEach(card => {
            const limitFormatted = formatCurrency(card.credit_limit || 0);
            const balanceFormatted = formatCurrency(card.current_balance || 0);
            const lastDigits = card.last_four_digits || '****';
            
            msg += `• *${card.name}* (•••• ${lastDigits})\n`;
            msg += `  Fatura atual: ${balanceFormatted}\n`;
            msg += `  Limite: ${limitFormatted}\n`;
            if (card.due_day) {
              msg += `  Vencimento: dia ${card.due_day}\n`;
            }
            msg += '\n';
          });
          await sendWhatsAppMessage(remoteJid, msg);
        }
      } else if (interpretation.query_type === 'period_summary') {
        const days = interpretation.period_days || 30;
        const filterType = interpretation.filter_type || 'all';
        
        const summary = await getTransactionsSummary(user.user_id, days, filterType);
        
        if (summary.count === 0) {
          const tipoText = filterType === 'expense' ? 'despesas' : 
                           filterType === 'income' ? 'receitas' : 'transações';
          await sendWhatsAppMessage(remoteJid, 
            `📊 Nenhuma ${tipoText} nos últimos ${days} ${days === 1 ? 'dia' : 'dias'}.`
          );
        } else if (filterType === 'all') {
          // Mostra resumo completo
          await sendWhatsAppMessage(remoteJid,
            `📊 *Resumo dos últimos ${days} ${days === 1 ? 'dia' : 'dias'}:*\n\n` +
            `💰 Receitas: *${formatCurrency(summary.income)}*\n` +
            `💸 Despesas: *${formatCurrency(summary.expenses)}*\n` +
            `━━━━━━━━━━━━━━\n` +
            `📈 Saldo: *${formatCurrency(summary.balance || 0)}*\n\n` +
            `📝 ${summary.count} ${summary.count === 1 ? 'transação' : 'transações'}`
          );
        } else {
          const emojiQuery = filterType === 'expense' ? '💸' : '💰';
          const tipoText = filterType === 'expense' ? 'gastos' : 'receitas';
          
          await sendWhatsAppMessage(remoteJid,
            `${emojiQuery} *Total de ${tipoText} nos últimos ${days} ${days === 1 ? 'dia' : 'dias'}:*\n\n` +
            `💵 *${formatCurrency(summary.total)}*\n` +
            `📝 ${summary.count} ${summary.count === 1 ? 'transação' : 'transações'}`
          );
        }
      } else {
        await sendWhatsAppMessage(remoteJid, interpretation.message || 'Consulta não suportada ainda.');
      }
      break;

    // ==================== CASOS DE AGENDA ====================

    case 'create_event': {
      // Usuário quer criar um evento
      const pendingEvent: Record<string, unknown> = {
        title: interpretation.title || null,
        date: interpretation.date || null,
        time: interpretation.time || null,
        location: interpretation.location || null,
      };

      // Verificar o que está faltando e perguntar
      if (!pendingEvent.title) {
        await updateSessionContext(user.user_id, {
          pending_event: pendingEvent,
          conversation_state: 'awaiting_event_title'
        });
        await sendWhatsAppMessage(remoteJid, '📅 *Criar evento*\n\n📝 Qual o nome do evento?');
        return;
      }

      if (!pendingEvent.date) {
        await updateSessionContext(user.user_id, {
          pending_event: pendingEvent,
          conversation_state: 'awaiting_event_date'
        });
        await sendWhatsAppMessage(remoteJid, 
          `📅 *${pendingEvent.title}*\n\n` +
          `📆 Qual a data?\n` +
          `_Ex: amanhã, 20/12, segunda_`
        );
        return;
      }

      if (!pendingEvent.time) {
        await updateSessionContext(user.user_id, {
          pending_event: pendingEvent,
          conversation_state: 'awaiting_event_time'
        });
        await sendWhatsAppMessage(remoteJid, 
          `📅 *${pendingEvent.title}*\n` +
          `📆 ${pendingEvent.date}\n\n` +
          `⏰ Qual o horário?\n` +
          `_Ex: 14h, 14:00, 2 da tarde_`
        );
        return;
      }

      // Temos tudo, perguntar local (opcional)
      if (pendingEvent.location === null) {
        await updateSessionContext(user.user_id, {
          pending_event: pendingEvent,
          conversation_state: 'awaiting_event_location'
        });
        await sendWhatsAppMessage(remoteJid, 
          `📅 *${pendingEvent.title}*\n` +
          `📆 ${pendingEvent.date} às ${pendingEvent.time}\n\n` +
          `📍 Qual o local?\n` +
          `_Responda "não" ou "pular" se não tiver_`
        );
        return;
      }

      // Temos todos os dados, criar evento
      const parsedDate = parseNaturalDate(pendingEvent.date as string);
      const parsedTime = parseNaturalTime(pendingEvent.time as string);

      if (!parsedDate) {
        await sendWhatsAppMessage(remoteJid, '❌ Não entendi a data. Tente novamente com um formato como "amanhã", "20/12" ou "segunda".');
        return;
      }

      if (!parsedTime) {
        await sendWhatsAppMessage(remoteJid, '❌ Não entendi o horário. Tente novamente com um formato como "14h", "14:00" ou "2 da tarde".');
        return;
      }

      const eventSuccess = await createEvent(user.user_id, {
        title: pendingEvent.title as string,
        date: parsedDate,
        time: parsedTime,
        location: pendingEvent.location as string | undefined,
      });

      if (eventSuccess) {
        const eventDate = new Date(`${parsedDate}T${parsedTime}:00`);
        let confirmMsg = `✅ *Evento criado!*\n\n` +
          `📅 ${pendingEvent.title}\n` +
          `📆 ${formatDateBR(eventDate)} às ${formatTimeBR(eventDate)}`;
        
        if (pendingEvent.location) {
          confirmMsg += `\n📍 ${pendingEvent.location}`;
        }
        
        await sendWhatsAppMessage(remoteJid, confirmMsg);
      } else {
        await sendWhatsAppMessage(remoteJid, '❌ Erro ao criar evento. Tente novamente.');
      }

      await updateSessionContext(user.user_id, {
        pending_event: null,
        conversation_state: 'idle'
      });
      break;
    }

    case 'event_title_answer': {
      if (context.conversation_state !== 'awaiting_event_title') {
        await sendWhatsAppMessage(remoteJid, '🤔 Não estou esperando um nome de evento. Diga "criar evento" para começar.');
        return;
      }

      const currentEvent = (context.pending_event as Record<string, unknown>) || {};
      const rawTitle = interpretation.title || messageText.trim();
      
      // Tenta extrair data e hora da mensagem do título (caso usuário tenha informado tudo junto)
      const extractedDate = parseNaturalDate(rawTitle);
      const extractedTime = parseNaturalTime(rawTitle);
      
      // Remove partes de data/hora do título se foram extraídas
      let cleanTitle = rawTitle
        .replace(/(?:no\s*)?dia\s*\d{1,2}/gi, '')
        .replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g, '')
        .replace(/(?:às?|as)\s*\d{1,2}(?:h|:)?\d{0,2}/gi, '')
        .replace(/\d{1,2}h\d{0,2}/gi, '')
        .replace(/\d{1,2}\s*(?:da\s*)?(tarde|noite|manhã)/gi, '')
        .replace(/amanh[aã]/gi, '')
        .replace(/hoje/gi, '')
        .replace(/segunda|terça|terca|quarta|quinta|sexta|s[aá]bado|domingo/gi, '')
        .trim()
        .replace(/\s+/g, ' ');
      
      // Se o título ficou muito curto ou vazio, usa o original
      if (cleanTitle.length < 2) {
        cleanTitle = rawTitle;
      }
      
      const updatedEvent = { 
        ...currentEvent, 
        title: cleanTitle,
        date: extractedDate ? rawTitle : currentEvent.date, // Guarda o texto original para parsing depois
        time: extractedTime ? rawTitle : currentEvent.time
      };

      // Se extraiu data e hora, pula direto para local
      if (extractedDate && extractedTime) {
        await updateSessionContext(user.user_id, {
          pending_event: updatedEvent,
          conversation_state: 'awaiting_event_location'
        });
        await sendWhatsAppMessage(remoteJid, 
          `📅 *${cleanTitle}*\n` +
          `📆 ${rawTitle}\n\n` +
          `📍 Qual o local?\n` +
          `_Responda "não" ou "pular" se não tiver_`
        );
        return;
      }
      
      // Se extraiu só a data, pula para horário
      if (extractedDate) {
        await updateSessionContext(user.user_id, {
          pending_event: updatedEvent,
          conversation_state: 'awaiting_event_time'
        });
        await sendWhatsAppMessage(remoteJid, 
          `📅 *${cleanTitle}*\n` +
          `📆 ${rawTitle}\n\n` +
          `⏰ Qual o horário?\n` +
          `_Ex: 14h, 14:00, 2 da tarde_`
        );
        return;
      }

      await updateSessionContext(user.user_id, {
        pending_event: updatedEvent,
        conversation_state: 'awaiting_event_date'
      });

      await sendWhatsAppMessage(remoteJid, 
        `📅 *${cleanTitle}*\n\n` +
        `📆 Qual a data?\n` +
        `_Ex: amanhã, 20/12, segunda_`
      );
      break;
    }

    case 'event_date_answer': {
      if (context.conversation_state !== 'awaiting_event_date') {
        await sendWhatsAppMessage(remoteJid, '🤔 Não estou esperando uma data. Diga "criar evento" para começar.');
        return;
      }

      const currentEvent2 = (context.pending_event as Record<string, unknown>) || {};
      const dateInput = interpretation.date || messageText.trim();
      const updatedEvent2 = { ...currentEvent2, date: dateInput };

      await updateSessionContext(user.user_id, {
        pending_event: updatedEvent2,
        conversation_state: 'awaiting_event_time'
      });

      await sendWhatsAppMessage(remoteJid, 
        `📅 *${currentEvent2.title}*\n` +
        `📆 ${dateInput}\n\n` +
        `⏰ Qual o horário?\n` +
        `_Ex: 14h, 14:00, 2 da tarde_`
      );
      break;
    }

    case 'event_time_answer': {
      if (context.conversation_state !== 'awaiting_event_time') {
        await sendWhatsAppMessage(remoteJid, '🤔 Não estou esperando um horário. Diga "criar evento" para começar.');
        return;
      }

      const currentEvent3 = (context.pending_event as Record<string, unknown>) || {};
      const timeInput = interpretation.time || messageText.trim();
      const updatedEvent3 = { ...currentEvent3, time: timeInput };

      await updateSessionContext(user.user_id, {
        pending_event: updatedEvent3,
        conversation_state: 'awaiting_event_location'
      });

      await sendWhatsAppMessage(remoteJid, 
        `📅 *${currentEvent3.title}*\n` +
        `📆 ${currentEvent3.date} às ${timeInput}\n\n` +
        `📍 Qual o local?\n` +
        `_Responda "não" ou "pular" se não tiver_`
      );
      break;
    }

    case 'event_location_answer': {
      if (context.conversation_state !== 'awaiting_event_location') {
        await sendWhatsAppMessage(remoteJid, '🤔 Não estou esperando um local. Diga "criar evento" para começar.');
        return;
      }

      const currentEvent4 = (context.pending_event as Record<string, unknown>) || {};
      const locationInput = interpretation.location;
      
      // Verificar se usuário disse não/pular
      const skipWords = ['não', 'nao', 'pular', 'nenhum', 'sem local', '-'];
      const isSkip = !locationInput || skipWords.some(w => messageText.toLowerCase().includes(w));
      
      const finalLocation = isSkip ? undefined : (locationInput || messageText.trim());

      // Parsear data e hora
      const parsedDateFinal = parseNaturalDate(currentEvent4.date as string);
      const parsedTimeFinal = parseNaturalTime(currentEvent4.time as string);

      if (!parsedDateFinal) {
        await sendWhatsAppMessage(remoteJid, '❌ Não entendi a data informada. Vamos recomeçar - diga "criar evento".');
        await updateSessionContext(user.user_id, {
          pending_event: null,
          conversation_state: 'idle'
        });
        return;
      }

      if (!parsedTimeFinal) {
        await sendWhatsAppMessage(remoteJid, '❌ Não entendi o horário informado. Vamos recomeçar - diga "criar evento".');
        await updateSessionContext(user.user_id, {
          pending_event: null,
          conversation_state: 'idle'
        });
        return;
      }

      const eventSuccessFinal = await createEvent(user.user_id, {
        title: currentEvent4.title as string,
        date: parsedDateFinal,
        time: parsedTimeFinal,
        location: finalLocation,
      });

      if (eventSuccessFinal) {
        const eventDateFinal = new Date(`${parsedDateFinal}T${parsedTimeFinal}:00`);
        let confirmMsgFinal = `✅ *Evento criado!*\n\n` +
          `📅 ${currentEvent4.title}\n` +
          `📆 ${formatDateBR(eventDateFinal)} às ${formatTimeBR(eventDateFinal)}`;
        
        if (finalLocation) {
          confirmMsgFinal += `\n📍 ${finalLocation}`;
        }
        
        await sendWhatsAppMessage(remoteJid, confirmMsgFinal);
      } else {
        await sendWhatsAppMessage(remoteJid, '❌ Erro ao criar evento. Tente novamente.');
      }

      await updateSessionContext(user.user_id, {
        pending_event: null,
        conversation_state: 'idle'
      });
      break;
    }

    case 'query_events': {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let startDate: Date;
      let endDate: Date;
      let periodLabel: string;

      switch (interpretation.query_type) {
        case 'today':
          startDate = new Date(today);
          endDate = new Date(today);
          endDate.setHours(23, 59, 59, 999);
          periodLabel = 'hoje';
          break;
        case 'tomorrow':
          startDate = new Date(today);
          startDate.setDate(startDate.getDate() + 1);
          endDate = new Date(startDate);
          endDate.setHours(23, 59, 59, 999);
          periodLabel = 'amanhã';
          break;
        case 'week':
          startDate = new Date(today);
          endDate = new Date(today);
          endDate.setDate(endDate.getDate() + 7);
          endDate.setHours(23, 59, 59, 999);
          periodLabel = 'próximos 7 dias';
          break;
        case 'date':
          const specificDate = interpretation.specific_date;
          const parsed = parseNaturalDate(specificDate || '');
          if (!parsed) {
            await sendWhatsAppMessage(remoteJid, '❌ Não entendi a data. Tente "hoje", "amanhã", "semana" ou uma data como "20/12".');
            return;
          }
          startDate = new Date(parsed + 'T00:00:00');
          endDate = new Date(parsed + 'T23:59:59');
          periodLabel = formatDateBR(startDate);
          break;
        default:
          startDate = new Date(today);
          endDate = new Date(today);
          endDate.setDate(endDate.getDate() + 7);
          endDate.setHours(23, 59, 59, 999);
          periodLabel = 'próximos 7 dias';
      }

      const events = await getEventsByPeriod(user.user_id, startDate, endDate);

      if (events.length === 0) {
        await sendWhatsAppMessage(remoteJid, `📅 Nenhum evento para ${periodLabel}.`);
      } else {
        let eventsMsg = `📅 *Eventos - ${periodLabel}:*\n\n`;
        
        // Agrupa eventos por dia se for mais de um dia
        if (interpretation.query_type === 'week') {
          const eventsByDay: Record<string, typeof events> = {};
          
          for (const event of events) {
            const eventDate = new Date(event.start_time);
            const dayKey = eventDate.toISOString().split('T')[0];
            if (!eventsByDay[dayKey]) {
              eventsByDay[dayKey] = [];
            }
            eventsByDay[dayKey].push(event);
          }

          for (const [dayKey, dayEvents] of Object.entries(eventsByDay)) {
            const dayDate = new Date(dayKey + 'T12:00:00');
            eventsMsg += `📆 *${formatDateBR(dayDate)}*\n`;
            
            for (const event of dayEvents) {
              const eventTime = new Date(event.start_time);
              eventsMsg += `⏰ ${formatTimeBR(eventTime)} - ${event.title}`;
              if (event.location) {
                eventsMsg += `\n📍 ${event.location}`;
              }
              eventsMsg += '\n';
            }
            eventsMsg += '\n';
          }
        } else {
          // Lista simples para um dia
          for (const event of events) {
            const eventTime = new Date(event.start_time);
            eventsMsg += `⏰ ${formatTimeBR(eventTime)} - ${event.title}`;
            if (event.location) {
              eventsMsg += `\n📍 ${event.location}`;
            }
            eventsMsg += '\n\n';
          }
        }

        await sendWhatsAppMessage(remoteJid, eventsMsg.trim());
      }
      break;
    }

    // ==================== CASOS DE EDIÇÃO DE EVENTOS ====================

    case 'edit_event': {
      // Usuário quer editar um evento
      const searchTerm = interpretation.event_identifier;
      const fieldToEdit = interpretation.field_to_edit;
      const newValue = interpretation.new_value;

      // Busca eventos que correspondem ao termo
      const eventsToEdit = await findEventsForEdit(user.user_id, searchTerm || undefined);

      if (eventsToEdit.length === 0) {
        await sendWhatsAppMessage(remoteJid,
          searchTerm
            ? `❌ Nenhum evento encontrado com "${searchTerm}".\n\nDiga "editar eventos" para ver a lista.`
            : '📅 Nenhum evento futuro encontrado para editar.'
        );
        return;
      }

      // Se encontrou exatamente um evento
      if (eventsToEdit.length === 1) {
        const eventToEdit = eventsToEdit[0];
        const eventStart = new Date(eventToEdit.start_time);

        // Se já especificou campo e valor, edita direto
        if (fieldToEdit && newValue) {
          const updateSuccess = await updateEvent(eventToEdit.id, {
            [fieldToEdit]: newValue
          }, { start_time: eventToEdit.start_time, end_time: eventToEdit.end_time });

          if (updateSuccess) {
            const fieldLabels: Record<string, string> = {
              title: 'Nome',
              date: 'Data',
              time: 'Horário',
              location: 'Local'
            };
            await sendWhatsAppMessage(remoteJid,
              `✅ *Evento atualizado!*\n\n` +
              `📅 ${eventToEdit.title}\n` +
              `✏️ ${fieldLabels[fieldToEdit]} alterado para: *${newValue}*`
            );
          } else {
            await sendWhatsAppMessage(remoteJid, '❌ Erro ao atualizar evento. Tente novamente.');
          }
          return;
        }

        // Se só especificou o campo, pergunta o novo valor
        if (fieldToEdit) {
          await updateSessionContext(user.user_id, {
            pending_edit: {
              event_id: eventToEdit.id,
              event_title: eventToEdit.title,
              start_time: eventToEdit.start_time,
              end_time: eventToEdit.end_time,
              field_to_edit: fieldToEdit
            },
            conversation_state: 'awaiting_edit_value'
          });

          const fieldPrompts: Record<string, string> = {
            title: '📝 Qual o novo nome?',
            date: '📆 Qual a nova data?\n_Ex: amanhã, 20/12, segunda_',
            time: '⏰ Qual o novo horário?\n_Ex: 14h, 14:00, 2 da tarde_',
            location: '📍 Qual o novo local?'
          };

          await sendWhatsAppMessage(remoteJid,
            `📅 *Editando: ${eventToEdit.title}*\n` +
            `📆 ${formatDateBR(eventStart)} às ${formatTimeBR(eventStart)}\n\n` +
            fieldPrompts[fieldToEdit]
          );
          return;
        }

        // Mostra opções de campo para editar
        await updateSessionContext(user.user_id, {
          pending_edit: {
            event_id: eventToEdit.id,
            event_title: eventToEdit.title,
            start_time: eventToEdit.start_time,
            end_time: eventToEdit.end_time,
            field_to_edit: null
          },
          conversation_state: 'awaiting_edit_field'
        });

        let editMsg = `📅 *Editando: ${eventToEdit.title}*\n` +
          `📆 ${formatDateBR(eventStart)} às ${formatTimeBR(eventStart)}`;
        if (eventToEdit.location) {
          editMsg += `\n📍 ${eventToEdit.location}`;
        }
        editMsg += `\n\nO que você quer alterar?\n` +
          `1️⃣ Nome\n` +
          `2️⃣ Data\n` +
          `3️⃣ Horário\n` +
          `4️⃣ Local`;

        await sendWhatsAppMessage(remoteJid, editMsg);
        return;
      }

      // Múltiplos eventos encontrados - pede para escolher
      await updateSessionContext(user.user_id, {
        pending_edit: {
          events_list: eventsToEdit.map(e => ({ id: e.id, title: e.title, start_time: e.start_time, end_time: e.end_time, location: e.location }))
        },
        conversation_state: 'awaiting_event_selection'
      });

      let listMsg = `📅 *Qual evento você quer editar?*\n\n`;
      eventsToEdit.forEach((event, idx) => {
        const eventTime = new Date(event.start_time);
        listMsg += `${idx + 1}️⃣ ${event.title}\n   📆 ${formatDateBR(eventTime)} às ${formatTimeBR(eventTime)}\n`;
      });
      listMsg += `\n_Responda com o número_`;

      await sendWhatsAppMessage(remoteJid, listMsg);
      break;
    }

    case 'event_selection': {
      if (context.conversation_state !== 'awaiting_event_selection') {
        await sendWhatsAppMessage(remoteJid, '🤔 Não estou esperando uma seleção. Diga "editar evento" para começar.');
        return;
      }

      const pendingEditData = context.pending_edit as { events_list: Array<{ id: string; title: string; start_time: string; end_time: string; location?: string }> };
      const eventsList = pendingEditData?.events_list || [];

      const selection = interpretation.selection?.toString().trim();
      const eventIndex = parseInt(selection) - 1;

      let selectedEvent = null;
      if (!isNaN(eventIndex) && eventIndex >= 0 && eventIndex < eventsList.length) {
        selectedEvent = eventsList[eventIndex];
      } else {
        // Tenta por nome
        selectedEvent = eventsList.find(e =>
          e.title.toLowerCase().includes(selection?.toLowerCase() || '')
        );
      }

      if (!selectedEvent) {
        let retryList = '';
        eventsList.forEach((e, idx) => {
          retryList += `${idx + 1}️⃣ ${e.title}\n`;
        });
        await sendWhatsAppMessage(remoteJid, `❌ Não encontrei. Qual evento?\n\n${retryList}`);
        return;
      }

      const selectedEventStart = new Date(selectedEvent.start_time);

      // Mostra opções de campo para editar
      await updateSessionContext(user.user_id, {
        pending_edit: {
          event_id: selectedEvent.id,
          event_title: selectedEvent.title,
          start_time: selectedEvent.start_time,
          end_time: selectedEvent.end_time,
          field_to_edit: null
        },
        conversation_state: 'awaiting_edit_field'
      });

      let editMsg = `📅 *Editando: ${selectedEvent.title}*\n` +
        `📆 ${formatDateBR(selectedEventStart)} às ${formatTimeBR(selectedEventStart)}`;
      if (selectedEvent.location) {
        editMsg += `\n📍 ${selectedEvent.location}`;
      }
      editMsg += `\n\nO que você quer alterar?\n` +
        `1️⃣ Nome\n` +
        `2️⃣ Data\n` +
        `3️⃣ Horário\n` +
        `4️⃣ Local`;

      await sendWhatsAppMessage(remoteJid, editMsg);
      break;
    }

    case 'edit_field_selection': {
      if (context.conversation_state !== 'awaiting_edit_field') {
        await sendWhatsAppMessage(remoteJid, '🤔 Não estou esperando uma seleção de campo. Diga "editar evento" para começar.');
        return;
      }

      const pendingEditField = context.pending_edit as { event_id: string; event_title: string; start_time: string; end_time: string };

      // Mapeia seleção para campo
      const fieldMap: Record<string, string> = {
        '1': 'title', 'nome': 'title',
        '2': 'date', 'data': 'date',
        '3': 'time', 'horário': 'time', 'horario': 'time', 'hora': 'time',
        '4': 'location', 'local': 'location'
      };

      const fieldKey = interpretation.field?.toLowerCase() || messageText.toLowerCase().trim();
      const field = fieldMap[fieldKey] || fieldMap[interpretation.field] || null;

      if (!field) {
        await sendWhatsAppMessage(remoteJid,
          `❌ Não entendi. O que você quer alterar?\n\n` +
          `1️⃣ Nome\n` +
          `2️⃣ Data\n` +
          `3️⃣ Horário\n` +
          `4️⃣ Local`
        );
        return;
      }

      await updateSessionContext(user.user_id, {
        pending_edit: {
          ...pendingEditField,
          field_to_edit: field
        },
        conversation_state: 'awaiting_edit_value'
      });

      const fieldPrompts: Record<string, string> = {
        title: '📝 Qual o novo nome?',
        date: '📆 Qual a nova data?\n_Ex: amanhã, 20/12, segunda_',
        time: '⏰ Qual o novo horário?\n_Ex: 14h, 14:00, 2 da tarde_',
        location: '📍 Qual o novo local?'
      };

      await sendWhatsAppMessage(remoteJid,
        `📅 *Editando: ${pendingEditField.event_title}*\n\n` +
        fieldPrompts[field]
      );
      break;
    }

    case 'edit_value_answer': {
      if (context.conversation_state !== 'awaiting_edit_value') {
        await sendWhatsAppMessage(remoteJid, '🤔 Não estou esperando um valor. Diga "editar evento" para começar.');
        return;
      }

      const pendingEditValue = context.pending_edit as {
        event_id: string;
        event_title: string;
        start_time: string;
        end_time: string;
        field_to_edit: string;
      };

      const newValueInput = interpretation.value || messageText.trim();
      const fieldToUpdate = pendingEditValue.field_to_edit;

      const updateSuccess = await updateEvent(pendingEditValue.event_id, {
        [fieldToUpdate]: newValueInput
      }, { start_time: pendingEditValue.start_time, end_time: pendingEditValue.end_time });

      if (updateSuccess) {
        const fieldLabels: Record<string, string> = {
          title: 'Nome',
          date: 'Data',
          time: 'Horário',
          location: 'Local'
        };
        await sendWhatsAppMessage(remoteJid,
          `✅ *Evento atualizado!*\n\n` +
          `📅 ${pendingEditValue.event_title}\n` +
          `✏️ ${fieldLabels[fieldToUpdate]} alterado para: *${newValueInput}*`
        );
      } else {
        await sendWhatsAppMessage(remoteJid, '❌ Erro ao atualizar evento. Tente novamente.');
      }

      await updateSessionContext(user.user_id, {
        pending_edit: null,
        conversation_state: 'idle'
      });
      break;
    }

    // ==================== FIM CASOS DE EDIÇÃO DE EVENTOS ====================

    // ==================== FIM CASOS DE AGENDA ====================

    case 'correction':
      // Usuário está corrigindo algo
      if (interpretation.correction_type === 'cancel') {
        await updateSessionContext(user.user_id, {
          pending_transaction: null,
          pending_event: null,
          conversation_state: 'idle'
        });
        await sendWhatsAppMessage(remoteJid, '✅ Cancelado! Me conte quando quiser registrar algo.');
        return;
      }

      // Se tem transação pendente, corrige
      if (context.pending_transaction) {
        const pendingToFix = context.pending_transaction as Record<string, unknown>;
        
        if (interpretation.correction_type === 'transaction_type') {
          const newType = interpretation.new_value as string;
          const fixedPending = { ...pendingToFix, transaction_type: newType };
          
          await updateSessionContext(user.user_id, {
            pending_transaction: fixedPending
          });
          
          const emojiFixed = newType === 'income' ? '💰' : '💸';
          const tipoFixed = newType === 'income' ? 'receita' : 'despesa';
          
          // Se estava aguardando descrição, continua perguntando
          if (context.conversation_state === 'awaiting_description') {
            await sendWhatsAppMessage(remoteJid,
              `✅ Corrigido para ${tipoFixed}!\n\n` +
              `${emojiFixed} *${formatCurrency(pendingToFix.amount as number)}*\n\n` +
              `📝 O que foi essa ${tipoFixed}?`
            );
          } else if (context.conversation_state === 'awaiting_account') {
            // Se estava aguardando conta, continua perguntando
            let accsListFix = '';
            accounts.forEach((acc, idx) => {
              accsListFix += `${idx + 1}️⃣ ${acc.name}\n`;
            });
            
            await sendWhatsAppMessage(remoteJid,
              `✅ Corrigido para ${tipoFixed}!\n\n` +
              `${emojiFixed} *${formatCurrency(pendingToFix.amount as number)}* - ${pendingToFix.description}\n\n` +
              `📂 Qual conta?\n${accsListFix}\n` +
              `_Responda com o número_`
            );
          }
          return;
        }
        
        if (interpretation.correction_type === 'amount') {
          const newAmount = interpretation.new_value as number;
          const fixedPending = { ...pendingToFix, amount: newAmount };
          
          await updateSessionContext(user.user_id, {
            pending_transaction: fixedPending
          });
          
          const emojiAmt = (pendingToFix.transaction_type as string) === 'income' ? '💰' : '💸';
          await sendWhatsAppMessage(remoteJid,
            `✅ Valor corrigido para *${formatCurrency(newAmount)}*!\n\n` +
            `${emojiAmt} Continuando...`
          );
          return;
        }
      } else {
        await sendWhatsAppMessage(remoteJid, '🤔 Não tenho nenhuma transação pendente para corrigir. Me conte sobre um gasto ou receita!');
      }
      break;

    case 'unknown':
    default:
      // FALLBACK INTELIGENTE: Se estamos em um estado de agenda, tenta processar a mensagem diretamente
      console.log(`⚠️ Fallback: Estado=${context.conversation_state}, OpenAI retornou=${interpretation.type}`);
      
      // Fallback para awaiting_event_date
      if (context.conversation_state === 'awaiting_event_date') {
        const fallbackDate = parseNaturalDate(messageText);
        if (fallbackDate || messageText.trim().length > 0) {
          const currentEventFallback = (context.pending_event as Record<string, unknown>) || {};
          const dateInputFallback = messageText.trim();
          
          // Também tenta extrair hora da mensagem
          const timeInDateMsg = parseNaturalTime(messageText);
          
          const updatedEventFallback = { 
            ...currentEventFallback, 
            date: dateInputFallback,
            time: timeInDateMsg ? dateInputFallback : currentEventFallback.time
          };
          
          // Se extraiu horário junto, pula para local
          if (timeInDateMsg) {
            await updateSessionContext(user.user_id, {
              pending_event: updatedEventFallback,
              conversation_state: 'awaiting_event_location'
            });
            await sendWhatsAppMessage(remoteJid, 
              `📅 *${currentEventFallback.title}*\n` +
              `📆 ${dateInputFallback}\n\n` +
              `📍 Qual o local?\n` +
              `_Responda "não" ou "pular" se não tiver_`
            );
            return;
          }
          
          await updateSessionContext(user.user_id, {
            pending_event: updatedEventFallback,
            conversation_state: 'awaiting_event_time'
          });
          await sendWhatsAppMessage(remoteJid, 
            `📅 *${currentEventFallback.title}*\n` +
            `📆 ${dateInputFallback}\n\n` +
            `⏰ Qual o horário?\n` +
            `_Ex: 14h, 14:00, 2 da tarde_`
          );
          return;
        }
      }
      
      // Fallback para awaiting_event_time
      if (context.conversation_state === 'awaiting_event_time') {
        const fallbackTime = parseNaturalTime(messageText);
        if (fallbackTime || messageText.trim().length > 0) {
          const currentEventFallback3 = (context.pending_event as Record<string, unknown>) || {};
          const timeInputFallback = messageText.trim();
          const updatedEventFallback3 = { ...currentEventFallback3, time: timeInputFallback };
          
          await updateSessionContext(user.user_id, {
            pending_event: updatedEventFallback3,
            conversation_state: 'awaiting_event_location'
          });
          await sendWhatsAppMessage(remoteJid, 
            `📅 *${currentEventFallback3.title}*\n` +
            `📆 ${currentEventFallback3.date} às ${timeInputFallback}\n\n` +
            `📍 Qual o local?\n` +
            `_Responda "não" ou "pular" se não tiver_`
          );
          return;
        }
      }
      
      // Fallback para awaiting_event_location
      if (context.conversation_state === 'awaiting_event_location') {
        const currentEventFallback4 = (context.pending_event as Record<string, unknown>) || {};
        const locationMsgLower = messageText.toLowerCase().trim();
        const skipLocationWords = ['não', 'nao', 'pular', 'nenhum', 'sem local', '-', 'n', 'nope', 'no'];
        const isSkipLocation = skipLocationWords.some(w => locationMsgLower === w || locationMsgLower.includes(w));
        
        const finalLocationFallback = isSkipLocation ? undefined : messageText.trim();
        
        // Parsear data e hora e criar evento
        const parsedDateFallback = parseNaturalDate(currentEventFallback4.date as string);
        const parsedTimeFallback = parseNaturalTime(currentEventFallback4.time as string);
        
        if (!parsedDateFallback) {
          await sendWhatsAppMessage(remoteJid, '❌ Não entendi a data informada. Vamos recomeçar - diga "criar evento".');
          await updateSessionContext(user.user_id, {
            pending_event: null,
            conversation_state: 'idle'
          });
          return;
        }
        
        if (!parsedTimeFallback) {
          await sendWhatsAppMessage(remoteJid, '❌ Não entendi o horário informado. Vamos recomeçar - diga "criar evento".');
          await updateSessionContext(user.user_id, {
            pending_event: null,
            conversation_state: 'idle'
          });
          return;
        }
        
        const eventSuccessFallback = await createEvent(user.user_id, {
          title: currentEventFallback4.title as string,
          date: parsedDateFallback,
          time: parsedTimeFallback,
          location: finalLocationFallback,
        });
        
        if (eventSuccessFallback) {
          const eventDateFallback = new Date(`${parsedDateFallback}T${parsedTimeFallback}:00`);
          let confirmMsgFallback = `✅ *Evento criado!*\n\n` +
            `📅 ${currentEventFallback4.title}\n` +
            `📆 ${formatDateBR(eventDateFallback)} às ${formatTimeBR(eventDateFallback)}`;
          
          if (finalLocationFallback) {
            confirmMsgFallback += `\n📍 ${finalLocationFallback}`;
          }
          
          await sendWhatsAppMessage(remoteJid, confirmMsgFallback);
        } else {
          await sendWhatsAppMessage(remoteJid, '❌ Erro ao criar evento. Tente novamente.');
        }
        
        await updateSessionContext(user.user_id, {
          pending_event: null,
          conversation_state: 'idle'
        });
        return;
      }
      
      // Fallback para awaiting_event_title
      if (context.conversation_state === 'awaiting_event_title') {
        const currentEventFallbackTitle = (context.pending_event as Record<string, unknown>) || {};
        const titleFallback = messageText.trim();
        
        // Tenta extrair data e hora
        const extractedDateFallback = parseNaturalDate(titleFallback);
        const extractedTimeFallback = parseNaturalTime(titleFallback);
        
        let cleanTitleFallback = titleFallback
          .replace(/(?:no\s*)?dia\s*\d{1,2}/gi, '')
          .replace(/\d{1,2}\/\d{1,2}(?:\/\d{2,4})?/g, '')
          .replace(/(?:às?|as)\s*\d{1,2}(?:h|:)?\d{0,2}/gi, '')
          .replace(/\d{1,2}h\d{0,2}/gi, '')
          .replace(/\d{1,2}\s*(?:da\s*)?(tarde|noite|manhã)/gi, '')
          .replace(/amanh[aã]/gi, '')
          .replace(/hoje/gi, '')
          .replace(/segunda|terça|terca|quarta|quinta|sexta|s[aá]bado|domingo/gi, '')
          .trim()
          .replace(/\s+/g, ' ');
        
        if (cleanTitleFallback.length < 2) {
          cleanTitleFallback = titleFallback;
        }
        
        const updatedEventFallbackTitle = { 
          ...currentEventFallbackTitle, 
          title: cleanTitleFallback,
          date: extractedDateFallback ? titleFallback : currentEventFallbackTitle.date,
          time: extractedTimeFallback ? titleFallback : currentEventFallbackTitle.time
        };
        
        // Decide próximo estado
        if (extractedDateFallback && extractedTimeFallback) {
          await updateSessionContext(user.user_id, {
            pending_event: updatedEventFallbackTitle,
            conversation_state: 'awaiting_event_location'
          });
          await sendWhatsAppMessage(remoteJid, 
            `📅 *${cleanTitleFallback}*\n` +
            `📆 ${titleFallback}\n\n` +
            `📍 Qual o local?\n` +
            `_Responda "não" ou "pular" se não tiver_`
          );
          return;
        }
        
        if (extractedDateFallback) {
          await updateSessionContext(user.user_id, {
            pending_event: updatedEventFallbackTitle,
            conversation_state: 'awaiting_event_time'
          });
          await sendWhatsAppMessage(remoteJid, 
            `📅 *${cleanTitleFallback}*\n` +
            `📆 ${titleFallback}\n\n` +
            `⏰ Qual o horário?\n` +
            `_Ex: 14h, 14:00, 2 da tarde_`
          );
          return;
        }
        
        await updateSessionContext(user.user_id, {
          pending_event: updatedEventFallbackTitle,
          conversation_state: 'awaiting_event_date'
        });
        await sendWhatsAppMessage(remoteJid, 
          `📅 *${cleanTitleFallback}*\n\n` +
          `📆 Qual a data?\n` +
          `_Ex: amanhã, 20/12, segunda_`
        );
        return;
      }
      
      // Nenhum fallback aplicável, mostra mensagem padrão
      await sendWhatsAppMessage(remoteJid, 
        interpretation.message || 
        '🤔 Não entendi. Você pode:\n\n' +
        '💰 *Finanças:*\n' +
        '• "Gastei 50 no almoço"\n' +
        '• "Recebi 1000 de salário"\n' +
        '• "Quanto gastei essa semana?"\n\n' +
        '📅 *Agenda:*\n' +
        '• "Criar evento reunião amanhã 14h"\n' +
        '• "O que tenho hoje?"\n' +
        '• "Editar evento reunião"\n' +
        '• "Mudar horário da consulta para 15h"'
      );
      break;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('📩 Webhook recebido:', JSON.stringify(body, null, 2));

    // Valida se é uma mensagem de texto
    const event = body.event;
    const data = body.data;

    if (event !== 'messages.upsert') {
      console.log('⏭️ Evento ignorado:', event);
      return new Response(JSON.stringify({ status: 'ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Ignora mensagens enviadas por nós
    if (data?.key?.fromMe) {
      console.log('⏭️ Mensagem própria ignorada');
      return new Response(JSON.stringify({ status: 'ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const remoteJid = data?.key?.remoteJid;
    const messageType = data?.messageType;
    
    let messageText: string | null = null;

    // Mensagem de texto
    if (messageType === 'conversation' || messageType === 'extendedTextMessage') {
      messageText = data?.message?.conversation || data?.message?.extendedTextMessage?.text;
    }
    // Mensagem de áudio
    else if (messageType === 'audioMessage') {
      console.log('🎤 Mensagem de áudio recebida');
      console.log('📋 Dados do áudio:', JSON.stringify(data?.message?.audioMessage || {}).substring(0, 500));
      
      // Pega a key da mensagem para baixar o áudio via API
      const messageKey = data?.key;
      console.log('🔑 Message key:', JSON.stringify(messageKey));
      
      if (!messageKey) {
        console.log('❌ Áudio sem key para download');
        await sendWhatsAppMessage(remoteJid, '❌ Não consegui identificar o áudio.');
        return new Response(JSON.stringify({ status: 'no_key' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Baixa o base64 via Evolution API (silenciosamente)
      const audioBase64 = await downloadAudioFromEvolution(messageKey);
      
      if (!audioBase64) {
        console.log('❌ Falha ao baixar áudio da Evolution API');
        await sendWhatsAppMessage(remoteJid, '❌ Não consegui acessar o áudio. Tente enviar novamente.');
        return new Response(JSON.stringify({ status: 'download_failed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Transcreve o áudio
      messageText = await transcribeAudio(audioBase64);
      
      if (!messageText) {
        await sendWhatsAppMessage(remoteJid, '❌ Não consegui entender o áudio. Pode tentar novamente ou enviar por texto?');
        return new Response(JSON.stringify({ status: 'transcription_failed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      console.log(`✅ Áudio transcrito com sucesso: ${messageText}`);
    }
    // Tipo não suportado
    else {
      console.log(`⏭️ Tipo de mensagem não suportado: ${messageType}`);
      await sendWhatsAppMessage(remoteJid, '📝 Só consigo processar texto e áudio. Envia de outra forma!');
      return new Response(JSON.stringify({ status: 'unsupported_type' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!remoteJid || !messageText) {
      console.log('⏭️ Mensagem inválida - sem remoteJid ou texto');
      return new Response(JSON.stringify({ status: 'invalid' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Processa a mensagem de forma assíncrona
    processMessage(remoteJid, messageText).catch(err => {
      console.error('Erro ao processar mensagem:', err);
    });

    return new Response(JSON.stringify({ status: 'processing' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erro no webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
