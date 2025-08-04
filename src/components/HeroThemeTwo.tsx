import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface HeroConfig {
  style?: string;
  background_type?: string;
  title?: string;
  subtitle?: string;
  cta_buttons?: Array<{
    text: string;
    link: string;
    style: string;
  }>;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

interface HeroThemeTwoProps {
  config?: HeroConfig;
}

const HeroThemeTwo = ({ config }: HeroThemeTwoProps) => {
  const defaultConfig = {
    title: "Homes That Match Your Vision",
    subtitle: "Experience premium HVAC and engineering solutions designed for modern Nigerian homes and businesses.",
    cta_buttons: [
      { text: "Explore", link: "/products", style: "dark" },
      { text: "Get Quote", link: "#quote", style: "light" }
    ],
    stats: [
      { value: "100+", label: "Premium Installations" },
      { value: "43,000+", label: "Satisfied Customers" },
      { value: "30+", label: "Cities Covered" }
    ]
  };

  const heroConfig = config || defaultConfig;

  const handleQuoteClick = () => {
    const message = encodeURIComponent("Hi EINSPOT, I'd like to request a quote for your services.");
    const whatsappUrl = `https://wa.me/2348123647982?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <section className="min-h-screen bg-gray-50">
      {/* Split Layout Hero */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {heroConfig.title}
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                {heroConfig.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {heroConfig.cta_buttons?.map((button, index) => (
                button.link === '#quote' ? (
                  <Button
                    key={index}
                    onClick={handleQuoteClick}
                    size="lg"
                    variant={button.style === 'light' ? 'outline' : 'default'}
                    className={`px-8 py-4 ${
                      button.style === 'dark' 
                        ? 'bg-gray-900 text-white hover:bg-gray-800' 
                        : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                    }`}
                  >
                    {button.text}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                ) : (
                  <Link key={index} to={button.link}>
                    <Button
                      size="lg"
                      variant={button.style === 'light' ? 'outline' : 'default'}
                      className={`px-8 py-4 ${
                        button.style === 'dark' 
                          ? 'bg-gray-900 text-white hover:bg-gray-800' 
                          : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'
                      }`}
                    >
                      {button.text}
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )
              ))}
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-8 pt-8 border-t border-gray-200">
              <div className="text-sm text-gray-500">Trusted by</div>
              <div className="flex flex-wrap gap-6 text-sm text-gray-400">
                <span>Government</span>
                <span>Hotels</span>
                <span>Hospitals</span>
                <span>Commercial</span>
              </div>
            </div>
          </div>

          {/* Right Content - 3D Building Visual */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-amber-100 to-orange-200 rounded-3xl overflow-hidden h-[600px] flex items-end justify-center p-8">
              {/* Modern Building Silhouette */}
              <div className="relative w-full max-w-md">
                {/* Building Structure */}
                <div className="grid grid-cols-3 gap-2 items-end h-80">
                  {/* Left Building */}
                  <div className="bg-gradient-to-t from-gray-700 to-gray-600 rounded-t-lg h-48 relative">
                    <div className="absolute inset-x-2 top-2 space-y-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="grid grid-cols-2 gap-1">
                          <div className="h-3 bg-yellow-300 rounded-sm opacity-80"></div>
                          <div className="h-3 bg-yellow-300 rounded-sm opacity-60"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Center Building (Tallest) */}
                  <div className="bg-gradient-to-t from-amber-600 to-amber-500 rounded-t-lg h-72 relative shadow-lg">
                    <div className="absolute inset-x-2 top-2 space-y-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="grid grid-cols-2 gap-1">
                          <div className="h-3 bg-white rounded-sm opacity-90"></div>
                          <div className="h-3 bg-white rounded-sm opacity-70"></div>
                        </div>
                      ))}
                    </div>
                    {/* Modern top accent */}
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-orange-400 rounded-full"></div>
                  </div>
                  
                  {/* Right Building */}
                  <div className="bg-gradient-to-t from-gray-600 to-gray-500 rounded-t-lg h-56 relative">
                    <div className="absolute inset-x-2 top-2 space-y-2">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className="grid grid-cols-2 gap-1">
                          <div className="h-3 bg-blue-200 rounded-sm opacity-80"></div>
                          <div className="h-3 bg-blue-200 rounded-sm opacity-60"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Ground/Base */}
                <div className="h-4 bg-gray-800 rounded-b-lg"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-8 right-8 w-16 h-16 bg-white/20 rounded-full backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-400 rounded-full"></div>
              </div>
              
              <div className="absolute top-24 left-8 w-12 h-12 bg-white/20 rounded-lg backdrop-blur-sm border border-white/30"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Our Experience</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Years of expertise in delivering exceptional HVAC and engineering solutions across Nigeria.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {heroConfig.stats?.map((stat, index) => (
              <div key={index} className="space-y-2">
                <div className="text-5xl font-bold text-orange-400">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroThemeTwo;