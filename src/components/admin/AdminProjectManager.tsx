import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Star } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  client_name: string;
  location: string;
  category: string;
  featured_image: string;
  completion_date: string;
  is_featured: boolean;
  tags: string[];
  excerpt: string;
  client: string;
  status: string;
  duration: string;
  technology_used: string;
  project_summary: string;
  process_overview: string;
  key_features: string;
  client_feedback: string;
  client_feedback_author: string;
  focus_keyphrase: string;
  meta_description: string;
  keyphrase_slug: string;
  synonyms: string;
  gallery_images: string[];
}

const AdminProjectManager = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    client_name: '',
    location: '',
    category: '',
    featured_image: '',
    completion_date: '',
    is_featured: false,
    tags: '',
    excerpt: '',
    client: '',
    status: 'completed',
    duration: '',
    technology_used: '',
    project_summary: '',
    process_overview: '',
    key_features: '',
    client_feedback: '',
    client_feedback_author: '',
    focus_keyphrase: '',
    meta_description: '',
    keyphrase_slug: '',
    synonyms: '',
    gallery_images: ''
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('completion_date', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Error",
        description: "Failed to load projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare data for submission
      const submitData = {
        ...formData,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        gallery_images: formData.gallery_images ? formData.gallery_images.split(',').map(img => img.trim()) : []
      };

      if (editingProject) {
        const { error } = await supabase
          .from('projects')
          .update(submitData)
          .eq('id', editingProject.id);

        if (error) throw error;
        toast({ title: "Success", description: "Project updated successfully" });
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([submitData]);

        if (error) throw error;
        toast({ title: "Success", description: "Project created successfully" });
      }

      setIsDialogOpen(false);
      setEditingProject(null);
      resetForm();
      fetchProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      toast({
        title: "Error",
        description: "Failed to save project",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title || '',
      description: project.description || '',
      client_name: project.client_name || '',
      location: project.location || '',
      category: project.category || '',
      featured_image: project.featured_image || '',
      completion_date: project.completion_date || '',
      is_featured: project.is_featured || false,
      tags: project.tags ? project.tags.join(', ') : '',
      excerpt: project.excerpt || '',
      client: project.client || '',
      status: project.status || 'completed',
      duration: project.duration || '',
      technology_used: project.technology_used || '',
      project_summary: project.project_summary || '',
      process_overview: project.process_overview || '',
      key_features: project.key_features || '',
      client_feedback: project.client_feedback || '',
      client_feedback_author: project.client_feedback_author || '',
      focus_keyphrase: project.focus_keyphrase || '',
      meta_description: project.meta_description || '',
      keyphrase_slug: project.keyphrase_slug || '',
      synonyms: project.synonyms || '',
      gallery_images: project.gallery_images ? project.gallery_images.join(', ') : ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Success", description: "Project deleted successfully" });
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };

  const toggleFeatured = async (id: string, is_featured: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_featured: !is_featured })
        .eq('id', id);

      if (error) throw error;
      toast({ 
        title: "Success", 
        description: `Project ${!is_featured ? 'featured' : 'unfeatured'} successfully` 
      });
      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: "Error",
        description: "Failed to update project",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      client_name: '',
      location: '',
      category: '',
      featured_image: '',
      completion_date: '',
      is_featured: false,
      tags: '',
      excerpt: '',
      client: '',
      status: 'completed',
      duration: '',
      technology_used: '',
      project_summary: '',
      process_overview: '',
      key_features: '',
      client_feedback: '',
      client_feedback_author: '',
      focus_keyphrase: '',
      meta_description: '',
      keyphrase_slug: '',
      synonyms: '',
      gallery_images: ''
    });
  };

  const handleNewProject = () => {
    setEditingProject(null);
    resetForm();
    setIsDialogOpen(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Project Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewProject}>
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </DialogTitle>
              <DialogDescription>
                {editingProject ? 'Update project information' : 'Create a new project with comprehensive details'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="details">Project Details</TabsTrigger>
                  <TabsTrigger value="seo">SEO & Marketing</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic" className="space-y-4">
                  <div>
                    <Label htmlFor="title">Project Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="excerpt">Project Excerpt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      rows={3}
                      placeholder="Brief project summary for listings"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="client">Client</Label>
                      <Input
                        id="client"
                        value={formData.client}
                        onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="client_name">Client Name (Display)</Label>
                      <Input
                        id="client_name"
                        value={formData.client_name}
                        onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="e.g., Government Projects / HVAC Engineering"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="ongoing">Ongoing</SelectItem>
                          <SelectItem value="planned">Planned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        placeholder="e.g., 5 Weeks"
                      />
                    </div>
                    <div>
                      <Label htmlFor="completion_date">Completion Date</Label>
                      <Input
                        id="completion_date"
                        type="date"
                        value={formData.completion_date}
                        onChange={(e) => setFormData({ ...formData, completion_date: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tags">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                      placeholder="e.g., NDDC HVAC Bayelsa, VRF Systems, Public Infrastructure"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                    />
                    <Label htmlFor="is_featured">Featured Project</Label>
                  </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-4">
                  <div>
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="project_summary">Project Summary</Label>
                    <Textarea
                      id="project_summary"
                      value={formData.project_summary}
                      onChange={(e) => setFormData({ ...formData, project_summary: e.target.value })}
                      rows={6}
                      placeholder="Detailed project description and requirements"
                    />
                  </div>

                  <div>
                    <Label htmlFor="process_overview">Process Overview</Label>
                    <Textarea
                      id="process_overview"
                      value={formData.process_overview}
                      onChange={(e) => setFormData({ ...formData, process_overview: e.target.value })}
                      rows={6}
                      placeholder="Step-by-step project process (use • for bullet points)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="key_features">Key Features</Label>
                    <Textarea
                      id="key_features"
                      value={formData.key_features}
                      onChange={(e) => setFormData({ ...formData, key_features: e.target.value })}
                      rows={4}
                      placeholder="Project highlights and key features (use • for bullet points)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="technology_used">Technology Used</Label>
                    <Input
                      id="technology_used"
                      value={formData.technology_used}
                      onChange={(e) => setFormData({ ...formData, technology_used: e.target.value })}
                      placeholder="e.g., LG VRF Systems, BMS Light, Rheem ductless units"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4">
                  <div>
                    <Label htmlFor="client_feedback">Client Feedback</Label>
                    <Textarea
                      id="client_feedback"
                      value={formData.client_feedback}
                      onChange={(e) => setFormData({ ...formData, client_feedback: e.target.value })}
                      rows={3}
                      placeholder="Client testimonial or feedback quote"
                    />
                  </div>

                  <div>
                    <Label htmlFor="client_feedback_author">Feedback Author</Label>
                    <Input
                      id="client_feedback_author"
                      value={formData.client_feedback_author}
                      onChange={(e) => setFormData({ ...formData, client_feedback_author: e.target.value })}
                      placeholder="e.g., Engr. Dimeji Okafor, NDDC Bayelsa Facility Manager"
                    />
                  </div>

                  <div>
                    <Label htmlFor="featured_image">Featured Image URL</Label>
                    <Input
                      id="featured_image"
                      value={formData.featured_image}
                      onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                      placeholder="/src/assets/project-image.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gallery_images">Gallery Images (comma-separated URLs)</Label>
                    <Textarea
                      id="gallery_images"
                      value={formData.gallery_images}
                      onChange={(e) => setFormData({ ...formData, gallery_images: e.target.value })}
                      rows={3}
                      placeholder="/src/assets/gallery1.jpg, /src/assets/gallery2.jpg"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="seo" className="space-y-4">
                  <div>
                    <Label htmlFor="focus_keyphrase">Focus Keyphrase</Label>
                    <Input
                      id="focus_keyphrase"
                      value={formData.focus_keyphrase}
                      onChange={(e) => setFormData({ ...formData, focus_keyphrase: e.target.value })}
                      placeholder="e.g., NDDC HVAC Project Nigeria"
                    />
                  </div>

                  <div>
                    <Label htmlFor="meta_description">Meta Description</Label>
                    <Textarea
                      id="meta_description"
                      value={formData.meta_description}
                      onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                      rows={3}
                      placeholder="SEO meta description (150-160 characters)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="keyphrase_slug">URL Slug</Label>
                    <Input
                      id="keyphrase_slug"
                      value={formData.keyphrase_slug}
                      onChange={(e) => setFormData({ ...formData, keyphrase_slug: e.target.value })}
                      placeholder="e.g., nddc-hvac-project-bayelsa"
                    />
                  </div>

                  <div>
                    <Label htmlFor="synonyms">Synonyms (comma-separated)</Label>
                    <Input
                      id="synonyms"
                      value={formData.synonyms}
                      onChange={(e) => setFormData({ ...formData, synonyms: e.target.value })}
                      placeholder="e.g., public building air conditioning, government HVAC engineering"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingProject ? 'Update' : 'Create'} Project
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
          <CardDescription>Manage your comprehensive project portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.client || project.client_name}</TableCell>
                  <TableCell>{project.location}</TableCell>
                  <TableCell>
                    {project.category && (
                      <Badge variant="secondary">{project.category}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'completed' ? 'default' : project.status === 'ongoing' ? 'secondary' : 'outline'}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFeatured(project.id, project.is_featured)}
                    >
                      <Star 
                        className={`h-4 w-4 ${project.is_featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} 
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(project.id)}
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
    </div>
  );
};

export default AdminProjectManager;