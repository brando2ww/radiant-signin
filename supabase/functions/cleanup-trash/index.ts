import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrashItem {
  id: string;
  user_id: string;
  deleted_at: string;
  name?: string;
  number?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twentyThreeDaysAgo = new Date(now.getTime() - 23 * 24 * 60 * 60 * 1000);

    const results = {
      warnings_sent: 0,
      tables_deleted: 0,
      sectors_deleted: 0,
      errors: [] as string[],
    };

    // 1. Buscar mesas para avisar (23-30 dias na lixeira)
    const { data: tablesToWarn, error: tablesWarnError } = await supabase
      .from('pdv_tables')
      .select('id, user_id, number, deleted_at')
      .eq('is_active', false)
      .lt('deleted_at', twentyThreeDaysAgo.toISOString())
      .gte('deleted_at', thirtyDaysAgo.toISOString());

    if (tablesWarnError) {
      results.errors.push(`Error fetching tables to warn: ${tablesWarnError.message}`);
    } else if (tablesToWarn && tablesToWarn.length > 0) {
      for (const table of tablesToWarn) {
        const daysLeft = Math.ceil((new Date(table.deleted_at).getTime() + 30 * 24 * 60 * 60 * 1000 - now.getTime()) / (24 * 60 * 60 * 1000));
        
        // Verificar se já existe notificação de aviso para este item
        const { data: existingNotification } = await supabase
          .from('pdv_notifications')
          .select('id')
          .eq('user_id', table.user_id)
          .eq('type', 'trash_warning')
          .contains('data', { item_id: table.id, item_type: 'table' })
          .single();

        if (!existingNotification) {
          await supabase.from('pdv_notifications').insert({
            user_id: table.user_id,
            type: 'trash_warning',
            title: 'Mesa será excluída em breve',
            message: `A Mesa ${table.number} será excluída permanentemente em ${daysLeft} dias.`,
            data: { item_id: table.id, item_type: 'table', days_left: daysLeft },
          });
          results.warnings_sent++;
        }
      }
    }

    // 2. Buscar setores para avisar (23-30 dias na lixeira)
    const { data: sectorsToWarn, error: sectorsWarnError } = await supabase
      .from('pdv_sectors')
      .select('id, user_id, name, deleted_at')
      .eq('is_active', false)
      .lt('deleted_at', twentyThreeDaysAgo.toISOString())
      .gte('deleted_at', thirtyDaysAgo.toISOString());

    if (sectorsWarnError) {
      results.errors.push(`Error fetching sectors to warn: ${sectorsWarnError.message}`);
    } else if (sectorsToWarn && sectorsToWarn.length > 0) {
      for (const sector of sectorsToWarn) {
        const daysLeft = Math.ceil((new Date(sector.deleted_at).getTime() + 30 * 24 * 60 * 60 * 1000 - now.getTime()) / (24 * 60 * 60 * 1000));
        
        const { data: existingNotification } = await supabase
          .from('pdv_notifications')
          .select('id')
          .eq('user_id', sector.user_id)
          .eq('type', 'trash_warning')
          .contains('data', { item_id: sector.id, item_type: 'sector' })
          .single();

        if (!existingNotification) {
          await supabase.from('pdv_notifications').insert({
            user_id: sector.user_id,
            type: 'trash_warning',
            title: 'Setor será excluído em breve',
            message: `O setor "${sector.name}" será excluído permanentemente em ${daysLeft} dias.`,
            data: { item_id: sector.id, item_type: 'sector', days_left: daysLeft },
          });
          results.warnings_sent++;
        }
      }
    }

    // 3. Excluir mesas com mais de 30 dias na lixeira
    const { data: tablesToDelete, error: tablesDeleteFetchError } = await supabase
      .from('pdv_tables')
      .select('id, user_id, number')
      .eq('is_active', false)
      .lt('deleted_at', thirtyDaysAgo.toISOString());

    if (tablesDeleteFetchError) {
      results.errors.push(`Error fetching tables to delete: ${tablesDeleteFetchError.message}`);
    } else if (tablesToDelete && tablesToDelete.length > 0) {
      for (const table of tablesToDelete) {
        // Criar notificação de exclusão
        await supabase.from('pdv_notifications').insert({
          user_id: table.user_id,
          type: 'trash_deleted',
          title: 'Mesa excluída automaticamente',
          message: `A Mesa ${table.number} foi excluída permanentemente após 30 dias na lixeira.`,
          data: { item_type: 'table', item_number: table.number },
        });

        // Excluir a mesa
        const { error: deleteError } = await supabase
          .from('pdv_tables')
          .delete()
          .eq('id', table.id);

        if (deleteError) {
          results.errors.push(`Error deleting table ${table.id}: ${deleteError.message}`);
        } else {
          results.tables_deleted++;
        }
      }
    }

    // 4. Excluir setores com mais de 30 dias na lixeira
    const { data: sectorsToDelete, error: sectorsDeleteFetchError } = await supabase
      .from('pdv_sectors')
      .select('id, user_id, name')
      .eq('is_active', false)
      .lt('deleted_at', thirtyDaysAgo.toISOString());

    if (sectorsDeleteFetchError) {
      results.errors.push(`Error fetching sectors to delete: ${sectorsDeleteFetchError.message}`);
    } else if (sectorsToDelete && sectorsToDelete.length > 0) {
      for (const sector of sectorsToDelete) {
        // Criar notificação de exclusão
        await supabase.from('pdv_notifications').insert({
          user_id: sector.user_id,
          type: 'trash_deleted',
          title: 'Setor excluído automaticamente',
          message: `O setor "${sector.name}" foi excluído permanentemente após 30 dias na lixeira.`,
          data: { item_type: 'sector', item_name: sector.name },
        });

        // Excluir o setor
        const { error: deleteError } = await supabase
          .from('pdv_sectors')
          .delete()
          .eq('id', sector.id);

        if (deleteError) {
          results.errors.push(`Error deleting sector ${sector.id}: ${deleteError.message}`);
        } else {
          results.sectors_deleted++;
        }
      }
    }

    // Remover notificações de aviso para itens que foram excluídos
    await supabase
      .from('pdv_notifications')
      .delete()
      .eq('type', 'trash_warning')
      .in('data->item_id', [...(tablesToDelete?.map(t => t.id) || []), ...(sectorsToDelete?.map(s => s.id) || [])]);

    return new Response(JSON.stringify({
      success: true,
      results,
      timestamp: now.toISOString(),
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Cleanup trash error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
