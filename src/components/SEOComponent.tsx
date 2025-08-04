import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  structuredData?: any;
}

export const SEOComponent = ({
  title = "Einspot - Engineering & Technical Solutions Nigeria",
  description = "Nigeria's leading provider of HVAC systems, water heaters, and technical solutions. Expert engineering services with 15+ years experience.",
  keywords = "HVAC, water heaters, engineering, technical solutions, Nigeria, climate control, energy efficiency",
  image = "/einspot-og-image.jpg",
  url,
  type = "website",
  structuredData
}: SEOProps) => {
  const location = useLocation();
  const currentUrl = url || `${window.location.origin}${location.pathname}`;

  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, name);
        document.head.appendChild(metaTag);
      }
      
      metaTag.setAttribute('content', content);
    };

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);

    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', image, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:type', type, true);

    // Twitter tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);

    // Structured data
    if (structuredData) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(structuredData);
    }

    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentUrl);

  }, [title, description, keywords, image, currentUrl, type, structuredData]);

  return null;
};

// Predefined structured data schemas
export const generateProductSchema = (product: any) => ({
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": product.name,
  "image": product.image_url,
  "description": product.description,
  "brand": {
    "@type": "Brand",
    "name": product.brand || "Rheem"
  },
  "offers": {
    "@type": "Offer",
    "price": product.price,
    "priceCurrency": "NGN",
    "availability": "https://schema.org/InStock"
  }
});

export const generateOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Einspot Engineering Solutions",
  "url": window.location.origin,
  "logo": `${window.location.origin}/lovable-uploads/6aebcf7c-9e80-4607-a059-fcddff4ed9d5.png`,
  "description": "Nigeria's leading provider of HVAC systems, water heaters, and technical solutions",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Lagos, Nigeria",
    "addressCountry": "NG"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+234-812-364-7982",
    "contactType": "customer service"
  }
});