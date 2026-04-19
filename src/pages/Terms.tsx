import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Terms of Service - Drilzz</title>
        <meta name="description" content="Terms of Service for Drilzz platform. Read our terms and conditions for using our coaching drill management platform." />
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
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>By accessing and using CoachUniverse ("the Platform"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
              <p>CoachUniverse provides a platform for coaches to create, share, and manage sports training drills. The Platform enables collaboration, organization, and distribution of coaching content within sport-specific communities.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
              <p>To access certain features, you must create an account. You are responsible for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and current information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. User Content</h2>
              <p>You retain ownership of content you create and upload. By posting content on the Platform, you grant CoachUniverse a worldwide, non-exclusive, royalty-free license to use, reproduce, and distribute your content for the purpose of operating and promoting the Platform.</p>
              <p className="mt-4">You represent that:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You own or have rights to all content you post</li>
                <li>Your content does not violate any third-party rights</li>
                <li>Your content complies with applicable laws and these Terms</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Acceptable Use</h2>
              <p>You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Post harmful, offensive, or inappropriate content</li>
                <li>Attempt to gain unauthorized access to the Platform</li>
                <li>Interfere with the proper functioning of the Platform</li>
                <li>Use automated systems to access the Platform without permission</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
              <p>The Platform, including its design, features, and content (excluding user-generated content), is owned by CoachUniverse and protected by copyright, trademark, and other intellectual property laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Termination</h2>
              <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason. You may delete your account at any time through your account settings.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Disclaimers</h2>
              <p>THE PLATFORM IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
              <p>TO THE MAXIMUM EXTENT PERMITTED BY LAW, COACHUSNIVERSE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Terms</h2>
              <p>We reserve the right to modify these Terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the Platform after changes constitutes acceptance of the modified Terms.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact</h2>
              <p>For questions about these Terms, please contact us at: contact@drilzz.com</p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Terms;
