import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const evolutionApiUrl = Deno.env.get('EVOLUTION_API_URL')
  const evolutionApiKey = Deno.env.get('EVOLUTION_API_KEY')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  if (!evolutionApiUrl || !evolutionApiKey) {
    return new Response(
      JSON.stringify({ error: 'Evolution API not configured' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const url = new URL(req.url)
  const action = url.pathname.split('/').pop()

  try {
    const body = await req.json()
    const { userId, instanceName } = body

    if (!userId || !instanceName) {
      return new Response(
        JSON.stringify({ error: 'userId and instanceName are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Generate QR Code
    if (action === 'generate') {
      console.log(`[whatsapp-qrcode] Generating QR for instance: ${instanceName}`)

      // 1. First, try to fetch instance to check if it exists
      const fetchResponse = await fetch(
        `${evolutionApiUrl}/instance/fetchInstances?instanceName=${instanceName}`,
        { headers: { 'apikey': evolutionApiKey } }
      )
      const instances = await fetchResponse.json()
      console.log('[whatsapp-qrcode] Fetch instances response:', JSON.stringify(instances))

      // Check if instance exists and its status
      const instance = Array.isArray(instances) ? instances[0] : instances?.instance
      const connectionStatus = instance?.instance?.status || instance?.connectionStatus

      // If already connected, update DB and return
      if (connectionStatus === 'open') {
        console.log('[whatsapp-qrcode] Instance already connected')
        
        // Get profile info if available
        const profileName = instance?.instance?.profileName || instance?.profileName || null
        const profilePictureUrl = instance?.instance?.profilePictureUrl || instance?.profilePictureUrl || null
        const phoneNumber = instance?.instance?.ownerJid?.split('@')[0] || instance?.ownerJid?.split('@')[0] || null

        await supabase.from('whatsapp_connections').upsert({
          user_id: userId,
          instance_name: instanceName,
          connection_status: 'open',
          profile_name: profileName,
          profile_picture_url: profilePictureUrl,
          phone_number: phoneNumber,
          connected_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString()
        }, { onConflict: 'user_id,instance_name' })

        return new Response(
          JSON.stringify({ 
            status: 'connected',
            profile_name: profileName,
            profile_picture_url: profilePictureUrl,
            phone_number: phoneNumber
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // 2. If instance doesn't exist, create it
      if (!instance || !Array.isArray(instances) || instances.length === 0) {
        console.log('[whatsapp-qrcode] Creating new instance')
        const createResponse = await fetch(
          `${evolutionApiUrl}/instance/create`,
          {
            method: 'POST',
            headers: {
              'apikey': evolutionApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              instanceName: instanceName,
              integration: 'WHATSAPP-BAILEYS',
              qrcode: true
            })
          }
        )
        const createData = await createResponse.json()
        console.log('[whatsapp-qrcode] Create instance response:', JSON.stringify(createData))
      }

      // 3. Connect instance to generate QR code
      console.log('[whatsapp-qrcode] Connecting instance to get QR code')
      const connectResponse = await fetch(
        `${evolutionApiUrl}/instance/connect/${instanceName}`,
        { headers: { 'apikey': evolutionApiKey } }
      )
      const connectData = await connectResponse.json()
      console.log('[whatsapp-qrcode] Connect response status:', connectResponse.status)

      // Check if we got a QR code
      if (connectData.base64 || connectData.code) {
        // Extract clean base64 (remove data:image/png;base64, prefix if present)
        const base64 = connectData.base64?.split(',').pop() || connectData.base64 || connectData.code

        // Update DB with connecting status
        await supabase.from('whatsapp_connections').upsert({
          user_id: userId,
          instance_name: instanceName,
          connection_status: 'connecting'
        }, { onConflict: 'user_id,instance_name' })

        return new Response(
          JSON.stringify({ status: 'pending', qrcode: base64 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // If no QR code and not connected, return error
      return new Response(
        JSON.stringify({ error: 'Failed to generate QR code', details: connectData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Check Status
    if (action === 'status') {
      console.log(`[whatsapp-qrcode] Checking status for instance: ${instanceName}`)

      const fetchResponse = await fetch(
        `${evolutionApiUrl}/instance/fetchInstances?instanceName=${instanceName}`,
        { headers: { 'apikey': evolutionApiKey } }
      )
      const instances = await fetchResponse.json()
      
      const instance = Array.isArray(instances) ? instances[0] : instances?.instance
      const connectionStatus = instance?.instance?.status || instance?.connectionStatus || 'disconnected'

      if (connectionStatus === 'open') {
        // Get profile info
        const profileName = instance?.instance?.profileName || instance?.profileName || null
        const profilePictureUrl = instance?.instance?.profilePictureUrl || instance?.profilePictureUrl || null
        const phoneNumber = instance?.instance?.ownerJid?.split('@')[0] || instance?.ownerJid?.split('@')[0] || null

        // Update DB
        await supabase.from('whatsapp_connections').upsert({
          user_id: userId,
          instance_name: instanceName,
          connection_status: 'open',
          profile_name: profileName,
          profile_picture_url: profilePictureUrl,
          phone_number: phoneNumber,
          connected_at: new Date().toISOString(),
          last_seen_at: new Date().toISOString()
        }, { onConflict: 'user_id,instance_name' })

        return new Response(
          JSON.stringify({ 
            status: 'open',
            profile_name: profileName,
            profile_picture_url: profilePictureUrl,
            phone_number: phoneNumber
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ status: connectionStatus }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ACTION: Disconnect
    if (action === 'disconnect') {
      console.log(`[whatsapp-qrcode] Disconnecting instance: ${instanceName}`)

      // Logout from Evolution API
      const logoutResponse = await fetch(
        `${evolutionApiUrl}/instance/logout/${instanceName}`,
        { 
          method: 'DELETE',
          headers: { 'apikey': evolutionApiKey } 
        }
      )
      console.log('[whatsapp-qrcode] Logout response status:', logoutResponse.status)

      // Update DB
      await supabase.from('whatsapp_connections').update({
        connection_status: 'disconnected',
        phone_number: null,
        profile_name: null,
        profile_picture_url: null
      }).eq('user_id', userId).eq('instance_name', instanceName)

      return new Response(
        JSON.stringify({ status: 'disconnected' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use: generate, status, or disconnect' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('[whatsapp-qrcode] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
