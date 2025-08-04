
import { createClient } from '@supabase/supabase-js';

interface SecurityEvent {
  event_type: 'auth_attempt' | 'auth_failure' | 'rate_limit_exceeded' | 'suspicious_activity' | 'admin_action';
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class SecurityMonitor {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async logSecurityEvent(event: SecurityEvent) {
    try {
      await this.supabase
        .from('security_events')
        .insert({
          event_type: event.event_type,
          user_id: event.user_id,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          details: event.details,
          severity: event.severity,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  async logAuthAttempt(req: Request, success: boolean, userId?: string, email?: string) {
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';

    await this.logSecurityEvent({
      event_type: success ? 'auth_attempt' : 'auth_failure',
      user_id: userId,
      ip_address: ip,
      user_agent: userAgent,
      details: {
        success,
        email: email ? this.hashEmail(email) : undefined,
        timestamp: new Date().toISOString()
      },
      severity: success ? 'low' : 'medium'
    });
  }

  async logRateLimitExceeded(req: Request, endpoint: string) {
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';

    await this.logSecurityEvent({
      event_type: 'rate_limit_exceeded',
      ip_address: ip,
      user_agent: userAgent,
      details: {
        endpoint,
        timestamp: new Date().toISOString()
      },
      severity: 'medium'
    });
  }

  async logSuspiciousActivity(req: Request, activity: string, details: Record<string, any>) {
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';

    await this.logSecurityEvent({
      event_type: 'suspicious_activity',
      ip_address: ip,
      user_agent: userAgent,
      details: {
        activity,
        ...details,
        timestamp: new Date().toISOString()
      },
      severity: 'high'
    });
  }

  async logAdminAction(userId: string, action: string, targetId?: string, details?: Record<string, any>) {
    await this.logSecurityEvent({
      event_type: 'admin_action',
      user_id: userId,
      details: {
        action,
        target_id: targetId,
        ...details,
        timestamp: new Date().toISOString()
      },
      severity: 'medium'
    });
  }

  private getClientIP(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfIP = req.headers.get('cf-connecting-ip');
    
    return forwarded?.split(',')[0] || realIP || cfIP || 'unknown';
  }

  private hashEmail(email: string): string {
    // Simple hash for privacy - in production, use proper hashing
    return btoa(email).slice(0, 10);
  }
}
