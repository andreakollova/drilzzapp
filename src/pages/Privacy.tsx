import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Privacy Policy - Drilzz</title>
        <meta name="description" content="Privacy Policy for Drilzz. Learn how we collect, use, and protect your personal data in compliance with GDPR." />
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
          <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
            <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
              <p>CoachUniverse ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.</p>
              <p className="mt-4">This policy complies with the General Data Protection Regulation (GDPR) and other applicable data protection laws.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">2. Data Controller</h2>
              <p>Drilzz is the data controller responsible for your personal data. For data protection inquiries, contact: contact@drilzz.com</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">3. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold mt-6 mb-3">3.1 Information You Provide</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, password, sport, club, teams, and bio</li>
                <li><strong>Profile Information:</strong> Profile photo, country, and other optional details</li>
                <li><strong>Content:</strong> Drills, images, videos, comments, and other content you create or upload</li>
                <li><strong>Communications:</strong> Messages, notifications preferences, and support requests</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">3.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent, and interaction patterns</li>
                <li><strong>Device Information:</strong> IP address, browser type, device type, and operating system</li>
                <li><strong>Cookies:</strong> See our Cookie Policy for details</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">4. How We Use Your Information</h2>
              <p>We use your personal data for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Service Provision:</strong> To operate, maintain, and improve the Platform</li>
                <li><strong>Account Management:</strong> To create and manage your account</li>
                <li><strong>Communication:</strong> To send notifications, updates, and respond to inquiries</li>
                <li><strong>Personalization:</strong> To customize your experience based on your sport and preferences</li>
                <li><strong>Community Features:</strong> To enable social features like following, commenting, and sharing</li>
                <li><strong>Analytics:</strong> To understand usage patterns and improve our services</li>
                <li><strong>Security:</strong> To detect, prevent, and address technical issues and abuse</li>
                <li><strong>Legal Compliance:</strong> To comply with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">5. Legal Basis for Processing (GDPR)</h2>
              <p>We process your personal data based on:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contract Performance:</strong> Processing necessary to provide our services</li>
                <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing emails)</li>
                <li><strong>Legitimate Interests:</strong> For analytics, security, and service improvement</li>
                <li><strong>Legal Obligations:</strong> To comply with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Sharing and Disclosure</h2>
              <p>We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Other Users:</strong> Your public profile and published drills are visible to other coaches in your sport community</li>
                <li><strong>Service Providers:</strong> Third-party services that help us operate the Platform (e.g., hosting, email delivery)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p className="mt-4">We do not sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">7. Data Retention</h2>
              <p>We retain your personal data for as long as your account is active or as needed to provide services. When you delete your account, we delete your personal data within 30 days, except where we must retain data for legal obligations.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">8. Your Rights (GDPR)</h2>
              <p>Under GDPR, you have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                <li><strong>Erasure:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time</li>
                <li><strong>Lodge a Complaint:</strong> File a complaint with a supervisory authority</li>
              </ul>
              <p className="mt-4">To exercise these rights, contact: contact@drilzz.com</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">9. Data Security</h2>
              <p>We implement appropriate technical and organizational measures to protect your personal data, including encryption, access controls, and secure data storage. However, no method of transmission over the internet is 100% secure.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">10. International Data Transfers</h2>
              <p>Your data may be transferred to and processed in countries outside your country of residence. We ensure appropriate safeguards are in place for such transfers, including standard contractual clauses approved by the European Commission.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">11. Children's Privacy</h2>
              <p>The Platform is not intended for children under 16. We do not knowingly collect personal data from children under 16. If we learn we have collected such data, we will delete it promptly.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of significant changes via email or platform notification. Continued use after changes constitutes acceptance of the updated policy.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Us</h2>
              <p>For questions about this Privacy Policy or to exercise your rights, contact:</p>
              <p className="mt-2">Email: contact@drilzz.com</p>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Privacy;
