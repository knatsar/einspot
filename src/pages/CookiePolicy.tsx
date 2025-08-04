import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CookiePolicy = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">Cookie Policy</CardTitle>
              <p className="text-muted-foreground">Effective Date: January 2025</p>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <p className="text-lg mb-6">
                This Cookie Policy explains how EINSPOT ("we," "us," or "our") uses cookies and similar tracking technologies when you visit our website at https://einspot.com (the "Site"). This policy explains what these technologies are, why we use them, and your rights to control our use of them.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">1. What Are Cookies?</h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners. Cookies allow a website to recognize your device and store some information about your preferences or past actions.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">2. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">a. Essential Cookies</h3>
              <p>These cookies are necessary for the website to function properly. They enable basic functions like page navigation, access to secure areas, and remembering your login status. The website cannot function properly without these cookies.</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">b. Performance Cookies</h3>
              <p>These cookies collect information about how visitors use our website, such as which pages are visited most often and if visitors get error messages from web pages. These cookies help us improve the performance of our website.</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">c. Functional Cookies</h3>
              <p>These cookies allow the website to remember choices you make (such as your user name, language, or region) and provide enhanced, more personal features.</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">d. Analytics Cookies</h3>
              <p>We use analytics services such as Google Analytics to help analyze how users use the Site. These cookies collect information about your use of the Site, including your IP address, pages visited, time spent on pages, and other statistical data.</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">3. Why We Use Cookies</h2>
              <p>We use cookies for several reasons:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Security:</strong> To protect your data and prevent unauthorized access</li>
                <li><strong>Functionality:</strong> To remember your preferences and settings</li>
                <li><strong>Performance:</strong> To analyze site traffic and improve our services</li>
                <li><strong>User Experience:</strong> To provide personalized content and features</li>
                <li><strong>Marketing:</strong> To deliver relevant advertisements and measure their effectiveness</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">4. Third-Party Cookies</h2>
              <p>Some cookies on our site are set by third-party services. These may include:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Google Analytics:</strong> For website analytics and performance measurement</li>
                <li><strong>Payment Processors:</strong> For secure payment processing (Paystack, Flutterwave)</li>
                <li><strong>Social Media Platforms:</strong> For social media integration and sharing</li>
                <li><strong>Customer Support:</strong> For live chat and customer service features</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">5. How Long Cookies Stay on Your Device</h2>
              <p>The length of time a cookie stays on your device depends on whether it is a "persistent" or "session" cookie:</p>
              <ul className="list-disc pl-6 mb-4">
                <li><strong>Session Cookies:</strong> These are temporary and are deleted when you close your browser</li>
                <li><strong>Persistent Cookies:</strong> These remain on your device for a set period of time or until you delete them manually</li>
              </ul>

              <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Cookie Choices</h2>
              <p>You have several options to manage or disable cookies:</p>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">Browser Settings</h3>
              <p>Most web browsers allow you to control cookies through their settings preferences. You can typically:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Delete all cookies from your browser</li>
                <li>Block all cookies from being set</li>
                <li>Allow cookies only from specific sites</li>
                <li>Block third-party cookies</li>
                <li>Clear all cookies when you close the browser</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">Google Analytics Opt-out</h3>
              <p>You can opt-out of Google Analytics by downloading and installing the Google Analytics Opt-out Browser Add-on available at: https://tools.google.com/dlpage/gaoptout</p>

              <h2 className="text-2xl font-bold mt-8 mb-4">7. Impact of Disabling Cookies</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg my-6">
                <p><strong>Important:</strong> If you choose to disable cookies, some features of our website may not function properly. This may include:</p>
                <ul className="list-disc pl-6 mt-2">
                  <li>Login functionality</li>
                  <li>Shopping cart features</li>
                  <li>Personalized content</li>
                  <li>Form submissions</li>
                  <li>Customer support features</li>
                </ul>
              </div>

              <h2 className="text-2xl font-bold mt-8 mb-4">8. Updates to This Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will notify you of any material changes by posting the updated policy on our website with a new effective date.
              </p>

              <h2 className="text-2xl font-bold mt-8 mb-4">9. Contact Us</h2>
              <p>If you have any questions about our use of cookies, please contact us:</p>
              <div className="bg-secondary/20 p-4 rounded-lg my-6">
                <strong>EINSPOT Privacy Team</strong><br />
                Email: <strong>privacy@einspot.com</strong><br />
                Phone: <strong>+234 123 456 7890</strong><br />
                Address: <strong>Victoria Island, Lagos, Nigeria</strong><br />
                Website: <strong>https://einspot.com</strong>
              </div>

              <div className="mt-8 p-4 bg-primary/10 rounded-lg">
                <p className="text-center font-semibold">
                  By continuing to use our website, you consent to our use of cookies as described in this policy.
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

export default CookiePolicy;