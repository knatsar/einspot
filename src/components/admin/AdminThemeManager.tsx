import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Save, Eye, Palette, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Theme {
  id: string;
  name: string;
  description: string;
  hero_config: any;
  layout_config: any;
  is_active: boolean;
}

const AdminThemeManager = () => {
  const { toast } = useToast();
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setThemes(data || []);
      
      // Set active theme as selected
      const activeTheme = data?.find(theme => theme.is_active);
      if (activeTheme) {
        setSelectedTheme(activeTheme);
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch themes",
        variant: "destructive",
      });
    }
  };

  const handleActivateTheme = async (themeId: string) => {
    setLoading(true);
    try {
      // Deactivate all themes first
      await supabase
        .from('themes')
        .update({ is_active: false })
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all themes

      // Activate selected theme
      const { error } = await supabase
        .from('themes')
        .update({ is_active: true })
        .eq('id', themeId);

      if (error) throw error;

      await fetchThemes();
      toast({
        title: "Success",
        description: "Theme activated successfully. Refresh the homepage to see changes.",
      });
    } catch (error) {
      console.error('Error activating theme:', error);
      toast({
        title: "Error",
        description: "Failed to activate theme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTheme = async (themeId: string, updates: Partial<Theme>) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('themes')
        .update(updates)
        .eq('id', themeId);

      if (error) throw error;

      await fetchThemes();
      toast({
        title: "Success",
        description: "Theme updated successfully",
      });
    } catch (error) {
      console.error('Error updating theme:', error);
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleHeroConfigChange = (field: string, value: any) => {
    if (!selectedTheme) return;
    
    const updatedConfig = {
      ...selectedTheme.hero_config,
      [field]: value
    };
    
    setSelectedTheme({
      ...selectedTheme,
      hero_config: updatedConfig
    });
  };

  const handleStatsChange = (index: number, field: string, value: string) => {
    if (!selectedTheme) return;
    
    const updatedStats = [...(selectedTheme.hero_config.stats || [])];
    updatedStats[index] = { ...updatedStats[index], [field]: value };
    
    handleHeroConfigChange('stats', updatedStats);
  };

  const handleButtonsChange = (index: number, field: string, value: string) => {
    if (!selectedTheme) return;
    
    const updatedButtons = [...(selectedTheme.hero_config.cta_buttons || [])];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    
    handleHeroConfigChange('cta_buttons', updatedButtons);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Theme Manager</h2>
          <p className="text-muted-foreground">Manage homepage themes and layouts</p>
        </div>
        <Button 
          onClick={() => selectedTheme && handleUpdateTheme(selectedTheme.id, selectedTheme)} 
          disabled={loading || !selectedTheme}
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Theme List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Available Themes
            </CardTitle>
            <CardDescription>
              Select and activate different homepage themes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {themes.map((theme) => (
              <div 
                key={theme.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  selectedTheme?.id === theme.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedTheme(theme)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">{theme.name}</h4>
                  {theme.is_active && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {theme.description}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open('/', '_blank');
                    }}
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  {!theme.is_active && (
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateTheme(theme.id);
                      }}
                      disabled={loading}
                    >
                      Activate
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Theme Editor */}
        <div className="lg:col-span-2">
          {selectedTheme ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Edit: {selectedTheme.name}
                </CardTitle>
                <CardDescription>
                  Customize the theme settings and content
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="hero" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="hero">Hero Section</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                    <TabsTrigger value="buttons">Call-to-Action</TabsTrigger>
                  </TabsList>

                  <TabsContent value="hero" className="space-y-4">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="title">Main Title</Label>
                        <Input
                          id="title"
                          value={selectedTheme.hero_config?.title || ''}
                          onChange={(e) => handleHeroConfigChange('title', e.target.value)}
                          placeholder="Enter main title"
                        />
                      </div>
                      <div>
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Textarea
                          id="subtitle"
                          value={selectedTheme.hero_config?.subtitle || ''}
                          onChange={(e) => handleHeroConfigChange('subtitle', e.target.value)}
                          placeholder="Enter subtitle description"
                          rows={3}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="stats" className="space-y-4">
                    {selectedTheme.hero_config?.stats?.map((stat: any, index: number) => (
                      <div key={index} className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label htmlFor={`stat-value-${index}`}>Value</Label>
                          <Input
                            id={`stat-value-${index}`}
                            value={stat.value || ''}
                            onChange={(e) => handleStatsChange(index, 'value', e.target.value)}
                            placeholder="e.g., 500+"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`stat-label-${index}`}>Label</Label>
                          <Input
                            id={`stat-label-${index}`}
                            value={stat.label || ''}
                            onChange={(e) => handleStatsChange(index, 'label', e.target.value)}
                            placeholder="e.g., Projects Completed"
                          />
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="buttons" className="space-y-4">
                    {selectedTheme.hero_config?.cta_buttons?.map((button: any, index: number) => (
                      <div key={index} className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                        <div>
                          <Label htmlFor={`button-text-${index}`}>Button Text</Label>
                          <Input
                            id={`button-text-${index}`}
                            value={button.text || ''}
                            onChange={(e) => handleButtonsChange(index, 'text', e.target.value)}
                            placeholder="Button text"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`button-link-${index}`}>Link</Label>
                          <Input
                            id={`button-link-${index}`}
                            value={button.link || ''}
                            onChange={(e) => handleButtonsChange(index, 'link', e.target.value)}
                            placeholder="/products"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`button-style-${index}`}>Style</Label>
                          <Input
                            id={`button-style-${index}`}
                            value={button.style || ''}
                            onChange={(e) => handleButtonsChange(index, 'style', e.target.value)}
                            placeholder="primary, outline, dark, light"
                          />
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Select a theme to start editing</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminThemeManager;