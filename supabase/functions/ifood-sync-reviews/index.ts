import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.49.4/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Map iFood 1-5 score to NPS 0-10 scale
function mapIfoodScoreToNps(score: number): number {
  const map: Record<number, number> = { 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 };
  return map[score] ?? score * 2;
}

async function refreshIfoodToken(userId: string, refreshToken: string, clientId: string, clientSecret: string): Promise<string | null> {
  try {
    const res = await fetch("https://merchant-api.ifood.com.br/authentication/v1.0/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!res.ok) {
      console.error(`Token refresh failed for user ${userId}:`, await res.text());
      return null;
    }

    const data = await res.json();
    const expiresAt = new Date(Date.now() + data.expiresIn * 1000).toISOString();

    await supabase
      .from("pdv_settings")
      .update({
        ifood_access_token: data.accessToken,
        ifood_refresh_token: data.refreshToken,
        ifood_token_expires_at: expiresAt,
      })
      .eq("user_id", userId);

    return data.accessToken;
  } catch (err) {
    console.error(`Error refreshing token for user ${userId}:`, err);
    return null;
  }
}

async function fetchIfoodReviews(merchantId: string, accessToken: string): Promise<any[]> {
  try {
    const res = await fetch(
      `https://merchant-api.ifood.com.br/review/v2.0/merchants/${merchantId}/reviews?pageSize=50`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) {
      console.error("iFood reviews API error:", res.status, await res.text());
      return [];
    }

    const data = await res.json();
    return data.reviews || data || [];
  } catch (err) {
    console.error("Error fetching iFood reviews:", err);
    return [];
  }
}

async function syncReviewsForUser(settings: any): Promise<number> {
  const {
    user_id,
    ifood_merchant_id,
    ifood_access_token,
    ifood_refresh_token,
    ifood_client_id,
    ifood_client_secret,
    ifood_token_expires_at,
  } = settings;

  let accessToken = ifood_access_token;

  // Refresh token if expired
  if (ifood_token_expires_at && new Date(ifood_token_expires_at) < new Date()) {
    accessToken = await refreshIfoodToken(user_id, ifood_refresh_token, ifood_client_id, ifood_client_secret);
    if (!accessToken) return 0;
  }

  if (!accessToken) {
    console.log(`No access token for user ${user_id}, skipping`);
    return 0;
  }

  const reviews = await fetchIfoodReviews(ifood_merchant_id, accessToken);
  let imported = 0;

  for (const review of reviews) {
    const externalId = `ifood_${review.id || review.reviewId}`;
    const npsScore = mapIfoodScoreToNps(review.score || review.rating || 3);
    const customerName = review.customerName || review.customer?.name || "Cliente iFood";
    const evaluationDate = review.createdAt || review.date || new Date().toISOString();

    // Check if already imported
    const { data: existing } = await supabase
      .from("customer_evaluations")
      .select("id")
      .eq("external_id", externalId)
      .maybeSingle();

    if (existing) continue;

    const { error } = await supabase
      .from("customer_evaluations")
      .insert({
        user_id,
        customer_name: customerName,
        customer_whatsapp: "",
        customer_birth_date: "2000-01-01",
        nps_score: npsScore,
        evaluation_date: evaluationDate,
        source: "ifood",
        external_id: externalId,
      });

    if (error) {
      console.error(`Error inserting review ${externalId}:`, error);
    } else {
      imported++;
    }
  }

  return imported;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    let targetUserId: string | null = null;

    // If called with a specific user_id (manual sync)
    if (req.method === "POST") {
      try {
        const body = await req.json();
        targetUserId = body.user_id || null;
      } catch {
        // No body, sync all
      }
    }

    // Build query for users with iFood enabled
    let query = supabase
      .from("pdv_settings")
      .select("user_id, ifood_merchant_id, ifood_access_token, ifood_refresh_token, ifood_client_id, ifood_client_secret, ifood_token_expires_at")
      .eq("ifood_enabled", true)
      .not("ifood_merchant_id", "is", null);

    if (targetUserId) {
      query = query.eq("user_id", targetUserId);
    }

    const { data: merchants, error } = await query;

    if (error) {
      console.error("Error fetching merchants:", error);
      return new Response(JSON.stringify({ error: "Failed to fetch merchants" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let totalImported = 0;
    for (const merchant of merchants || []) {
      const count = await syncReviewsForUser(merchant);
      totalImported += count;
      console.log(`User ${merchant.user_id}: imported ${count} reviews`);
    }

    return new Response(
      JSON.stringify({ success: true, imported: totalImported }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
