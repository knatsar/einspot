import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhatsAppMessage {
  from: string;
  body: string;
  name?: string;
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

    if (req.method === 'GET') {
      // WhatsApp webhook verification
      const url = new URL(req.url);
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');

      const verifyToken = Deno.env.get('WHATSAPP_VERIFY_TOKEN');

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('WhatsApp webhook verified successfully');
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        });
      } else {
        return new Response('Forbidden', { status: 403 });
      }
    }

    if (req.method === 'POST') {
      const body = await req.json();
      console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));

      // Extract message from WhatsApp webhook payload
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      const messages = value?.messages?.[0];

      if (messages) {
        const message: WhatsAppMessage = {
          from: messages.from,
          body: messages.text?.body || '',
          name: value.contacts?.[0]?.profile?.name
        };

        console.log('Processing message:', message);

        // Store message in database
        const { error: insertError } = await supabaseClient
          .from('whatsapp_messages')
          .insert({
            phone_number: message.from,
            message: message.body,
            contact_name: message.name,
            status: 'received'
          });

        if (insertError) {
          console.error('Error storing message:', insertError);
        }

        // Send automated response based on message content
        await sendAutomatedResponse(message);
      }

      return new Response('OK', { 
        status: 200,
        headers: corsHeaders
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendAutomatedResponse(message: WhatsAppMessage) {
  const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
  const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');

  if (!accessToken || !phoneNumberId) {
    console.error('WhatsApp credentials not configured');
    return;
  }

  let responseText = '';
  const msgLower = message.body.toLowerCase();

  // Automated responses based on keywords
  if (msgLower.includes('quote') || msgLower.includes('price')) {
    responseText = `Hello ${message.name || 'there'}! 👋\n\nThank you for your interest in EINSPOT products. Our team will prepare a custom quote for you.\n\nPlease share:\n• Product name/category\n• Quantity needed\n• Installation location\n\nA specialist will contact you within 24 hours. 📞`;
  } else if (msgLower.includes('service') || msgLower.includes('maintenance')) {
    responseText = `Hello ${message.name || 'there'}! 🔧\n\nFor service and maintenance:\n• Emergency repairs: Available 24/7\n• Scheduled maintenance: Book online\n• Warranty support: Fast response\n\nOur technicians will assist you promptly!`;
  } else if (msgLower.includes('product') || msgLower.includes('catalog')) {
    responseText = `Hello ${message.name || 'there'}! 📋\n\nEINSPOT Products:\n• HVAC Systems\n• Water Heaters\n• Solar Solutions\n• Heat Pumps\n• Air Quality Systems\n\nVisit our website for detailed specifications: ${Deno.env.get('SITE_URL') || 'https://einspot.com'}`;
  } else {
    responseText = `Hello ${message.name || 'there'}! 👋\n\nThank you for contacting EINSPOT! We're Nigeria's leading energy solutions provider.\n\n🔸 Products & Quotes\n🔸 Installation Services\n🔸 Maintenance Support\n\nHow can we help you today?`;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: message.from,
        text: { body: responseText }
      }),
    });

    if (response.ok) {
      console.log('Automated response sent successfully');
    } else {
      const errorData = await response.text();
      console.error('Failed to send automated response:', errorData);
    }
  } catch (error) {
    console.error('Error sending automated response:', error);
  }
}