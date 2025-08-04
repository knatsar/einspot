import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  email: string;
  amount: number;
  currency?: string;
  reference?: string;
  metadata?: any;
  callback_url?: string;
  payment_method: 'paystack' | 'flutterwave';
}

const initializePaystackPayment = async (paymentData: PaymentRequest) => {
  const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  if (!paystackKey) {
    throw new Error("Paystack secret key not configured");
  }

  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${paystackKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: paymentData.email,
      amount: paymentData.amount * 100, // Convert to kobo
      currency: paymentData.currency || "NGN",
      reference: paymentData.reference,
      metadata: paymentData.metadata,
      callback_url: paymentData.callback_url,
    }),
  });

  const data = await response.json();
  
  if (!data.status) {
    throw new Error(data.message || "Payment initialization failed");
  }

  return data.data;
};

const initializeFlutterwavePayment = async (paymentData: PaymentRequest) => {
  const flutterwaveKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
  if (!flutterwaveKey) {
    throw new Error("Flutterwave secret key not configured");
  }

  const response = await fetch("https://api.flutterwave.com/v3/payments", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${flutterwaveKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: paymentData.reference,
      amount: paymentData.amount,
      currency: paymentData.currency || "NGN",
      redirect_url: paymentData.callback_url,
      customer: {
        email: paymentData.email,
      },
      customizations: {
        title: "Einspot Engineering Solutions",
        description: "Payment for products/services",
        logo: "https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/lovable-uploads/6aebcf7c-9e80-4607-a059-fcddff4ed9d5.png",
      },
      meta: paymentData.metadata,
    }),
  });

  const data = await response.json();
  
  if (data.status !== "success") {
    throw new Error(data.message || "Payment initialization failed");
  }

  return data.data;
};

const verifyPaystackPayment = async (reference: string) => {
  const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");
  const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      "Authorization": `Bearer ${paystackKey}`,
    },
  });

  const data = await response.json();
  return data;
};

const verifyFlutterwavePayment = async (transactionId: string) => {
  const flutterwaveKey = Deno.env.get("FLUTTERWAVE_SECRET_KEY");
  const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
    headers: {
      "Authorization": `Bearer ${flutterwaveKey}`,
    },
  });

  const data = await response.json();
  return data;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "initialize") {
      const paymentData: PaymentRequest = await req.json();
      
      // Generate reference if not provided
      if (!paymentData.reference) {
        paymentData.reference = `EINSPOT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      let result;
      if (paymentData.payment_method === "paystack") {
        result = await initializePaystackPayment(paymentData);
      } else if (paymentData.payment_method === "flutterwave") {
        result = await initializeFlutterwavePayment(paymentData);
      } else {
        throw new Error("Invalid payment method");
      }

      // Log the payment initialization
      await supabaseClient.from("analytics_events").insert({
        event_name: "payment_initialized",
        properties: {
          payment_method: paymentData.payment_method,
          amount: paymentData.amount,
          currency: paymentData.currency || "NGN",
          reference: paymentData.reference,
        },
      });

      return new Response(JSON.stringify({ success: true, data: result }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else if (action === "verify") {
      const { reference, transaction_id, payment_method } = await req.json();

      let verificationResult;
      if (payment_method === "paystack") {
        verificationResult = await verifyPaystackPayment(reference);
      } else if (payment_method === "flutterwave") {
        verificationResult = await verifyFlutterwavePayment(transaction_id);
      } else {
        throw new Error("Invalid payment method");
      }

      // Log the payment verification
      await supabaseClient.from("analytics_events").insert({
        event_name: "payment_verified",
        properties: {
          payment_method,
          reference: reference || transaction_id,
          status: verificationResult.status,
          success: verificationResult.status === "success" || verificationResult.data?.status === "success",
        },
      });

      return new Response(JSON.stringify({ success: true, data: verificationResult }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });

    } else {
      throw new Error("Invalid action specified");
    }

  } catch (error: any) {
    console.error("Payment processing error:", error);
    
    // Log the error
    await supabaseClient.from("analytics_events").insert({
      event_name: "payment_error",
      properties: {
        error: error.message,
        url: req.url,
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