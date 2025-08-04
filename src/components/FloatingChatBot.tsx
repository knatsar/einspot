import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { trackBusinessEvent } from '@/components/AnalyticsProvider';

interface ChatConfig {
  whatsapp_number: string;
  welcome_message: string;
  is_enabled: boolean;
  position: string;
  theme_color: string;
}

const FloatingChatBot = () => {
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    fetchChatConfig();
  }, []);

  const fetchChatConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_config')
        .select('*')
        .eq('is_enabled', true)
        .single();

      if (data && !error) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching chat config:', error);
    }
  };

  const handleWhatsAppClick = () => {
    if (!config) return;
    
    // Track analytics
    trackBusinessEvent.whatsappClick('floating_chat_bot');
    
    const message = encodeURIComponent(`${config.welcome_message} a quote for your services.`);
    const whatsappUrl = `https://wa.me/${config.whatsapp_number.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!config || !config.is_enabled) return null;

  const positionClasses = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <div className={`fixed ${positionClasses[config.position as keyof typeof positionClasses] || positionClasses['bottom-right']} z-50`}>
      {isExpanded && (
        <div className="mb-4 bg-white rounded-lg shadow-lg p-4 w-72 border animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-gray-800">Live Support</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Need help with our HVAC, plumbing, or engineering services? Chat with us on WhatsApp for instant support!
          </p>
          <Button
            onClick={handleWhatsAppClick}
            className="w-full"
            style={{ backgroundColor: config.theme_color }}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Start WhatsApp Chat
          </Button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Quick response • Professional support
          </p>
        </div>
      )}

      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
        style={{ backgroundColor: config.theme_color }}
      >
        {isExpanded ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageCircle className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
};

export default FloatingChatBot;