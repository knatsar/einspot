import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Save, RefreshCw, Image, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SiteAssets {
  logo_url: string;
  favicon_url: string;
  hero_image_url: string;
  company_name: string;
  tagline: string;
}

const AdminAssetManager = () => {
  const { toast } = useToast();
  const [assets, setAssets] = useState<SiteAssets>({
    logo_url: '/lovable-uploads/a4aace6d-dfa3-4938-978f-0881cc2ec66b.png',
    favicon_url: '/lovable-uploads/6aebcf7c-9e80-4607-a059-fcddff4ed9d5.png',
    hero_image_url: '',
    company_name: 'EINSPOT',
    tagline: 'Engineering Solutions'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSiteAssets();
  }, []);

  const fetchSiteAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .eq('section_key', 'site_assets')
        .single();

      if (data && !error) {
        const assetData = JSON.parse(data.content || '{}');
        setAssets(prev => ({ ...prev, ...assetData }));
      }
    } catch (error) {
      console.error('Error fetching site assets:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('content_sections')
        .upsert({
          section_key: 'site_assets',
          title: 'Site Assets Configuration',
          content: JSON.stringify(assets),
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Site assets updated successfully. Changes will reflect after page refresh.",
      });
    } catch (error) {
      console.error('Error saving site assets:', error);
      toast({
        title: "Error",
        description: "Failed to save site assets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SiteAssets, value: string) => {
    setAssets(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Site Assets Manager</h2>
          <p className="text-muted-foreground">Manage logos, favicon, and branding assets</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="branding">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Company Information
                </CardTitle>
                <CardDescription>
                  Update company name and tagline
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={assets.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={assets.tagline}
                    onChange={(e) => handleInputChange('tagline', e.target.value)}
                    placeholder="Enter company tagline"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Current Branding</CardTitle>
                <CardDescription>
                  Preview of current company branding
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 p-4 border rounded-lg">
                  <img 
                    src={assets.logo_url} 
                    alt="Logo" 
                    className="h-12 w-auto"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23e5e7eb"/><text x="24" y="28" font-family="Arial" font-size="14" text-anchor="middle" fill="%236b7280">Logo</text></svg>';
                    }}
                  />
                  <div>
                    <h3 className="font-bold text-lg">{assets.company_name}</h3>
                    <p className="text-sm text-muted-foreground">{assets.tagline}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="images">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Logo
                </CardTitle>
                <CardDescription>
                  Main company logo (recommended: 200x60px)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <img 
                    src={assets.logo_url} 
                    alt="Current Logo" 
                    className="h-16 w-auto mx-auto mb-2"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23e5e7eb"/><text x="32" y="36" font-family="Arial" font-size="12" text-anchor="middle" fill="%236b7280">Logo</text></svg>';
                    }}
                  />
                  <p className="text-sm text-muted-foreground mb-2">Current logo</p>
                </div>
                <div>
                  <Label htmlFor="logo_url">Logo URL</Label>
                  <Input
                    id="logo_url"
                    value={assets.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="Enter logo URL or upload path"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Favicon
                </CardTitle>
                <CardDescription>
                  Browser tab icon (recommended: 32x32px)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center">
                  <img 
                    src={assets.favicon_url} 
                    alt="Current Favicon" 
                    className="h-8 w-8 mx-auto mb-2"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23e5e7eb"/><text x="16" y="20" font-family="Arial" font-size="10" text-anchor="middle" fill="%236b7280">ICO</text></svg>';
                    }}
                  />
                  <p className="text-sm text-muted-foreground mb-2">Current favicon</p>
                </div>
                <div>
                  <Label htmlFor="favicon_url">Favicon URL</Label>
                  <Input
                    id="favicon_url"
                    value={assets.favicon_url}
                    onChange={(e) => handleInputChange('favicon_url', e.target.value)}
                    placeholder="Enter favicon URL or upload path"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Hero Image
                </CardTitle>
                <CardDescription>
                  Homepage hero background image
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-4 text-center min-h-[100px]">
                  {assets.hero_image_url ? (
                    <img 
                      src={assets.hero_image_url} 
                      alt="Hero Image" 
                      className="h-16 w-full object-cover rounded mx-auto mb-2"
                    />
                  ) : (
                    <div className="h-16 bg-muted rounded flex items-center justify-center mb-2">
                      <span className="text-sm text-muted-foreground">No hero image</span>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-2">Current hero image</p>
                </div>
                <div>
                  <Label htmlFor="hero_image_url">Hero Image URL</Label>
                  <Input
                    id="hero_image_url"
                    value={assets.hero_image_url}
                    onChange={(e) => handleInputChange('hero_image_url', e.target.value)}
                    placeholder="Enter hero image URL or upload path"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Asset Preview</CardTitle>
              <CardDescription>
                Preview how your assets will appear on the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Header Preview */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Header Preview</h3>
                  <div className="flex items-center justify-between bg-background border rounded p-4">
                    <div className="flex items-center">
                      <img 
                        src={assets.logo_url} 
                        alt="Logo Preview" 
                        className="h-12 w-auto mr-3"
                        onError={(e) => {
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23e5e7eb"/><text x="24" y="28" font-family="Arial" font-size="14" text-anchor="middle" fill="%236b7280">Logo</text></svg>';
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">Navigation Menu</span>
                      <Button size="sm">Contact</Button>
                    </div>
                  </div>
                </div>

                {/* Favicon Preview */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Browser Tab Preview</h3>
                  <div className="flex items-center bg-muted rounded p-2 w-fit">
                    <img 
                      src={assets.favicon_url} 
                      alt="Favicon Preview" 
                      className="h-4 w-4 mr-2"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23e5e7eb"/></svg>';
                      }}
                    />
                    <span className="text-sm">{assets.company_name} - {assets.tagline}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Upload className="h-5 w-5 text-orange-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-orange-800">Upload Instructions</h4>
              <p className="text-sm text-orange-700 mt-1">
                To upload new images: Use the file upload feature in Lovable, then copy the generated path 
                (format: /lovable-uploads/[file-id]) into the URL fields above.
              </p>
              <p className="text-sm text-orange-700 mt-2">
                <strong>Recommended sizes:</strong> Logo: 200x60px, Favicon: 32x32px, Hero: 1920x1080px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAssetManager;