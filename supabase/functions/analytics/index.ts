import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const {
        event_name,
        properties,
        page_url,
        user_agent,
        timestamp
      } = await req.json();

      // Get client IP
      const clientIP = req.headers.get('x-forwarded-for') || 
                      req.headers.get('x-real-ip') || 
                      'unknown';

      // Generate session ID (simplified)
      const sessionId = req.headers.get('x-session-id') || 
                       `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Store analytics event
      const { error } = await supabaseClient
        .from('analytics_events')
        .insert({
          event_name,
          properties: properties || {},
          page_url,
          user_agent,
          ip_address: clientIP,
          session_id: sessionId,
          created_at: timestamp || new Date().toISOString()
        });

      if (error) {
        console.error('Error storing analytics event:', error);
        return new Response(JSON.stringify({ error: 'Failed to store event' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      console.log('Analytics event stored:', event_name);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      // Get analytics summary (admin only)
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get analytics summary
      const { data: events, error } = await supabaseClient
        .from('analytics_events')
        .select('event_name, created_at, properties')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching analytics:', error);
        return new Response(JSON.stringify({ error: 'Failed to fetch analytics' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Process analytics data
      const summary = processAnalyticsData(events || []);

      return new Response(JSON.stringify({
        success: true,
        summary,
        total_events: events?.length || 0
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analytics endpoint:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function processAnalyticsData(events: any[]) {
  const summary = {
    page_views: 0,
    quote_requests: 0,
    product_views: 0,
    whatsapp_clicks: 0,
    contact_forms: 0,
    top_products: {} as Record<string, number>,
    daily_stats: {} as Record<string, number>
  };

  events.forEach(event => {
    const date = event.created_at.split('T')[0];
    summary.daily_stats[date] = (summary.daily_stats[date] || 0) + 1;

    switch (event.event_name) {
      case 'page_view':
        summary.page_views++;
        break;
      case 'quote_request':
        summary.quote_requests++;
        if (event.properties?.product_name) {
          const product = event.properties.product_name;
          summary.top_products[product] = (summary.top_products[product] || 0) + 1;
        }
        break;
      case 'view_item':
        summary.product_views++;
        if (event.properties?.item_name) {
          const product = event.properties.item_name;
          summary.top_products[product] = (summary.top_products[product] || 0) + 1;
        }
        break;
      case 'whatsapp_click':
        summary.whatsapp_clicks++;
        break;
      case 'form_submit':
        summary.contact_forms++;
        break;
    }
  });

  return summary;
}