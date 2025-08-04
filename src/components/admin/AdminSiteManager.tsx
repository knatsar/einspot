import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Save, Globe } from 'lucide-react';

interface ContentSection {
  id: string;
  section_key: string;
  title: string;
  subtitle: string;
  content: string;
  image_url: string;
  button_text: string;
  button_link: string;
  is_active: boolean;
  sort_order: number;
}

const AdminSiteManager = () => {
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    section_key: '',
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    button_text: '',
    button_link: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('content_sections')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast({
        title: "Error",
        description: "Failed to load content sections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSection) {
        const { error } = await supabase
          .from('content_sections')
          .update(formData)
          .eq('id', editingSection.id);

        if (error) throw error;
        toast({ title: "Success", description: "Content section updated successfully" });
      } else {
        const { error } = await supabase
          .from('content_sections')
          .insert([formData]);

        if (error) throw error;
        toast({ title: "Success", description: "Content section created successfully" });
      }

      setIsDialogOpen(false);
      setEditingSection(null);
      resetForm();
      fetchSections();
    } catch (error) {
      console.error('Error saving section:', error);
      toast({
        title: "Error",
        description: "Failed to save content section",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (section: ContentSection) => {
    setEditingSection(section);
    setFormData({
      section_key: section.section_key,
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: section.content || '',
      image_url: section.image_url || '',
      button_text: section.button_text || '',
      button_link: section.button_link || '',
      is_active: section.is_active,
      sort_order: section.sort_order
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content section?')) return;

    try {
      const { error } = await supabase
        .from('content_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Content section deleted successfully" });
      fetchSections();
    } catch (error) {
      console.error('Error deleting section:', error);
      toast({
        title: "Error",
        description: "Failed to delete content section",
        variant: "destructive",
      });
    }
  };

  const toggleSection = async (id: string, is_active: boolean) => {
    try {
      const { error } = await supabase
        .from('content_sections')
        .update({ is_active: !is_active })
        .eq('id', id);

      if (error) throw error;
      toast({ 
        title: "Success", 
        description: `Section ${!is_active ? 'activated' : 'deactivated'} successfully` 
      });
      fetchSections();
    } catch (error) {
      console.error('Error updating section:', error);
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      section_key: '',
      title: '',
      subtitle: '',
      content: '',
      image_url: '',
      button_text: '',
      button_link: '',
      is_active: true,
      sort_order: 0
    });
  };

  const handleNewSection = () => {
    setEditingSection(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const predefinedSections = [
    { key: 'hero', name: 'Hero Section' },
    { key: 'about', name: 'About Section' },
    { key: 'services_intro', name: 'Services Introduction' },
    { key: 'contact_info', name: 'Contact Information' },
    { key: 'footer_company', name: 'Footer - Company Info' },
    { key: 'footer_services', name: 'Footer - Services' },
    { key: 'footer_contact', name: 'Footer - Contact' }
  ];

  if (loading) {
    return <div className="flex justify-center p-8">Loading content sections...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Website Content Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Content Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingSection ? 'Edit Content Section' : 'Add New Content Section'}
              </DialogTitle>
              <DialogDescription>
                {editingSection ? 'Update website content' : 'Create a new content section'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="section_key">Section Key *</Label>
                  <Input
                    id="section_key"
                    value={formData.section_key}
                    onChange={(e) => setFormData({ ...formData, section_key: e.target.value })}
                    placeholder="e.g., hero, about, services"
                    required
                    disabled={!!editingSection}
                  />
                </div>
                <div>
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="subtitle">Subtitle</Label>
                <Input
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="button_text">Button Text</Label>
                  <Input
                    id="button_text"
                    value={formData.button_text}
                    onChange={(e) => setFormData({ ...formData, button_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="button_link">Button Link</Label>
                  <Input
                    id="button_link"
                    value={formData.button_link}
                    onChange={(e) => setFormData({ ...formData, button_link: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="h-4 w-4 mr-2" />
                  {editingSection ? 'Update' : 'Create'} Section
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Content Sections
          </CardTitle>
          <CardDescription>Manage all website content sections</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => (
                <TableRow key={section.id}>
                  <TableCell className="font-medium">
                    {predefinedSections.find(s => s.key === section.section_key)?.name || section.section_key}
                  </TableCell>
                  <TableCell>{section.title}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSection(section.id, section.is_active)}
                    >
                      <Switch checked={section.is_active} />
                    </Button>
                  </TableCell>
                  <TableCell>{section.sort_order}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(section)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common website management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {predefinedSections.map((section) => {
              const existingSection = sections.find(s => s.section_key === section.key);
              return (
                <Button
                  key={section.key}
                  variant={existingSection ? "outline" : "secondary"}
                  onClick={() => {
                    if (existingSection) {
                      handleEdit(existingSection);
                    } else {
                      setFormData({ ...formData, section_key: section.key });
                      setIsDialogOpen(true);
                    }
                  }}
                  className="h-auto p-4 flex flex-col gap-2"
                >
                  <span className="font-semibold">{section.name}</span>
                  <span className="text-xs">
                    {existingSection ? 'Edit existing' : 'Create new'}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSiteManager;