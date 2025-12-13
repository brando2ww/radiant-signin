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

// Interpreta mensagem usando OpenAI
async function interpretMessage(message: string, context: Record<string, unknown>) {
  console.log(`🤖 Interpretando mensagem: ${message}`);
  
  const systemPrompt = `Você é um assistente financeiro via WhatsApp. Sua função é interpretar mensagens e extrair informações financeiras.

IMPORTANTE: Responda SEMPRE em JSON válido.

Se a mensagem indicar uma transação financeira (gasto, receita, pagamento, etc):
{
  "type": "transaction",
  "transaction_type": "expense" ou "income",
  "amount": número (valor em reais),
  "description": "descrição curta",
  "category": "categoria sugerida",
  "needs_confirmation": true
}

Se for uma pergunta sobre contas ou saldo:
{
  "type": "query",
  "query_type": "accounts" ou "balance" ou "transactions",
  "message": "resposta amigável"
}

Se for uma confirmação (sim, ok, pode, confirma, etc):
{
  "type": "confirmation",
  "confirmed": true ou false
}

Se for seleção de conta (número ou nome):
{
  "type": "account_selection",
  "selection": "valor informado pelo usuário"
}

Se for saudação ou conversa casual:
{
  "type": "greeting",
  "message": "resposta amigável e breve"
}

Se não entender:
{
  "type": "unknown",
  "message": "mensagem pedindo esclarecimento"
}

Contexto atual: ${JSON.stringify(context)}`;

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
        temperature: 0.3,
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
          message: {
            key: messageKey
          },
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
    console.log('✅ Áudio baixado! Tamanho base64:', result.base64?.length || 0);
    return result.base64 || null;
  } catch (error) {
    console.error('❌ Erro ao baixar áudio:', error);
    return null;
  }
}

// Transcreve áudio usando OpenAI Whisper
async function transcribeAudio(audioBase64: string): Promise<string | null> {
  console.log('🎤 Transcrevendo áudio...');
  
  try {
    // Converte base64 para Uint8Array
    const binaryAudio = Uint8Array.from(atob(audioBase64), c => c.charCodeAt(0));
    
    // Prepara FormData para a API
    const formData = new FormData();
    const blob = new Blob([binaryAudio], { type: 'audio/ogg' });
    formData.append('file', blob, 'audio.ogg');
    formData.append('model', 'whisper-1');
    formData.append('language', 'pt');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro OpenAI Whisper:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json();
    console.log(`✅ Áudio transcrito: ${result.text}`);
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
  
  // Interpreta a mensagem
  const interpretation = await interpretMessage(messageText, {
    state: context.conversation_state,
    pendingTransaction: context.pending_transaction,
    hasAccounts: accounts.length > 0,
    lastAccountId: context.last_account_id,
  });

  console.log(`🧠 Interpretação:`, interpretation);

  // Processa baseado no tipo de interpretação e estado da conversa
  switch (interpretation.type) {
    case 'greeting':
      await sendWhatsAppMessage(remoteJid, interpretation.message || 'Olá! 👋 Como posso ajudar com suas finanças hoje?');
      break;

    case 'transaction':
      if (accounts.length === 0) {
        await sendWhatsAppMessage(remoteJid, 
          '❌ Você ainda não tem contas bancárias cadastradas.\n\n' +
          '📱 Acesse o app para cadastrar sua primeira conta!'
        );
        return;
      }

      // Salva transação pendente
      await updateSessionContext(user.user_id, {
        pending_transaction: interpretation,
        conversation_state: 'awaiting_account'
      });

      // Lista contas para seleção
      let accountsList = '📂 *Em qual conta você quer registrar?*\n\n';
      accounts.forEach((acc, idx) => {
        accountsList += `${idx + 1}️⃣ ${acc.name} (${formatCurrency(acc.current_balance)})\n`;
      });
      accountsList += '\n_Responda com o número da conta_';

      const emoji = interpretation.transaction_type === 'income' ? '💰' : '💸';
      const tipoTexto = interpretation.transaction_type === 'income' ? 'receita' : 'despesa';
      
      await sendWhatsAppMessage(remoteJid, 
        `${emoji} Encontrei uma *${tipoTexto}*:\n\n` +
        `💵 Valor: *${formatCurrency(interpretation.amount)}*\n` +
        `📝 Descrição: ${interpretation.description}\n` +
        `🏷️ Categoria: ${interpretation.category}\n\n` +
        accountsList
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
        await sendWhatsAppMessage(remoteJid, '❌ Não encontrei essa conta. Tente novamente com o número ou nome.');
        return;
      }

      // Atualiza estado para aguardar confirmação
      await updateSessionContext(user.user_id, {
        last_account_id: selectedAccount.id,
        conversation_state: 'awaiting_confirmation'
      });

      const pending = context.pending_transaction;
      const tipoTx = pending.transaction_type === 'income' ? 'receita' : 'despesa';
      
      await sendWhatsAppMessage(remoteJid,
        `✅ *Confirma o registro?*\n\n` +
        `💵 Valor: *${formatCurrency(pending.amount)}*\n` +
        `📝 Descrição: ${pending.description}\n` +
        `🏷️ Tipo: ${tipoTx}\n` +
        `🏦 Conta: ${selectedAccount.name}\n\n` +
        `_Responda *sim* para confirmar ou *não* para cancelar_`
      );
      break;

    case 'confirmation':
      if (context.conversation_state !== 'awaiting_confirmation' || !context.pending_transaction) {
        await sendWhatsAppMessage(remoteJid, '🤔 Não tenho nada para confirmar. Me conte sobre um gasto ou receita!');
        return;
      }

      if (interpretation.confirmed) {
        // Cria a transação
        const success = await createTransaction(
          user.user_id,
          context.last_account_id,
          context.pending_transaction
        );

        if (success) {
          const tx = context.pending_transaction;
          const tipo = tx.transaction_type === 'income' ? 'receita' : 'despesa';
          const account = accounts.find(a => a.id === context.last_account_id);
          
          await sendWhatsAppMessage(remoteJid,
            `✅ *Transação registrada com sucesso!*\n\n` +
            `💵 Valor: *${formatCurrency(tx.amount)}*\n` +
            `📝 Descrição: ${tx.description}\n` +
            `🏷️ Tipo: ${tipo}\n` +
            `🏦 Conta: ${account?.name || 'N/A'}\n\n` +
            `📊 Continue registrando suas finanças! 💪`
          );
        } else {
          await sendWhatsAppMessage(remoteJid, '❌ Erro ao registrar transação. Tente novamente.');
        }

        // Limpa estado
        await updateSessionContext(user.user_id, {
          pending_transaction: null,
          conversation_state: 'idle'
        });
      } else {
        await sendWhatsAppMessage(remoteJid, '❌ Transação cancelada. Me avise quando quiser registrar algo!');
        await updateSessionContext(user.user_id, {
          pending_transaction: null,
          conversation_state: 'idle'
        });
      }
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
      } else {
        await sendWhatsAppMessage(remoteJid, interpretation.message || 'Consulta não suportada ainda.');
      }
      break;

    case 'unknown':
    default:
      await sendWhatsAppMessage(remoteJid, 
        interpretation.message || 
        '🤔 Não entendi. Você pode me dizer coisas como:\n\n' +
        '• "Gastei 50 reais no almoço"\n' +
        '• "Recebi 1000 de salário"\n' +
        '• "Quais são minhas contas?"'
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

  } catch (error: unknown) {
    console.error('❌ Erro no webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
