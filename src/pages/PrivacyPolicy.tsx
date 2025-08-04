import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Privacy Policy for EINSPOT</CardTitle>
              <p className="text-muted-foreground">Effective Date: January 2025</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-lg mb-6">
                At <strong>EINSPOT</strong>, your privacy is our top priority. As Nigeria's authorized dealer of Rheem products and a provider of professional HVAC, MEP, and plumbing services, we are committed to protecting any personal data shared with us by customers, visitors, partners, or users of our website and services.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. Who We Are</h2>
              <p>
                EINSPOT is a licensed distributor of Rheem products in Nigeria. We offer expert installation and servicing of HVAC (Heating, Ventilation, and Air Conditioning) systems, plumbing systems, and MEP (Mechanical, Electrical, and Plumbing) solutions. Our services span private homes, government projects, commercial establishments, and industrial facilities across Nigeria.
              </p>
              
              <div className="bg-secondary/20 p-4 rounded-lg my-6">
                <strong>Company Address:</strong><br />
                Victoria Island, Lagos, Nigeria<br />
                <strong>Website:</strong> https://einspot.com<br />
                <strong>Email:</strong> info@einspot.com<br />
                <strong>Phone:</strong> +234 123 456 7890
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. What Information We Collect</h2>
              <h3 className="text-xl font-semibold mt-6 mb-3">a. Personal Identifiable Information (PII)</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Full name</li>
                <li>Phone number</li>
                <li>Email address</li>
                <li>Physical address</li>
                <li>Business name (if applicable)</li>
                <li>Payment details (handled via third-party gateways)</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">b. Technical Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>IP address</li>
                <li>Browser type</li>
                <li>Device used</li>
                <li>Operating system</li>
                <li>Pages visited</li>
                <li>Time spent on pages</li>
                <li>Referring website</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">c. Transaction & Service Information</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Rheem product(s) purchased</li>
                <li>Installation or service request data</li>
                <li>Warranty registration data</li>
                <li>Project scope (if applicable)</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Use Your Information</h2>
              <p>Your information is used for the following purposes:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>To provide services:</strong> Process inquiries, orders, delivery, and installation.</li>
                <li><strong>To personalize experience:</strong> Customize content and improve website interaction.</li>
                <li><strong>To improve customer service:</strong> Respond to your queries and service feedback.</li>
                <li><strong>To process transactions:</strong> Secure handling of payments and invoices.</li>
                <li><strong>To comply with legal obligations:</strong> Including warranty claims and business registrations.</li>
                <li><strong>To send marketing emails (with consent):</strong> Updates on new Rheem products, promos, or service tips.</li>
                <li><strong>To analyze data:</strong> Understand how users interact with our platform and improve performance.</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Sharing and Disclosure</h2>
              <p>We do <strong>not sell or rent</strong> your personal data. However, we may share your information with:</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">a. Trusted Third Parties</h3>
              <ul className="list-disc pl-6 mb-4">
                <li>Payment processors (e.g., Paystack, Flutterwave)</li>
                <li>Logistics and delivery companies</li>
                <li>Installation and technical contractors under NDA</li>
                <li>Website hosting and email services</li>
                <li>Legal or regulatory authorities when required</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">b. Rheem Corporation (USA)</h3>
              <p>As a certified dealer, we may share certain data with Rheem for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Product registration</li>
                <li>Warranty processing</li>
                <li>Technical support</li>
                <li>Customer service improvements</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. How We Protect Your Data</h2>
              <p>Your information is protected using industry-grade security practices, including:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>SSL (Secure Socket Layer) encryption for our website</li>
                <li>Firewalls and intrusion detection systems on our hosting servers</li>
                <li>Regular malware scanning</li>
                <li>Password-protected systems with role-based access</li>
                <li>Staff training on data handling best practices</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Rights Under NDPR</h2>
              <p>Under the Nigeria Data Protection Regulation (NDPR), you have the right to:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate or incomplete data</li>
                <li>Request deletion or restriction of your data</li>
                <li>Object to processing under certain conditions</li>
                <li>Withdraw consent at any time for marketing or data processing</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Contact Us</h2>
              <p>If you have any questions or concerns regarding this Privacy Policy, please contact us at:</p>
              <div className="bg-secondary/20 p-4 rounded-lg my-6">
                <strong>Privacy Officer – EINSPOT</strong><br />
                Email: <strong>privacy@einspot.com</strong><br />
                Phone: <strong>+234 123 456 7890</strong><br />
                Website: <strong>https://einspot.com</strong>
              </div>

              <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                <p className="text-center font-semibold">
                  Thank you for trusting EINSPOT — your licensed and dependable Rheem partner in Nigeria.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;