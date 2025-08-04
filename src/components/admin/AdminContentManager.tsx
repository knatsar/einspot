import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface SiteContent {
  id: string;
  section: string;
  content: any;
  updated_at: string;
}

const AdminContentManager = () => {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Default content structure
  const defaultContent = {
    hero: {
      title: "Powering Nigeria's Energy Future",
      subtitle: "Leading provider of renewable energy solutions, HVAC systems, and sustainable technologies for homes, businesses, and industries across Nigeria.",
      cta_primary: "Explore Products",
      cta_secondary: "Watch Demo",
      stats: [
        { value: "500+", label: "Projects Completed" },
        { value: "50MW+", label: "Energy Generated" },
        { value: "15+", label: "Years Experience" },
        { value: "24/7", label: "Support Available" }
      ]
    },
    about: {
      title: "Pioneering Nigeria's Energy Transformation",
      subtitle: "For over 15 years, we've been at the forefront of renewable energy adoption in Nigeria, helping businesses and communities transition to sustainable power solutions.",
      description: "Einspot Energy Solutions is Nigeria's premier provider of renewable energy systems, HVAC solutions, and sustainable technologies. We specialize in solar power installations, energy storage systems, and comprehensive energy management solutions.",
      mission: "Our mission is to make clean, reliable energy accessible to all Nigerians while contributing to a sustainable future for generations to come."
    },
    contact: {
      title: "Start Your Energy Journey Today",
      subtitle: "Ready to transform your energy future? Get in touch with our experts for a free consultation and custom solution design.",
      phone: "+234-8123647982",
      email: "info@einspot.com",
      address: "123 Energy Street, Victoria Island, Lagos, Nigeria",
      hours: "Monday - Friday: 8AM - 6PM"
    },
    header: {
      company_name: "EINSPOT",
      tagline: "Engineering Solutions",
      phone: "+234-8123647982",
      email: "info@einspot.com"
    },
    footer: {
      description: "Leading Nigeria's transition to sustainable energy with innovative renewable energy solutions and expert service.",
      address: "123 Energy Street, Victoria Island, Lagos",
      phone: "+234 123 456 7890",
      email: "info@einspot.com"
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      // For now, we'll use localStorage to store content
      // In a real implementation, you'd create a site_content table
      const storedContent = localStorage.getItem('site_content');
      if (storedContent) {
        setContent(JSON.parse(storedContent));
      } else {
        setContent(defaultContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (section: string, sectionContent: any) => {
    try {
      const updatedContent = {
        ...content,
        [section]: sectionContent
      };
      
      // Save to localStorage (in real app, save to database)
      localStorage.setItem('site_content', JSON.stringify(updatedContent));
      setContent(updatedContent);
      
      toast({
        title: "Success",
        description: `${section} content updated successfully`,
      });
    } catch (error) {
      console.error('Error saving content:', error);
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      });
    }
  };

  const updateContent = (section: string, field: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateArrayContent = (section: string, field: string, index: number, subField: string, value: any) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].map((item: any, i: number) => 
          i === index ? { ...item, [subField]: value } : item
        )
      }
    }));
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Content Management</h2>
      
      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="hero">Hero Section</TabsTrigger>
          <TabsTrigger value="about">About Section</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
              <CardDescription>Manage the main hero section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero-title">Main Title</Label>
                <Input
                  id="hero-title"
                  value={content.hero?.title || ''}
                  onChange={(e) => updateContent('hero', 'title', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="hero-subtitle">Subtitle</Label>
                <Textarea
                  id="hero-subtitle"
                  value={content.hero?.subtitle || ''}
                  onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cta-primary">Primary CTA Text</Label>
                  <Input
                    id="cta-primary"
                    value={content.hero?.cta_primary || ''}
                    onChange={(e) => updateContent('hero', 'cta_primary', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="cta-secondary">Secondary CTA Text</Label>
                  <Input
                    id="cta-secondary"
                    value={content.hero?.cta_secondary || ''}
                    onChange={(e) => updateContent('hero', 'cta_secondary', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Statistics</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {content.hero?.stats?.map((stat: any, index: number) => (
                    <div key={index} className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Value"
                        value={stat.value}
                        onChange={(e) => updateArrayContent('hero', 'stats', index, 'value', e.target.value)}
                      />
                      <Input
                        placeholder="Label"
                        value={stat.label}
                        onChange={(e) => updateArrayContent('hero', 'stats', index, 'label', e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={() => saveContent('hero', content.hero)}>
                <Save className="h-4 w-4 mr-2" />
                Save Hero Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Section</CardTitle>
              <CardDescription>Manage the about section content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="about-title">Section Title</Label>
                <Input
                  id="about-title"
                  value={content.about?.title || ''}
                  onChange={(e) => updateContent('about', 'title', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="about-subtitle">Subtitle</Label>
                <Textarea
                  id="about-subtitle"
                  value={content.about?.subtitle || ''}
                  onChange={(e) => updateContent('about', 'subtitle', e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="about-description">Description</Label>
                <Textarea
                  id="about-description"
                  value={content.about?.description || ''}
                  onChange={(e) => updateContent('about', 'description', e.target.value)}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="about-mission">Mission Statement</Label>
                <Textarea
                  id="about-mission"
                  value={content.about?.mission || ''}
                  onChange={(e) => updateContent('about', 'mission', e.target.value)}
                  rows={3}
                />
              </div>

              <Button onClick={() => saveContent('about', content.about)}>
                <Save className="h-4 w-4 mr-2" />
                Save About Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>Manage contact details and information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contact-title">Section Title</Label>
                <Input
                  id="contact-title"
                  value={content.contact?.title || ''}
                  onChange={(e) => updateContent('contact', 'title', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="contact-subtitle">Subtitle</Label>
                <Textarea
                  id="contact-subtitle"
                  value={content.contact?.subtitle || ''}
                  onChange={(e) => updateContent('contact', 'subtitle', e.target.value)}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-phone">Phone</Label>
                  <Input
                    id="contact-phone"
                    value={content.contact?.phone || ''}
                    onChange={(e) => updateContent('contact', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input
                    id="contact-email"
                    value={content.contact?.email || ''}
                    onChange={(e) => updateContent('contact', 'email', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contact-address">Address</Label>
                <Input
                  id="contact-address"
                  value={content.contact?.address || ''}
                  onChange={(e) => updateContent('contact', 'address', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="contact-hours">Business Hours</Label>
                <Input
                  id="contact-hours"
                  value={content.contact?.hours || ''}
                  onChange={(e) => updateContent('contact', 'hours', e.target.value)}
                />
              </div>

              <Button onClick={() => saveContent('contact', content.contact)}>
                <Save className="h-4 w-4 mr-2" />
                Save Contact Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header">
          <Card>
            <CardHeader>
              <CardTitle>Header Settings</CardTitle>
              <CardDescription>Manage header and navigation content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="header-company">Company Name</Label>
                  <Input
                    id="header-company"
                    value={content.header?.company_name || ''}
                    onChange={(e) => updateContent('header', 'company_name', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="header-tagline">Tagline</Label>
                  <Input
                    id="header-tagline"
                    value={content.header?.tagline || ''}
                    onChange={(e) => updateContent('header', 'tagline', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="header-phone">Header Phone</Label>
                  <Input
                    id="header-phone"
                    value={content.header?.phone || ''}
                    onChange={(e) => updateContent('header', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="header-email">Header Email</Label>
                  <Input
                    id="header-email"
                    value={content.header?.email || ''}
                    onChange={(e) => updateContent('header', 'email', e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={() => saveContent('header', content.header)}>
                <Save className="h-4 w-4 mr-2" />
                Save Header Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Settings</CardTitle>
              <CardDescription>Manage footer content and links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="footer-description">Company Description</Label>
                <Textarea
                  id="footer-description"
                  value={content.footer?.description || ''}
                  onChange={(e) => updateContent('footer', 'description', e.target.value)}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="footer-address">Address</Label>
                <Input
                  id="footer-address"
                  value={content.footer?.address || ''}
                  onChange={(e) => updateContent('footer', 'address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="footer-phone">Phone</Label>
                  <Input
                    id="footer-phone"
                    value={content.footer?.phone || ''}
                    onChange={(e) => updateContent('footer', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="footer-email">Email</Label>
                  <Input
                    id="footer-email"
                    value={content.footer?.email || ''}
                    onChange={(e) => updateContent('footer', 'email', e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={() => saveContent('footer', content.footer)}>
                <Save className="h-4 w-4 mr-2" />
                Save Footer Content
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContentManager;