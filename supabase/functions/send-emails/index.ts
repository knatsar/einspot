import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// Rate limiting and security utilities
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const EMAIL_RATE_LIMIT = 3; // Max 3 emails per 5 minutes per IP
const RATE_LIMIT_WINDOW = 5 * 60 * 1000; // 5 minutes

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
};

interface EmailRequest {
  to: string;
  subject: string;
  template: 'welcome' | 'quote_confirmation' | 'order_confirmation' | 'quote_ready';
  data: any;
}

const getClientIP = (req: Request): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  
  return forwarded?.split(',')[0] || realIP || cfIP || 'unknown';
};

const checkRateLimit = (ip: string): { allowed: boolean; remainingRequests: number } => {
  const now = Date.now();
  const key = ip;
  
  // Clean up expired entries
  for (const [k, v] of rateLimitMap.entries()) {
    if (now > v.resetTime) {
      rateLimitMap.delete(k);
    }
  }
  
  const current = rateLimitMap.get(key);
  
  if (!current) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remainingRequests: EMAIL_RATE_LIMIT - 1 };
  }
  
  if (now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remainingRequests: EMAIL_RATE_LIMIT - 1 };
  }
  
  if (current.count >= EMAIL_RATE_LIMIT) {
    return { allowed: false, remainingRequests: 0 };
  }
  
  current.count++;
  return { allowed: true, remainingRequests: EMAIL_RATE_LIMIT - current.count };
};

const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .slice(0, 1000);
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254 && !email.includes('<') && !email.includes('>');
};

const logSecurityEvent = async (supabaseClient: any, event: string, details: any, ip: string) => {
  try {
    await supabaseClient.from("security_events").insert({
      event_type: event,
      ip_address: ip,
      details,
      severity: event.includes('rate_limit') ? 'medium' : 'low',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

const getEmailTemplate = async (template: string, data: any, supabaseClient: any) => {
  // Sanitize all data inputs
  const sanitizedData = Object.keys(data).reduce((acc, key) => {
    acc[key] = typeof data[key] === 'string' ? sanitizeInput(data[key]) : data[key];
    return acc;
  }, {} as any);

  // Try to get template from database
  const { data: templateData } = await supabaseClient
    .from('email_templates')
    .select('*')
    .eq('template_key', template)
    .eq('is_active', true)
    .single();

  if (templateData) {
    let subject = templateData.subject;
    let htmlContent = templateData.html_content;
    
    // Replace template variables safely
    Object.keys(sanitizedData).forEach(key => {
      const placeholder = `{{${key}}}`;
      const value = sanitizedData[key] || '';
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
      htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), value);
    });

    return { subject, html: htmlContent };
  }

  // Fallback to hardcoded templates
  switch (template) {
    case 'welcome':
      return {
        subject: 'Welcome to Einspot Engineering Solutions',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/lovable-uploads/6aebcf7c-9e80-4607-a059-fcddff4ed9d5.png" alt="Einspot Logo" style="max-width: 150px;">
            </div>
            <h1 style="color: #0ea5e9; text-align: center;">Welcome to Einspot!</h1>
            <p>Dear ${sanitizedData.fullName || 'Valued Customer'},</p>
            <p>Thank you for joining Einspot Engineering Solutions! We're excited to have you as part of our community.</p>
            <p>With over 15 years of experience, we specialize in:</p>
            <ul>
              <li>HVAC Systems & Climate Control</li>
              <li>Water Heaters & Treatment Systems</li>
              <li>Solar Energy Solutions</li>
              <li>Industrial Equipment</li>
            </ul>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/products" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Explore Our Products</a>
            </div>
            <p>If you have any questions, don't hesitate to contact us:</p>
            <p>📞 +234-812-364-7982<br>
            📧 info@einspot.com<br>
            🌐 www.einspot.com</p>
            <p>Best regards,<br>The Einspot Team</p>
          </div>
        `
      };

    case 'quote_confirmation':
      return {
        subject: 'Quote Request Received - Einspot Engineering',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/lovable-uploads/6aebcf7c-9e80-4607-a059-fcddff4ed9d5.png" alt="Einspot Logo" style="max-width: 150px;">
            </div>
            <h1 style="color: #0ea5e9; text-align: center;">Quote Request Received</h1>
            <p>Dear ${sanitizedData.customerName},</p>
            <p>We have received your quote request for the following product:</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${sanitizedData.productName}</h3>
              <p style="margin: 5px 0;"><strong>Quantity:</strong> ${sanitizedData.quantity}</p>
              <p style="margin: 5px 0;"><strong>Request Date:</strong> ${new Date().toLocaleDateString()}</p>
              ${sanitizedData.message ? `<p style="margin: 5px 0;"><strong>Additional Notes:</strong> ${sanitizedData.message}</p>` : ''}
            </div>
            <p>Our team will review your request and provide you with a detailed quote within 24-48 hours.</p>
            <p>For urgent requests, please contact us directly at +234-812-364-7982.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/dashboard" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Quote Status</a>
            </div>
            <p>Thank you for choosing Einspot Engineering Solutions!</p>
            <p>Best regards,<br>The Einspot Team</p>
          </div>
        `
      };

    case 'quote_ready':
      return {
        subject: 'Your Quote is Ready - Einspot Engineering',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/lovable-uploads/6aebcf7c-9e80-4607-a059-fcddff4ed9d5.png" alt="Einspot Logo" style="max-width: 150px;">
            </div>
            <h1 style="color: #0ea5e9; text-align: center;">Your Quote is Ready!</h1>
            <p>Dear ${sanitizedData.customerName},</p>
            <p>Great news! Your quote is now ready for review.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${sanitizedData.productName}</h3>
              <p style="margin: 5px 0;"><strong>Quantity:</strong> ${sanitizedData.quantity}</p>
              <p style="margin: 5px 0; font-size: 18px; color: #0ea5e9;"><strong>Quoted Price:</strong> ₦${sanitizedData.quotedPrice?.toLocaleString()}</p>
              ${sanitizedData.adminNotes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${sanitizedData.adminNotes}</p>` : ''}
            </div>
            <p>This quote is valid for 30 days from the date of issue.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/dashboard" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin-right: 10px;">View Quote</a>
              <a href="https://wa.me/2348123647982?text=Hi, I'd like to proceed with my quote for ${sanitizedData.productName}" style="background-color: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Contact Us</a>
            </div>
            <p>Ready to proceed? Contact us to finalize your order!</p>
            <p>Best regards,<br>The Einspot Team</p>
          </div>
        `
      };

    case 'order_confirmation':
      return {
        subject: `Order Confirmation - ${sanitizedData.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/lovable-uploads/6aebcf7c-9e80-4607-a059-fcddff4ed9d5.png" alt="Einspot Logo" style="max-width: 150px;">
            </div>
            <h1 style="color: #0ea5e9; text-align: center;">Order Confirmation</h1>
            <p>Dear ${sanitizedData.customerName},</p>
            <p>Thank you for your order! We're processing it and will keep you updated.</p>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 15px 0; color: #333;">Order Details</h3>
              <p style="margin: 5px 0;"><strong>Order Number:</strong> ${sanitizedData.orderNumber}</p>
              <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date().toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${sanitizedData.status || 'Processing'}</p>
              <p style="margin: 5px 0; font-size: 18px; color: #0ea5e9;"><strong>Total Amount:</strong> ₦${sanitizedData.totalAmount?.toLocaleString()}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://717875d0-64a8-4917-b954-1f41935a9913.lovableproject.com/dashboard" style="background-color: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Track Order</a>
            </div>
            <p>We'll send you updates as your order progresses through our fulfillment process.</p>
            <p>If you have any questions, contact us at +234-812-364-7982.</p>
            <p>Best regards,<br>The Einspot Team</p>
          </div>
        `
      };

    default:
      return {
        subject: 'Notification from Einspot',
        html: `<p>Thank you for your interest in Einspot Engineering Solutions.</p>`
      };
  }
};

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

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const requestBody = await req.json();
    const { to, template, data }: EmailRequest = requestBody;

    // Validate inputs
    if (!validateEmail(to)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!template || !['welcome', 'quote_confirmation', 'order_confirmation', 'quote_ready'].includes(template)) {
      return new Response(
        JSON.stringify({ error: "Invalid template type" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Log security event
    await logSecurityEvent(supabaseClient, 'email_request', {
      template,
      to: to.replace(/(.{3}).*@/, '$1***@'), // Mask email for privacy
      ip
    }, ip);

    const resend = new Resend(resendApiKey);
    const emailTemplate = await getEmailTemplate(template, data, supabaseClient);

    const emailResponse = await resend.emails.send({
      from: "Einspot Engineering <noreply@einspot.com>",
      to: [to],
      subject: emailTemplate.subject,
      html: emailTemplate.html,
    });

    console.log("Email sent successfully:", emailResponse);

    // Log the email in analytics
    await supabaseClient.from("analytics_events").insert({
      event_name: "email_sent",
      properties: {
        template,
        to: to.replace(/(.{3}).*@/, '$1***@'),
        subject: emailTemplate.subject,
        success: true,
        ip
      }
    });

    return new Response(JSON.stringify({ 
      success: true, 
      data: emailResponse,
      remainingRequests: rateLimitResult.remainingRequests
    }), {
      status: 200,
      headers: { 
        "Content-Type": "application/json", 
        ...corsHeaders,
        "X-RateLimit-Remaining": rateLimitResult.remainingRequests.toString()
      },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await logSecurityEvent(supabaseClient, 'email_error', {
      error: error.message,
      ip
    }, ip);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
