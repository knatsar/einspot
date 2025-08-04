import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, CheckCircle, AlertTriangle, Phone, Mail } from 'lucide-react';

const Warranty = () => {
  const warrantyTypes = [
    {
      category: "Rheem Water Heaters",
      duration: "2-5 Years",
      coverage: "Tank, heating elements, thermostats",
      conditions: "Professional installation required"
    },
    {
      category: "HVAC Systems",
      duration: "1-10 Years",
      coverage: "Compressor, coils, electrical components",
      conditions: "Regular maintenance required"
    },
    {
      category: "Plumbing Fixtures",
      duration: "1-3 Years",
      coverage: "Manufacturing defects, parts replacement",
      conditions: "Normal use conditions"
    },
    {
      category: "Installation Services",
      duration: "1 Year",
      coverage: "Workmanship, installation defects",
      conditions: "EINSPOT certified installation"
    }
  ];

  const warrantySteps = [
    {
      step: "1",
      title: "Contact Us",
      description: "Call or email us with your warranty claim within the warranty period"
    },
    {
      step: "2",
      title: "Provide Documentation",
      description: "Present your invoice, warranty certificate, and proof of installation"
    },
    {
      step: "3",
      title: "Inspection",
      description: "Our certified technician will inspect the product or installation"
    },
    {
      step: "4",
      title: "Resolution",
      description: "We'll repair, replace, or provide compensation as per warranty terms"
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-6">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Warranty Information</Badge>
            <h1 className="text-4xl font-bold text-foreground mb-6">
              EINSPOT Warranty Policy
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive warranty coverage for all Rheem products and EINSPOT installation services. 
              Your peace of mind is our commitment.
            </p>
          </div>

          {/* Warranty Coverage */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Product Warranty Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {warrantyTypes.map((warranty, index) => (
                    <div key={index} className="border-l-4 border-primary pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{warranty.category}</h4>
                        <Badge variant="outline">{warranty.duration}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        <strong>Coverage:</strong> {warranty.coverage}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Condition:</strong> {warranty.conditions}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  What's Covered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Manufacturing defects in materials and workmanship</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Premature failure under normal operating conditions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Parts replacement and labor costs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Installation defects by EINSPOT technicians</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">Free annual maintenance during warranty period</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* What's Not Covered */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                Warranty Exclusions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Not Covered:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span className="text-sm">Damage due to misuse or negligence</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span className="text-sm">Installation by unauthorized personnel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span className="text-sm">Normal wear and tear</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span className="text-sm">Damage from power surges or electrical issues</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Warranty Voids If:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span className="text-sm">Product is tampered with or modified</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span className="text-sm">Used outside recommended conditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span className="text-sm">Maintenance schedules not followed</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <span className="text-sm">Repairs attempted by unauthorized service providers</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Warranty Claim Process */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                How to Make a Warranty Claim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {warrantySteps.map((step, index) => (
                  <div key={index} className="text-center">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                      {step.step}
                    </div>
                    <h4 className="font-semibold mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Required Documentation */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Required Documentation for Warranty Claims</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    📄
                  </div>
                  <h4 className="font-semibold mb-2">Purchase Invoice</h4>
                  <p className="text-sm text-muted-foreground">Original receipt or invoice showing purchase date and product details</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    🛡️
                  </div>
                  <h4 className="font-semibold mb-2">Warranty Certificate</h4>
                  <p className="text-sm text-muted-foreground">Warranty registration certificate provided at installation</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    🔧
                  </div>
                  <h4 className="font-semibold mb-2">Installation Records</h4>
                  <p className="text-sm text-muted-foreground">Proof of professional installation by EINSPOT certified technicians</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Warranty Support Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold mb-4">For Warranty Claims and Support:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-primary" />
                      <span><strong>Warranty Hotline:</strong> +234 123 456 7890</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-primary" />
                      <span><strong>Email:</strong> warranty@einspot.com</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-primary" />
                      <span><strong>Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-4">Emergency Service:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-red-600" />
                      <span><strong>24/7 Emergency:</strong> +234 123 456 7891</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-red-600" />
                      <span><strong>Emergency Email:</strong> emergency@einspot.com</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      Emergency service available for critical HVAC and plumbing issues. Additional charges may apply for after-hours service.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Warranty;