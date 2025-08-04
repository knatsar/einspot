import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, MessageCircle, Smartphone } from 'lucide-react';

interface ChatConfig {
  id: string;
  whatsapp_number: string;
  welcome_message: string;
  is_enabled: boolean;
  position: string;
  theme_color: string;
}

const AdminChatManager = () => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchChatConfig();
  }, []);

  const fetchChatConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_config')
        .select('*')
        .limit(1)
        .single();

      if (data && !error) {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching chat config:', error);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('chat_config')
        .upsert(config);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Chat settings updated successfully",
      });
    } catch (error) {
      console.error('Error saving chat config:', error);
      toast({
        title: "Error",
        description: "Failed to save chat settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ChatConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const testWhatsApp = () => {
    if (!config) return;
    const message = encodeURIComponent(`${config.welcome_message} testing the chat bot.`);
    const whatsappUrl = `https://wa.me/${config.whatsapp_number.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!config) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading chat configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Chat Bot Manager</h2>
          <p className="text-muted-foreground">Configure the floating WhatsApp chat bot</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={testWhatsApp} variant="outline">
            <Smartphone className="h-4 w-4 mr-2" />
            Test WhatsApp
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat Configuration
            </CardTitle>
            <CardDescription>
              Configure the WhatsApp chat bot settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="enabled">Enable Chat Bot</Label>
                <p className="text-sm text-muted-foreground">Show/hide the floating chat button</p>
              </div>
              <Switch
                id="enabled"
                checked={config.is_enabled}
                onCheckedChange={(checked) => handleInputChange('is_enabled', checked)}
              />
            </div>

            <div>
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input
                id="whatsapp_number"
                value={config.whatsapp_number}
                onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                placeholder="+234XXXXXXXXXX"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Include country code (e.g., +234 for Nigeria)
              </p>
            </div>

            <div>
              <Label htmlFor="welcome_message">Welcome Message</Label>
              <Textarea
                id="welcome_message"
                value={config.welcome_message}
                onChange={(e) => handleInputChange('welcome_message', e.target.value)}
                placeholder="Hi EINSPOT, I need assistance with"
                rows={3}
              />
              <p className="text-sm text-muted-foreground mt-1">
                This message will be pre-filled when users click the chat button
              </p>
            </div>

            <div>
              <Label htmlFor="position">Position</Label>
              <Select 
                value={config.position} 
                onValueChange={(value) => handleInputChange('position', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme_color">Theme Color</Label>
              <div className="flex gap-2">
                <Input
                  id="theme_color"
                  type="color"
                  value={config.theme_color}
                  onChange={(e) => handleInputChange('theme_color', e.target.value)}
                  className="w-20"
                />
                <Input
                  value={config.theme_color}
                  onChange={(e) => handleInputChange('theme_color', e.target.value)}
                  placeholder="#25D366"
                  className="flex-1"
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Default WhatsApp green: #25D366
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>
              Preview how the chat bot will appear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50 min-h-[300px] relative">
              <p className="text-sm text-muted-foreground mb-4">Chat bot preview:</p>
              
              {config.is_enabled && (
                <div className={`absolute ${
                  config.position === 'bottom-right' ? 'bottom-4 right-4' :
                  config.position === 'bottom-left' ? 'bottom-4 left-4' :
                  config.position === 'top-right' ? 'top-4 right-4' :
                  'top-4 left-4'
                }`}>
                  <div className="mb-2 bg-white rounded-lg shadow-lg p-3 w-60 text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Live Support</span>
                      <span className="text-xs text-gray-500">×</span>
                    </div>
                    <p className="text-gray-600 mb-3 text-xs">
                      Need help with our HVAC, plumbing, or engineering services? Chat with us on WhatsApp for instant support!
                    </p>
                    <div 
                      className="text-white text-xs py-2 px-3 rounded text-center cursor-pointer"
                      style={{ backgroundColor: config.theme_color }}
                    >
                      💬 Start WhatsApp Chat
                    </div>
                    <p className="text-xs text-gray-400 mt-1 text-center">
                      Quick response • Professional support
                    </p>
                  </div>
                  
                  <div 
                    className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer"
                    style={{ backgroundColor: config.theme_color }}
                  >
                    💬
                  </div>
                </div>
              )}
              
              {!config.is_enabled && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Chat bot is disabled
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-800">Chat Bot Features</h4>
              <ul className="text-sm text-blue-700 mt-1 list-disc list-inside space-y-1">
                <li>Floating button appears on all pages</li>
                <li>Expands to show welcome message and CTA</li>
                <li>Direct WhatsApp integration for instant support</li>
                <li>Customizable position, color, and messaging</li>
                <li>Mobile-responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChatManager;