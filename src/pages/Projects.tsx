import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, MapPin, Calendar, Building, Star } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedCategory]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('completion_date', { ascending: false });

      if (error) throw error;
      
      setProjects(data || []);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data?.map(p => p.category).filter(Boolean) || [])];
      setCategories(uniqueCategories);
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

  const filterProjects = () => {
    let filtered = projects;

    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (project.category && project.category.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(project => project.category === selectedCategory);
    }

    setFilteredProjects(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      {/* Header */}
      <div className="bg-white shadow-sm pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">Our Portfolio</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our completed projects and see how we've helped businesses across Nigeria achieve their engineering goals
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Featured Projects */}
        {filteredProjects.some(p => p.is_featured) && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Featured Projects</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects
                .filter(project => project.is_featured)
                .map((project) => (
                   <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
                     <div className="relative overflow-hidden">
                       <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                         <img
                           src={project.featured_image}
                           alt={project.title}
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                       </div>
                       <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground backdrop-blur-sm">
                         <Star className="h-3 w-3 mr-1" />
                         Featured
                       </Badge>
                       <div className="absolute bottom-4 left-4 right-4">
                         <div className="flex gap-2 mb-2">
                           {project.tags && project.tags.slice(0, 2).map((tag, index) => (
                             <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                               {tag}
                             </Badge>
                           ))}
                         </div>
                         <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                         <p className="text-sm text-white/90 line-clamp-2">
                           {project.excerpt || project.description}
                         </p>
                       </div>
                     </div>
                     <CardContent className="p-6">
                       <div className="space-y-3 mb-4">
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <Building className="h-4 w-4 text-primary" />
                           <span>{project.client || project.client_name}</span>
                         </div>
                         <div className="flex items-center gap-2 text-sm text-muted-foreground">
                           <MapPin className="h-4 w-4 text-primary" />
                           <span>{project.location}</span>
                         </div>
                         <div className="flex items-center justify-between text-sm">
                           <div className="flex items-center gap-2 text-muted-foreground">
                             <Calendar className="h-4 w-4 text-primary" />
                             <span>{project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}</span>
                           </div>
                           <Badge variant={project.status === 'completed' ? 'default' : project.status === 'ongoing' ? 'secondary' : 'outline'} className="text-xs">
                             {project.status}
                           </Badge>
                         </div>
                       </div>
                       <Button
                         onClick={() => navigate(`/project/${project.id}`)}
                         className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                         variant="outline"
                       >
                         View Project Details
                       </Button>
                     </CardContent>
                   </Card>
                ))}
            </div>
          </div>
        )}

        {/* All Projects */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">All Projects</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
                <div className="relative overflow-hidden">
                  <div className="aspect-[4/3] bg-gradient-to-br from-muted/50 to-muted overflow-hidden">
                    <img
                      src={project.featured_image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  </div>
                  {project.is_featured && (
                    <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground backdrop-blur-sm">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex gap-2 mb-2">
                      {project.tags && project.tags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs bg-white/20 text-white border-white/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-sm text-white/90 line-clamp-2">
                      {project.excerpt || project.description}
                    </p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4 text-primary" />
                      <span>{project.client || project.client_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{project.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>{project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <Badge variant={project.status === 'completed' ? 'default' : project.status === 'ongoing' ? 'secondary' : 'outline'} className="text-xs">
                        {project.status}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/project/${project.id}`)}
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                    variant="outline"
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Projects;