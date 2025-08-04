import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const TermsOfService = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Terms and Conditions of Use</CardTitle>
              <p className="text-muted-foreground">Effective Date: January 2025</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-lg mb-6">
                Welcome to EINSPOT. These Terms and Conditions ("Terms") govern your access to and use of the EINSPOT website (https://einspot.com), our services, and any purchase, request, or interaction related to Rheem HVAC, MEP, and plumbing products made available by EINSPOT.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. About EINSPOT</h2>
              <p>
                EINSPOT is an authorized and licensed distributor and installer of <strong>Rheem</strong> products in Nigeria. We specialize in HVAC systems, Mechanical, Electrical, and Plumbing (MEP) installations, and residential, commercial, and industrial plumbing services. EINSPOT is not owned by Rheem Manufacturing Company but operates under license and agreement to sell and install Rheem-certified equipment and solutions.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Eligibility</h2>
              <p>By using our website or services, you represent that you:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Are at least 18 years of age</li>
                <li>Possess the legal capacity to enter into a binding agreement</li>
                <li>Are using the services for lawful purposes only</li>
              </ul>
              <p>
                If you are using EINSPOT services on behalf of a business or organization, you confirm that you are authorized to bind such entity to these Terms.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Use of Our Website</h2>
              <p>The EINSPOT website is intended for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Learning about our products and services</li>
                <li>Requesting consultations or quotations</li>
                <li>Placing orders for Rheem products</li>
                <li>Scheduling installations, maintenance, or inspections</li>
                <li>Contacting customer service</li>
                <li>Accessing product documentation or resources</li>
              </ul>

              <p>You agree <strong>not to</strong>:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Use the site for unlawful or unauthorized purposes</li>
                <li>Attempt to gain unauthorized access to data or systems</li>
                <li>Copy, reproduce, or exploit any content without permission</li>
                <li>Upload viruses or harmful software</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Product Information and Pricing</h2>
              <p>EINSPOT strives to ensure that all Rheem product information listed on our website is accurate, complete, and up to date. However:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>All prices are subject to change without prior notice</li>
                <li>Product images may vary slightly from actual items due to updates or market availability</li>
                <li>Availability is based on regional supply and logistics constraints</li>
                <li>Certain product features are dependent on the correct installation environment and service recommendations</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. Orders, Payment & Invoicing</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">a. Placing Orders</h3>
              <p>Orders can be placed online via einspot.com or through direct consultation with our sales engineers or project team.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">b. Payment Terms</h3>
              <p>Payments may be made via:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Secure online gateways (Paystack, Flutterwave, etc.)</li>
                <li>Direct bank transfer</li>
                <li>Verified POS or offline payment channels</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Product Warranty</h2>
              <p>All Rheem products distributed by EINSPOT come with manufacturer-backed warranties, which vary by product type.</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Rheem Water Heaters:</strong> Usually 2–5 years</li>
                <li><strong>HVAC Systems:</strong> Vary by model and usage</li>
                <li><strong>Plumbing Fixtures and Accessories:</strong> Subject to installation and operational terms</li>
              </ul>

              <p>Warranty is <strong>void</strong> if:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>The product is installed by unauthorized personnel</li>
                <li>There is evidence of tampering, misuse, or electrical faults</li>
                <li>The product was used outside the recommended environmental conditions</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Returns and Refunds</h2>
              <p>EINSPOT accepts product returns within <strong>7 days</strong> of delivery, under these conditions:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>The item is <strong>unused</strong> and in original packaging</li>
                <li>There is no visible damage</li>
                <li>Proof of purchase is provided</li>
              </ul>

              <p><strong>No refunds</strong> are offered for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Used or installed products</li>
                <li>Services (e.g., consultation, labor)</li>
                <li>Custom orders or special equipment not in regular stock</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Limitation of Liability</h2>
              <p>EINSPOT is <strong>not liable</strong> for:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Losses due to improper installation or third-party tampering</li>
                <li>Business loss, loss of data, or profit arising from the use or misuse of our website</li>
                <li>Delays due to force majeure (e.g., strikes, natural disasters, or government actions)</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Governing Law and Jurisdiction</h2>
              <p>
                These Terms shall be governed and interpreted under the laws of the <strong>Federal Republic of Nigeria</strong>. 
                Disputes arising from these Terms will be resolved through courts located in Lagos State, Nigeria.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">10. Contact Us</h2>
              <p>If you have any questions about these Terms and Conditions, please contact us:</p>
              <div className="bg-secondary/20 p-4 rounded-lg my-6">
                <strong>EINSPOT Customer Service</strong><br />
                Email: <strong>support@einspot.com</strong><br />
                Phone: <strong>+234 123 456 7890</strong><br />
                Website: <strong>https://einspot.com</strong>
              </div>

              <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                <p className="text-center font-semibold">
                  Thank you for choosing EINSPOT — Nigeria's trusted Rheem partner.
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

export default TermsOfService;