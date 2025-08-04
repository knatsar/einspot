import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Thermometer, 
  Droplets, 
  Flame, 
  Zap, 
  Eye, 
  Gauge,
  Waves,
  Building,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ServicesSection = () => {
  const services = [
    {
      icon: Thermometer,
      title: 'HVAC Design & Installation',
      description: 'High-performance heating, ventilation, and air-conditioning designs using Rheem® certified solutions.',
      features: ['VRF/VRV systems', 'Ducted split systems', 'Commercial HVAC', 'Smart controls']
    },
    {
      icon: Droplets,
      title: 'Plumbing Design & Execution',
      description: 'Complete plumbing designs for water supply, distribution, and waste systems.',
      features: ['Water storage systems', 'Booster pumps', 'Gas piping', 'Rainwater harvesting']
    },
    {
      icon: Flame,
      title: 'Fire Protection & Safety Systems',
      description: 'Design and installation of active fire protection systems for complete safety.',
      features: ['Fire sprinklers', 'FM200 systems', 'Hose reels', 'Emergency lighting']
    },
    {
      icon: Zap,
      title: 'Electrical Design & Systems',
      description: 'Certified electrical solutions including power distribution and automation.',
      features: ['Power distribution', 'Smart lighting', 'Solar integration', 'Backup systems']
    },
    {
      icon: Eye,
      title: 'Extra Low Voltage (ELV) Systems',
      description: 'Security and automation infrastructure for modern buildings.',
      features: ['CCTV surveillance', 'Access control', 'Fire alarms', 'Structured cabling']
    },
    {
      icon: Gauge,
      title: 'Building Management Systems',
      description: 'Smart BMS solutions for central monitoring and control of building systems.',
      features: ['HVAC control', 'Energy monitoring', 'Security integration', 'Mobile apps']
    },
    {
      icon: Waves,
      title: 'Water & Waste Treatment',
      description: 'Complete water treatment and sewage management solutions.',
      features: ['Water purification', 'Sewage treatment', 'Reverse osmosis', 'Recycling systems']
    },
    {
      icon: Building,
      title: 'Engineering Consultancy',
      description: 'Expert consultation and project advisory for complex engineering projects.',
      features: ['System design', 'Project management', 'Compliance assessment', 'Technical support']
    }
  ];

  return (
    <section id="services" className="py-20 bg-gradient-to-b from-secondary/10 to-background">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Our Services</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Complete MEP Engineering Solutions
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            From consultation to installation and maintenance, we provide end-to-end 
            mechanical, electrical, and plumbing solutions across Nigeria.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm hover:scale-105">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <service.icon className="h-7 w-7" />
                  </div>
                </div>
                <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-3xl p-8 md:p-12 text-center text-primary-foreground">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">
            Ready for Professional MEP Solutions?
          </h3>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Get expert consultation and custom quotes for your engineering project. 
            Our certified engineers are ready to deliver original Rheem® systems and complete MEP solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              Get Free Quote
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              Call Now: +234 812 364 7982
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;