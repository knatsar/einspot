import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
  gaTrackingId?: string;
  gscVerificationCode?: string;
}

export const AnalyticsProvider = ({ 
  children, 
  gaTrackingId = 'GA_MEASUREMENT_ID',
  gscVerificationCode = 'GSC_VERIFICATION_CODE'
}: AnalyticsProviderProps) => {
  
  useEffect(() => {
    // Google Analytics Setup
    if (gaTrackingId && gaTrackingId !== 'GA_MEASUREMENT_ID') {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`;
      document.head.appendChild(script);

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer?.push(args);
      }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', gaTrackingId, {
        page_title: document.title,
        page_location: window.location.href,
      });

      // Analytics initialized silently
    }

    // Google Search Console verification meta tag
    if (gscVerificationCode && gscVerificationCode !== 'GSC_VERIFICATION_CODE') {
      const existingMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!existingMeta) {
        const meta = document.createElement('meta');
        meta.name = 'google-site-verification';
        meta.content = gscVerificationCode;
        document.head.appendChild(meta);
        // Search console verification added
      }
    }

    // Track page views for SPA
    const trackPageView = () => {
      if (window.gtag) {
        window.gtag('config', gaTrackingId, {
          page_title: document.title,
          page_location: window.location.href,
        });
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', trackPageView);
    
    return () => {
      window.removeEventListener('popstate', trackPageView);
    };
  }, [gaTrackingId, gscVerificationCode]);

  return <>{children}</>;
};

// Analytics tracking functions
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Google Analytics event tracking
  if (window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: properties?.label || '',
      value: properties?.value || 0,
      ...properties
    });
  }

  // Custom analytics tracking (store in Supabase)
  trackCustomEvent(eventName, properties);
};

export const trackPageView = (pagePath: string, pageTitle?: string) => {
  if (window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
    });
  }

  trackCustomEvent('page_view', {
    page_path: pagePath,
    page_title: pageTitle || document.title
  });
};

const trackCustomEvent = async (eventName: string, properties?: Record<string, any>) => {
  try {
    const response = await fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_name: eventName,
        properties,
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }),
    });

    if (!response.ok) {
      console.warn('Failed to track custom event:', eventName);
    }
  } catch (error) {
    console.warn('Error tracking custom event:', error);
  }
};

// Enhanced event tracking for business metrics
export const trackBusinessEvent = {
  quoteRequest: (productName: string, category: string) => {
    trackEvent('quote_request', {
      product_name: productName,
      category,
      event_category: 'business',
      event_label: 'quote_request'
    });
  },

  productView: (productId: string, productName: string, category: string) => {
    trackEvent('view_item', {
      item_id: productId,
      item_name: productName,
      item_category: category,
      event_category: 'product'
    });
  },

  contactForm: (formType: string) => {
    trackEvent('form_submit', {
      form_type: formType,
      event_category: 'lead_generation'
    });
  },

  whatsappClick: (source: string) => {
    trackEvent('whatsapp_click', {
      source,
      event_category: 'communication'
    });
  },

  phoneCall: (source: string) => {
    trackEvent('phone_call', {
      source,
      event_category: 'communication'
    });
  }
};