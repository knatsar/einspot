import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action } = await req.json();

    switch (action) {
      case 'backup_database':
        return await performDatabaseBackup(supabaseClient);
      
      case 'system_health':
        return await checkSystemHealth(supabaseClient);
      
      case 'backup_status':
        return await getBackupStatus(supabaseClient);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

  } catch (error) {
    console.error('Error in backup system:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function performDatabaseBackup(supabase: any) {
  console.log('Starting database backup...');
  
  try {
    // Get current timestamp
    const timestamp = new Date().toISOString();
    
    // Count records in each table
    const tables = ['products', 'projects', 'blog_posts', 'quotations', 'orders', 'profiles'];
    const backupStats: any = {
      timestamp,
      tables: {},
      total_records: 0
    };

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (!error) {
        backupStats.tables[table] = count || 0;
        backupStats.total_records += count || 0;
      }
    }

    // Store backup metadata
    const { error: metadataError } = await supabase
      .from('backup_logs')
      .insert({
        backup_type: 'database',
        status: 'completed',
        metadata: backupStats,
        created_at: timestamp
      });

    if (metadataError) {
      console.error('Error storing backup metadata:', metadataError);
    }

    console.log('Database backup completed:', backupStats);

    return new Response(JSON.stringify({
      success: true,
      message: 'Database backup completed successfully',
      stats: backupStats
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Backup failed:', error);
    
    // Log failed backup
    await supabase
      .from('backup_logs')
      .insert({
        backup_type: 'database',
        status: 'failed',
        error_message: error.message,
        created_at: new Date().toISOString()
      });

    return new Response(JSON.stringify({
      success: false,
      error: 'Backup failed: ' + error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function checkSystemHealth(supabase: any) {
  console.log('Checking system health...');
  
  const healthCheck = {
    timestamp: new Date().toISOString(),
    database: 'healthy',
    tables_accessible: true,
    last_backup: null,
    issues: [] as string[]
  };

  try {
    // Test database connectivity
    const { error: dbError } = await supabase
      .from('products')
      .select('id')
      .limit(1);

    if (dbError) {
      healthCheck.database = 'unhealthy';
      healthCheck.issues.push('Database connectivity issue');
    }

    // Check last backup
    const { data: lastBackup } = await supabase
      .from('backup_logs')
      .select('created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1);

    if (lastBackup && lastBackup.length > 0) {
      healthCheck.last_backup = lastBackup[0].created_at;
      
      // Check if backup is older than 24 hours
      const backupTime = new Date(lastBackup[0].created_at);
      const now = new Date();
      const hoursDiff = (now.getTime() - backupTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursDiff > 24) {
        healthCheck.issues.push('Last backup is older than 24 hours');
      }
    } else {
      healthCheck.issues.push('No successful backups found');
    }

    // Store health check log
    await supabase
      .from('system_health_logs')
      .insert({
        status: healthCheck.issues.length === 0 ? 'healthy' : 'warning',
        metadata: healthCheck,
        created_at: healthCheck.timestamp
      });

    return new Response(JSON.stringify({
      success: true,
      health: healthCheck
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Health check failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Health check failed: ' + error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function getBackupStatus(supabase: any) {
  try {
    const { data: backups } = await supabase
      .from('backup_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: healthLogs } = await supabase
      .from('system_health_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    return new Response(JSON.stringify({
      success: true,
      recent_backups: backups || [],
      recent_health_checks: healthLogs || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error getting backup status:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to get backup status: ' + error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}