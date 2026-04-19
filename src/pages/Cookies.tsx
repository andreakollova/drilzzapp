import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Cookies = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Cookie Policy - CoachUniverse</title>
        <meta name="description" content="Cookie Policy for CoachUniverse. Learn about the cookies we use and how to manage your preferences." />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. What Are Cookies</h2>
              <p>Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Cookies</h2>
              <p>CoachUniverse uses cookies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Keep you signed in to your account</li>
                <li>Remember your preferences and settings</li>
                <li>Understand how you use the Platform</li>
                <li>Improve Platform performance and user experience</li>
                <li>Provide security features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Types of Cookies We Use</h2>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Strictly Necessary Cookies</h3>
              <p>These cookies are essential for the Platform to function. They enable core functionality such as security, authentication, and session management. The Platform cannot function properly without these cookies.</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Authentication cookies:</strong> Keep you logged in to your account</li>
                <li><strong>Security cookies:</strong> Protect against fraud and enhance security</li>
                <li><strong>Session cookies:</strong> Maintain your session state</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Functional Cookies</h3>
              <p>These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Preference cookies:</strong> Remember your language, sport, and notification preferences</li>
                <li><strong>UI cookies:</strong> Remember your view preferences and interface settings</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.3 Analytics Cookies</h3>
              <p>These cookies help us understand how visitors interact with the Platform by collecting and reporting information anonymously.</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Usage analytics:</strong> Track page views, features used, and user flows</li>
                <li><strong>Performance monitoring:</strong> Measure Platform performance and identify issues</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.4 Consent Cookies</h3>
              <p>These cookies remember your cookie consent preferences.</p>
              <ul className="list-disc pl-6 space-y-2 mt-4">
                <li><strong>Cookie consent:</strong> Store your cookie acceptance or rejection choices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. Third-Party Cookies</h2>
              <p>We may use third-party services that set cookies on our Platform, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Authentication providers:</strong> For secure login and account management</li>
                <li><strong>Cloud infrastructure providers:</strong> For hosting and data storage</li>
                <li><strong>Email service providers:</strong> For transactional and notification emails</li>
              </ul>
              <p className="mt-4">These third parties have their own privacy policies governing their use of cookies.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. How Long Cookies Stay on Your Device</h2>
              <p>We use both session cookies and persistent cookies:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
                <li><strong>Persistent cookies:</strong> Remain on your device until they expire or you delete them. Expiration periods vary from a few days to several years depending on the cookie's purpose.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Managing Cookies</h2>
              <p>You can control and manage cookies in several ways:</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.1 Cookie Consent Banner</h3>
              <p>When you first visit the Platform, you'll see a cookie consent banner allowing you to accept or customize cookie preferences. You can change your preferences at any time by clicking "Cookie Settings" in the footer.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.2 Browser Settings</h3>
              <p>Most browsers allow you to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>View and delete cookies</li>
                <li>Block third-party cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
                <li>Delete all cookies when you close the browser</li>
              </ul>
              <p className="mt-4">Note: Blocking or deleting cookies may impact Platform functionality and your user experience.</p>

              <h3 className="text-xl font-semibold mt-6 mb-3">6.3 Browser-Specific Instructions</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                <li><strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data</li>
                <li><strong>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
                <li><strong>Edge:</strong> Settings → Privacy, search, and services → Cookies and site permissions</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Do Not Track Signals</h2>
              <p>Some browsers support "Do Not Track" (DNT) signals. Currently, there is no industry standard for responding to DNT signals. We do not respond to DNT signals at this time.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Changes to This Policy</h2>
              <p>We may update this Cookie Policy from time to time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contact Us</h2>
              <p>For questions about this Cookie Policy, contact: contact@drilzz.com</p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Cookies;
