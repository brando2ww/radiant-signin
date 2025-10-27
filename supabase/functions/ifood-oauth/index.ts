import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, code, clientId, clientSecret } = await req.json();

    if (action === 'exchange_code') {
      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('iFood token exchange error:', errorData);
        throw new Error(`Failed to exchange code: ${errorData}`);
      }

      const tokenData = await tokenResponse.json();
      
      // Get merchant info
      const merchantResponse = await fetch('https://merchant-api.ifood.com.br/merchant/v1.0/merchants', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      const merchantData = await merchantResponse.json();
      const merchantId = merchantData[0]?.id || null;

      // Calculate token expiration
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

      // Update PDV settings with iFood credentials
      const { error: updateError } = await supabase
        .from('pdv_settings')
        .update({
          ifood_merchant_id: merchantId,
          ifood_access_token: tokenData.access_token,
          ifood_refresh_token: tokenData.refresh_token,
          ifood_token_expires_at: expiresAt,
          ifood_enabled: true,
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating settings:', updateError);
        throw updateError;
      }

      // Log successful connection
      await supabase.from('pdv_ifood_sync_logs').insert({
        user_id: user.id,
        sync_type: 'oauth_connection',
        status: 'success',
        details: { merchant_id: merchantId },
      });

      return new Response(
        JSON.stringify({ success: true, merchantId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'refresh_token') {
      // Get current refresh token
      const { data: settings } = await supabase
        .from('pdv_settings')
        .select('ifood_refresh_token')
        .eq('user_id', user.id)
        .single();

      if (!settings?.ifood_refresh_token) {
        throw new Error('No refresh token available');
      }

      // Refresh access token
      const tokenResponse = await fetch('https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: settings.ifood_refresh_token,
        }),
      });

      if (!tokenResponse.ok) {
        throw new Error('Failed to refresh token');
      }

      const tokenData = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString();

      // Update tokens
      const { error: updateError } = await supabase
        .from('pdv_settings')
        .update({
          ifood_access_token: tokenData.access_token,
          ifood_refresh_token: tokenData.refresh_token,
          ifood_token_expires_at: expiresAt,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'disconnect') {
      // Disconnect iFood integration
      const { error: updateError } = await supabase
        .from('pdv_settings')
        .update({
          ifood_enabled: false,
          ifood_access_token: null,
          ifood_refresh_token: null,
          ifood_token_expires_at: null,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      await supabase.from('pdv_ifood_sync_logs').insert({
        user_id: user.id,
        sync_type: 'oauth_disconnection',
        status: 'success',
      });

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in ifood-oauth:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
