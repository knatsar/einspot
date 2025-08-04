import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Shield, 
  Award, 
  Users, 
  Leaf, 
  Zap, 
  Globe,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import teamImage from '@/assets/team-consultation.jpg';

const AboutSection = () => {
  const values = [
    {
      icon: Shield,
      title: 'Integrity',
      description: 'We build trust through transparency, quality, and certified systems.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Every project is executed to global standards using the best tools and talent.'
    },
    {
      icon: Users,
      title: 'Customer Focus',
      description: 'Your satisfaction drives our operations and continuous improvement.'
    },
    {
      icon: Zap,
      title: 'Innovation',
      description: 'We stay ahead by adopting the latest in smart technology and design tools.'
    }
  ];

  const achievements = [
    { number: '36+', label: 'States Covered' },
    { number: '1000+', label: 'Projects Delivered' },
    { number: '20+', label: 'Years of Excellence' },
    { number: '100%', label: 'Rheem Certified' }
  ];

  return (
    <section id="about" className="py-20 bg-gradient-to-b from-background to-secondary/20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">About EINSPOT</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Trusted Engineering Solutions Backed by Decades of Experience
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            As certified dealers and installers of Rheem® products, we provide original, high-quality 
            mechanical, electrical, and plumbing (MEP) systems across Nigeria with over 20 years of experience.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Text Content */}
          <div>
            <h3 className="text-3xl font-bold text-foreground mb-6">
              Engineering Excellence for Modern Nigeria
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              EINSPOT specializes in delivering trusted, world-class engineering systems that power 
              homes, buildings, businesses, and institutions across Nigeria. As authorized Rheem® dealers, 
              we provide original HVAC, plumbing, fire safety, and building automation solutions.
            </p>
            <p className="text-lg text-muted-foreground mb-8">
              With over 20 years of hands-on technical experience, we've grown into one of Nigeria's 
              most dependable names for complete MEP engineering services and rapid product access.
            </p>

            {/* Certifications */}
            <div className="flex flex-wrap gap-3 mb-8">
              <Badge variant="outline" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Certified Rheem® Dealer
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Nationwide Coverage
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                20+ Years Experience
              </Badge>
            </div>

            <Link to="/projects">
              <Button size="lg" className="group">
                View Our Projects
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {/* Image */}
          <div className="relative">
            <img 
              src={teamImage} 
              alt="Einspot team consultation" 
              className="rounded-2xl shadow-2xl w-full"
            />
            <div className="absolute -bottom-6 -left-6 bg-primary text-primary-foreground p-6 rounded-xl shadow-lg">
              <div className="text-2xl font-bold">20+</div>
              <div className="text-sm opacity-90">Years of Excellence</div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-20">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">Our Core Values</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow border-0 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-full mb-4">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h4 className="text-xl font-semibold text-foreground mb-3">{value.title}</h4>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-3xl p-8 md:p-12">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">Our Impact</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {achievement.number}
                </div>
                <div className="text-muted-foreground font-medium">
                  {achievement.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;