
interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator?: (req: Request) => string;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(private config: RateLimitConfig) {}

  async isAllowed(req: Request): Promise<{ allowed: boolean; remainingRequests: number; resetTime: number }> {
    const key = this.config.keyGenerator ? this.config.keyGenerator(req) : this.getClientIP(req);
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup(now);
    
    const current = this.requests.get(key);
    
    if (!current) {
      // First request for this key
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return {
        allowed: true,
        remainingRequests: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
    
    if (now > current.resetTime) {
      // Window has expired, reset
      this.requests.set(key, {
        count: 1,
        resetTime: now + this.config.windowMs
      });
      return {
        allowed: true,
        remainingRequests: this.config.maxRequests - 1,
        resetTime: now + this.config.windowMs
      };
    }
    
    if (current.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: current.resetTime
      };
    }
    
    // Increment counter
    current.count++;
    return {
      allowed: true,
      remainingRequests: this.config.maxRequests - current.count,
      resetTime: current.resetTime
    };
  }
  
  private getClientIP(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfIP = req.headers.get('cf-connecting-ip');
    
    return forwarded?.split(',')[0] || realIP || cfIP || 'unknown';
  }
  
  private cleanup(now: number) {
    for (const [key, value] of this.requests.entries()) {
      if (now > value.resetTime) {
        this.requests.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5 // 5 attempts per 15 minutes
});

export const generalRateLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 60 // 60 requests per minute
});

export const emailRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  maxRequests: 3 // 3 emails per 5 minutes
});

export const paymentRateLimiter = new RateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  maxRequests: 10 // 10 payment requests per minute
});
