import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useUrlResolver } from '@/hooks/use-url-resolver';
import { ArrowLeft, Calendar, MapPin, Building, Clock, Wrench, Quote, ExternalLink } from 'lucide-react';
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

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loading, notFound, data: project, customUrl } = useUrlResolver(id || '', 'project');

  // Redirect to custom URL if available
  useEffect(() => {
    if (customUrl && id !== customUrl) {
      navigate(`/project/${customUrl}`, { replace: true });
    }
  }, [customUrl, id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading project details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh] pt-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <p className="text-muted-foreground mb-8">The project you're looking for might have been moved or no longer exists.</p>
            <Button onClick={() => navigate('/projects')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      {/* Hero Section */}
      <div className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/projects')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="text-sm">
                  {project.category}
                </Badge>
                {project.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Featured Project
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                {project.title}
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                {project.excerpt || project.description}
              </p>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <Building className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Client</p>
                    <p className="font-medium">{project.client || project.client_name}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{project.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="font-medium">
                      {project.completion_date ? new Date(project.completion_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="font-medium">{project.duration || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <img
                  src={project.featured_image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute top-4 right-4">
                <Badge variant={project.status === 'completed' ? 'default' : project.status === 'ongoing' ? 'secondary' : 'outline'}>
                  {project.status}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Project Summary */}
            {project.project_summary && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-muted-foreground leading-relaxed">
                      {project.project_summary}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Process Overview */}
            {project.process_overview && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <div className="text-muted-foreground">
                      {project.process_overview.split('\n').map((line, index) => (
                        <p key={index} className="mb-2">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Key Features */}
            {project.key_features && (
              <Card>
                <CardHeader>
                  <CardTitle>Key Features & Highlights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <div className="text-muted-foreground">
                      {project.key_features.split('\n').map((line, index) => (
                        <p key={index} className="mb-2">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Feedback */}
            {project.client_feedback && (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Quote className="h-5 w-5 text-primary" />
                    Client Testimonial
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <blockquote className="text-lg italic text-foreground mb-4">
                    "{project.client_feedback}"
                  </blockquote>
                  {project.client_feedback_author && (
                    <cite className="text-sm text-muted-foreground font-medium">
                      — {project.client_feedback_author}
                    </cite>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Gallery */}
            {project.gallery_images && project.gallery_images.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {project.gallery_images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                        <img
                          src={image}
                          alt={`${project.title} gallery ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.technology_used && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Wrench className="h-4 w-4 text-primary" />
                      <span className="font-medium">Technology Used</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {project.technology_used}
                    </p>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <span className="font-medium text-sm">Project Status</span>
                  <div className="mt-1">
                    <Badge variant={project.status === 'completed' ? 'default' : project.status === 'ongoing' ? 'secondary' : 'outline'}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
                
                {project.tags && project.tags.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <span className="font-medium text-sm mb-2 block">Project Tags</span>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Contact CTA */}
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Start Your Project</CardTitle>
                <CardDescription>
                  Ready to work with us on your next engineering project?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={() => navigate('/contact')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Get Started Today
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProjectDetail;