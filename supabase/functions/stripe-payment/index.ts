
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const PAYMENT_RATE_LIMIT = 10;
const RATE_LIMIT_WINDOW = 1 * 60 * 1000; // 1 minute

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

interface PaymentRequest {
  amount: number;
  currency: string;
  customer_email: string;
  description?: string;
  metadata?: Record<string, string>;
}

const getClientIP = (req: Request): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIP || cfIP || 'unknown';
};

const checkRateLimit = (ip: string): { allowed: boolean; remainingRequests: number } => {
  const now = Date.now();
  
  // Clean up expired entries
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetTime) {
      rateLimitMap.delete(k);
    }
  }
  
  const current = rateLimitMap.get(ip);
  
  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remainingRequests: PAYMENT_RATE_LIMIT - 1 };
  }
  
  if (now > current.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remainingRequests: PAYMENT_RATE_LIMIT - 1 };
  }
  
  if (current.count >= PAYMENT_RATE_LIMIT) {
    return { allowed: false, remainingRequests: 0 };
  }
  
  current.count++;
  return { allowed: true, remainingRequests: PAYMENT_RATE_LIMIT - current.count };
};

const validatePaymentRequest = (paymentData: PaymentRequest): boolean => {
  // Validate amount
  if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0 || paymentData.amount > 1000000) {
    return false;
  }
  
  // Validate currency
  if (!['usd', 'ngn', 'eur', 'gbp'].includes(paymentData.currency.toLowerCase())) {
    return false;
  }
  
  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(paymentData.customer_email) || paymentData.customer_email.length > 254) {
    return false;
  }
  
  // Validate description
  if (paymentData.description && paymentData.description.length > 500) {
    return false;
  }
  
  return true;
};

const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 500);
};

const logSecurityEvent = async (supabaseClient: any, event: string, details: any, ip: string) => {
  try {
    await supabaseClient.from("security_events").insert({
      event_type: event,
      ip_address: ip,
      details,
      severity: event.includes('suspicious') ? 'high' : 'medium',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const ip = getClientIP(req);
  
  // Check rate limiting
  const rateLimitResult = checkRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ 
        error: "Rate limit exceeded. Please try again later.",
        remainingRequests: rateLimitResult.remainingRequests 
      }),
      {
        status: 429,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders,
          "X-RateLimit-Remaining": rateLimitResult.remainingRequests.toString()
        },
      }
    );
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "create-payment-intent") {
      const requestBody = await req.json();
      const paymentData: PaymentRequest = {
        amount: requestBody.amount,
        currency: requestBody.currency,
        customer_email: sanitizeInput(requestBody.customer_email),
        description: requestBody.description ? sanitizeInput(requestBody.description) : undefined,
        metadata: requestBody.metadata || {}
      };

      // Validate payment request
      if (!validatePaymentRequest(paymentData)) {
        await logSecurityEvent(supabaseClient, 'payment_validation_failed', {
          paymentData: { ...paymentData, customer_email: paymentData.customer_email.replace(/(.{3}).*@/, '$1***@') }
        }, ip);
        
        return new Response(
          JSON.stringify({ error: "Invalid payment request data" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(paymentData.amount * 100),
        currency: paymentData.currency.toLowerCase(),
        customer_email: paymentData.customer_email,
        description: paymentData.description,
        metadata: paymentData.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Log payment intent creation
      await supabaseClient.from("analytics_events").insert({
        event_name: "stripe_payment_intent_created",
        properties: {
          amount: paymentData.amount,
          currency: paymentData.currency,
          customer_email: paymentData.customer_email.replace(/(.{3}).*@/, '$1***@'),
          payment_intent_id: paymentIntent.id,
          ip
        },
      });

      return new Response(JSON.stringify({
        success: true,
        client_secret: paymentIntent.client_secret,
        payment_intent_id: paymentIntent.id,
        remainingRequests: rateLimitResult.remainingRequests
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders,
          "X-RateLimit-Remaining": rateLimitResult.remainingRequests.toString()
        },
      });

    } else if (action === "confirm-payment") {
      const { payment_intent_id } = await req.json();

      if (!payment_intent_id || typeof payment_intent_id !== 'string') {
        return new Response(
          JSON.stringify({ error: "Invalid payment intent ID" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

      // Log payment confirmation
      await supabaseClient.from("analytics_events").insert({
        event_name: "stripe_payment_confirmed",
        properties: {
          payment_intent_id,
          status: paymentIntent.status,
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency,
          ip
        },
      });

      return new Response(JSON.stringify({
        success: true,
        payment_intent: paymentIntent,
        remainingRequests: rateLimitResult.remainingRequests
      }), {
        status: 200,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders,
          "X-RateLimit-Remaining": rateLimitResult.remainingRequests.toString()
        },
      });

    } else if (action === "webhook") {
      const body = await req.text();
      const signature = req.headers.get("stripe-signature");

      if (!signature) {
        return new Response("No signature", { status: 400 });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          body,
          signature,
          Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
        );
      } catch (err) {
        console.error("Webhook signature verification failed:", err);
        await logSecurityEvent(supabaseClient, 'webhook_signature_failed', {
          error: err.message
        }, ip);
        return new Response("Invalid signature", { status: 400 });
      }

      // Handle webhook events
      switch (event.type) {
        case "payment_intent.succeeded":
          await supabaseClient.from("analytics_events").insert({
            event_name: "stripe_payment_succeeded",
            properties: {
              payment_intent_id: event.data.object.id,
              amount: event.data.object.amount / 100,
              currency: event.data.object.currency,
              ip
            },
          });
          break;

        case "payment_intent.payment_failed":
          await supabaseClient.from("analytics_events").insert({
            event_name: "stripe_payment_failed",
            properties: {
              payment_intent_id: event.data.object.id,
              amount: event.data.object.amount / 100,
              currency: event.data.object.currency,
              last_payment_error: event.data.object.last_payment_error,
              ip
            },
          });
          break;
      }

      return new Response(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else {
      return new Response("Invalid action", { status: 400, headers: corsHeaders });
    }

  } catch (error: any) {
    console.error("Stripe payment error:", error);
    
    await logSecurityEvent(supabaseClient, 'stripe_payment_error', {
      error: error.message,
      action: new URL(req.url).searchParams.get("action")
    }, ip);

    await supabaseClient.from("analytics_events").insert({
      event_name: "stripe_payment_error",
      properties: {
        error: error.message,
        action: new URL(req.url).searchParams.get("action"),
        ip
      },
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
