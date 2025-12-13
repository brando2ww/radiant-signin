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
    const { phoneNumber, code, userId } = await req.json()

    if (!phoneNumber || !code || !userId) {
      return new Response(
        JSON.stringify({ error: 'phoneNumber, code e userId são obrigatórios' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format phone number (remove non-digits)
    const formattedPhone = phoneNumber.replace(/\D/g, '')

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Find the verification record
    const { data: verification, error: selectError } = await supabase
      .from('whatsapp_verifications')
      .select('*')
      .eq('user_id', userId)
      .eq('phone_number', formattedPhone)
      .eq('verification_code', code)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (selectError || !verification) {
      console.error('Verification not found or expired:', selectError)
      return new Response(
        JSON.stringify({ 
          error: 'Código inválido ou expirado',
          valid: false 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from('whatsapp_verifications')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
      })
      .eq('id', verification.id)

    if (updateError) {
      console.error('Error updating verification:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar verificação' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`WhatsApp ${formattedPhone} verified for user ${userId}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        valid: true,
        message: 'WhatsApp verificado com sucesso',
        phoneNumber: formattedPhone
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in verify-whatsapp-code:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
