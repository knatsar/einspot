import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-image.jpg';
import HeroThemeTwo from './HeroThemeTwo';

interface HeroConfig {
  style: string;
  background_type: string;
  title: string;
  subtitle: string;
  cta_buttons: Array<{
    text: string;
    link: string;
    style: string;
  }>;
  stats: Array<{
    value: string;
    label: string;
  }>;
}

interface HeroLayoutConfig {
  padding: string;
  alignment: string;
  maxWidth: string;
}

interface Theme {
  id: string;
  name: string;
  hero_config: HeroConfig;
  layout_config: HeroLayoutConfig;
  is_active: boolean;
}

const defaultTheme: Theme = {
  id: 'default',
  name: 'Default Theme',
  is_active: true,
  hero_config: {
    style: 'default',
    background_type: 'image',
    title: 'Welcome to Einspot Energy Solutions',
    subtitle: 'Your Partner in Sustainable Energy',
    cta_buttons: [
      {
        text: 'Explore Services',
        link: '/services',
        style: 'primary'
      },
      {
        text: 'Contact Us',
        link: '/contact',
        style: 'secondary'
      }
    ],
    stats: [
      {
        value: '1000+',
        label: 'Projects Completed'
      },
      {
        value: '98%',
        label: 'Customer Satisfaction'
      }
    ]
  },
  layout_config: {
    padding: '4rem',
    alignment: 'center',
    maxWidth: '1280px'
  }
};

const DynamicHeroSection = () => {
  const [activeTheme, setActiveTheme] = useState<Theme>(defaultTheme);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    
    const loadTheme = async () => {
      try {
        const { data: themeData, error: themeError } = await supabase
          .from('themes')
          .select('*')
          .eq('is_active', true)
          .single();
          
        if (themeError) throw themeError;
        
        if (isMounted && themeData) {
          // Parse JSON fields
          const parsedTheme: Theme = {
            ...themeData,
            hero_config: typeof themeData.hero_config === 'string' 
              ? JSON.parse(themeData.hero_config)
              : themeData.hero_config,
            layout_config: typeof themeData.layout_config === 'string'
              ? JSON.parse(themeData.layout_config)
              : themeData.layout_config
          };
          
          setActiveTheme(parsedTheme);
          // Removed theme loaded notification for production
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
        if (isMounted) {
          setError(error as Error);
          setLoading(false);
        }
      }
    };
    
    loadTheme();
    
    // Set a timeout as fallback to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isMounted) {
        // Theme fetch timeout, using default theme
        setLoading(false);
        setActiveTheme(null);
      }
    }, 2000); // 2 second timeout

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, []);

  // Removed duplicate fetchActiveTheme function as its logic is now in useEffect

  if (loading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <div className="text-lg text-muted-foreground">Loading theme...</div>
        </div>
      </section>
    );
  }

  // If no theme found or Theme Two is active, render Theme Two
  if (!activeTheme || activeTheme.name.includes('Theme Two')) {
    return <HeroThemeTwo config={activeTheme?.hero_config} />;
  }

  // Default to Theme One (current design) if no theme found
  const config = activeTheme?.hero_config || {
    style: "gradient_overlay",
    background_type: "image",
    title: "Powering Nigeria's Energy Future",
    subtitle: "Leading provider of renewable energy solutions, HVAC systems, and sustainable technologies for homes, businesses, and industries across Nigeria.",
    cta_buttons: [
      { text: "Explore Products", link: "/products", style: "primary" },
      { text: "Watch Demo", link: "#", style: "outline" }
    ],
    stats: [
      { value: "500+", label: "Projects Completed" },
      { value: "50MW+", label: "Energy Generated" },
      { value: "15+", label: "Years Experience" },
      { value: "24/7", label: "Support Available" }
    ]
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="Renewable Energy Solutions" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {config.title.includes('Energy Future') ? (
              <>
                Powering Nigeria's
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Energy Future
                </span>
              </>
            ) : (
              config.title
            )}
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto leading-relaxed">
            {config.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {config.cta_buttons.map((button, index) => (
              <Link key={index} to={button.link}>
                <Button 
                  size="lg" 
                  variant={button.style === 'outline' ? 'outline' : 'default'}
                  className={`text-lg px-8 py-4 ${
                    button.style === 'primary' 
                      ? 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transform hover:scale-105 transition-all duration-300'
                      : button.style === 'outline'
                      ? 'border-white/30 text-white hover:bg-white/10 backdrop-blur-sm'
                      : ''
                  }`}
                >
                  {button.text}
                  {button.style === 'primary' && <ArrowRight className="ml-2 h-5 w-5" />}
                  {button.style === 'outline' && <Play className="mr-2 h-5 w-5" />}
                </Button>
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-8 border-t border-white/20">
            {config.stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl md:text-4xl font-bold text-yellow-400">{stat.value}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DynamicHeroSection;