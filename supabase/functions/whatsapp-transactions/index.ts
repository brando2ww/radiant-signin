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
  console.log(`📋 Contexto atual:`, JSON.stringify(context));
  
  const systemPrompt = `Você é um assistente financeiro via WhatsApp. Sua função é interpretar mensagens e extrair informações financeiras.

IMPORTANTE: Responda SEMPRE em JSON válido.

🚨🚨🚨 REGRA ABSOLUTAMENTE CRÍTICA - TIPO DE TRANSAÇÃO:

DESPESA (expense) - SEMPRE quando o usuário usa:
- "gastei", "paguei", "saiu", "comprei", "despesa", "gasto", "custo", "fiz um pix", "transferi"
- QUALQUER indicação de dinheiro SAINDO

RECEITA (income) - SEMPRE quando o usuário usa:
- "recebi", "entrou", "ganhei", "receita", "salário", "vendi", "faturei", "caiu na conta", "me pagaram"
- QUALQUER indicação de dinheiro ENTRANDO

⚠️ NUNCA confunda "gastei" com receita - "gastei" é SEMPRE DESPESA!
⚠️ NUNCA confunda "recebi" com despesa - "recebi" é SEMPRE RECEITA!

🚨 REGRA CRÍTICA - ANALISE O ESTADO ATUAL:
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

3. CONSULTA - Se for uma pergunta sobre contas ou saldo:
{
  "type": "query",
  "query_type": "accounts" ou "balance" ou "transactions",
  "message": "resposta amigável"
}

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

6. SAUDAÇÃO - Se for saudação ou conversa casual:
{
  "type": "greeting",
  "message": "resposta amigável e breve"
}

7. NÃO ENTENDEU:
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
  
  // Interpreta a mensagem com contexto completo
  const interpretation = await interpretMessage(messageText, {
    conversation_state: context.conversation_state,
    pending_transaction: context.pending_transaction,
    accounts_count: accounts.length,
    last_account_id: context.last_account_id,
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
      } else {
        await sendWhatsAppMessage(remoteJid, interpretation.message || 'Consulta não suportada ainda.');
      }
      break;

    case 'correction':
      // Usuário está corrigindo algo
      if (interpretation.correction_type === 'cancel') {
        await updateSessionContext(user.user_id, {
          pending_transaction: null,
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
