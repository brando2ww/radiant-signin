import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userId, code } = await req.json()

    if (!userId || !code) {
      return new Response(
        JSON.stringify({ error: 'userId e code são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find the 2FA code
    const { data: twoFactorCode, error: selectError } = await supabase
      .from('two_factor_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (selectError || !twoFactorCode) {
      console.error('2FA code not found or expired:', selectError)
      return new Response(
        JSON.stringify({ 
          error: 'Código inválido ou expirado',
          valid: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark code as used
    const { error: updateError } = await supabase
      .from('two_factor_codes')
      .update({ used_at: new Date().toISOString() })
      .eq('id', twoFactorCode.id)

    if (updateError) {
      console.error('Error updating 2FA code:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar código' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`2FA code verified for user ${userId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        valid: true,
        message: 'Código 2FA verificado com sucesso'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in verify-2fa-code:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
