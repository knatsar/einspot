import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ExternalLink, Copy, AlertTriangle } from 'lucide-react';

interface CustomUrl {
  id: string;
  original_path: string;
  custom_path: string;
  entity_type: string;
  entity_id: string;
  is_active: boolean;
  metadata: any;
  created_at: string;
  updated_at: string;
}

const AdminURLManager = () => {
  const [urls, setUrls] = useState<CustomUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUrl, setEditingUrl] = useState<CustomUrl | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [conflicts, setConflicts] = useState<string[]>([]);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    original_path: '',
    custom_path: '',
    entity_type: 'product',
    entity_id: '',
    is_active: true
  });

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_urls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUrls(data || []);
    } catch (error) {
      console.error('Error fetching URLs:', error);
      toast({
        title: "Error",
        description: "Failed to load custom URLs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateCustomPath = (path: string) => {
    const sanitized = path
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return sanitized;
  };

  const checkConflicts = async (customPath: string, excludeId?: string) => {
    const { data } = await supabase
      .from('custom_urls')
      .select('id')
      .eq('custom_path', customPath)
      .neq('id', excludeId || '');

    return data && data.length > 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const sanitizedPath = validateCustomPath(formData.custom_path);
      
      // Check for conflicts
      const hasConflict = await checkConflicts(sanitizedPath, editingUrl?.id);
      if (hasConflict) {
        toast({
          title: "URL Conflict",
          description: "This custom path already exists. Please choose a different one.",
          variant: "destructive",
        });
        return;
      }

      const urlData = {
        ...formData,
        custom_path: sanitizedPath
      };

      if (editingUrl) {
        const { error } = await supabase
          .from('custom_urls')
          .update(urlData)
          .eq('id', editingUrl.id);

        if (error) throw error;
        toast({ title: "Success", description: "Custom URL updated successfully" });
      } else {
        const { error } = await supabase
          .from('custom_urls')
          .insert([urlData]);

        if (error) throw error;
        toast({ title: "Success", description: "Custom URL created successfully" });
      }

      setIsDialogOpen(false);
      setEditingUrl(null);
      resetForm();
      fetchUrls();
    } catch (error) {
      console.error('Error saving URL:', error);
      toast({
        title: "Error",
        description: "Failed to save custom URL",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (url: CustomUrl) => {
    setEditingUrl(url);
    setFormData({
      original_path: url.original_path,
      custom_path: url.custom_path,
      entity_type: url.entity_type,
      entity_id: url.entity_id,
      is_active: url.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this custom URL?')) return;

    try {
      const { error } = await supabase
        .from('custom_urls')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Custom URL deleted successfully" });
      fetchUrls();
    } catch (error) {
      console.error('Error deleting URL:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom URL",
        variant: "destructive",
      });
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('custom_urls')
        .update({ is_active: !isActive })
        .eq('id', id);

      if (error) throw error;
      toast({ 
        title: "Success", 
        description: `URL ${!isActive ? 'activated' : 'deactivated'} successfully` 
      });
      fetchUrls();
    } catch (error) {
      console.error('Error updating URL status:', error);
      toast({
        title: "Error",
        description: "Failed to update URL status",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "URL copied to clipboard" });
  };

  const resetForm = () => {
    setFormData({
      original_path: '',
      custom_path: '',
      entity_type: 'product',
      entity_id: '',
      is_active: true
    });
  };

  const handleNewUrl = () => {
    setEditingUrl(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading custom URLs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">URL Management</h2>
          <p className="text-muted-foreground">Manage custom URLs and redirects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewUrl}>
              <Plus className="h-4 w-4 mr-2" />
              Add Custom URL
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUrl ? 'Edit Custom URL' : 'Add New Custom URL'}
              </DialogTitle>
              <DialogDescription>
                Create SEO-friendly URLs for your content
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="entity_type">Entity Type</Label>
                  <Select 
                    value={formData.entity_type} 
                    onValueChange={(value) => setFormData({ ...formData, entity_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="project">Project</SelectItem>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="page">Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="entity_id">Entity ID</Label>
                  <Input
                    id="entity_id"
                    value={formData.entity_id}
                    onChange={(e) => setFormData({ ...formData, entity_id: e.target.value })}
                    placeholder="UUID of the entity"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="original_path">Original Path</Label>
                <Input
                  id="original_path"
                  value={formData.original_path}
                  onChange={(e) => setFormData({ ...formData, original_path: e.target.value })}
                  placeholder="/product/uuid-here"
                  required
                />
              </div>

              <div>
                <Label htmlFor="custom_path">Custom Path</Label>
                <Input
                  id="custom_path"
                  value={formData.custom_path}
                  onChange={(e) => setFormData({ ...formData, custom_path: e.target.value })}
                  placeholder="seo-friendly-product-name"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
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
                  {editingUrl ? 'Update' : 'Create'} URL
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Custom URLs</CardTitle>
          <CardDescription>Manage SEO-friendly URLs for your content</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Custom Path</TableHead>
                <TableHead>Original Path</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {urls.map((url) => (
                <TableRow key={url.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      /{url.custom_path}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${window.location.origin}/${url.entity_type}/${url.custom_path}`)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {url.original_path}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{url.entity_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(url.id, url.is_active)}
                    >
                      <Badge variant={url.is_active ? "default" : "secondary"}>
                        {url.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/${url.entity_type}/${url.custom_path}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(url)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(url.id)}
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

      {conflicts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              URL Conflicts Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <p key={index} className="text-sm text-orange-700">
                  {conflict}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminURLManager;