import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-1" data-testid="title-privacy">Pathwise Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 14, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
            <p className="text-muted-foreground">This Privacy Policy explains how Pathwise NYC ("Pathwise," "we," "us," or "our") collects, uses, shares, and protects your personal information when you use the Pathwise website and services at pathwise.nyc (the "Service"). It applies to all users, including those in the United States and internationally.</p>
            <p className="text-muted-foreground mt-2">By using the Service, you agree to the practices described here. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Information We Collect</h2>
            <p className="text-muted-foreground font-medium mb-2">Information you provide directly:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Account information:</strong> your first and last name, email address, and password (stored in encrypted/hashed form). If you sign in through a third party such as Google, we receive basic profile information from that provider.</li>
              <li><strong>Career documents and inputs:</strong> resumes, CVs, and any text, answers, or details you submit when using our tools (for example, target roles, background information, job postings, and salary details).</li>
              <li><strong>Mock interview recordings:</strong> if you use the Mock Interview feature, audio and video you record, and the transcripts generated from them.</li>
              <li><strong>Communications:</strong> information you submit through our contact form, including your name, email, and message.</li>
            </ul>
            <p className="text-muted-foreground font-medium mb-2">Information collected automatically:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Essential/authentication cookies and local storage:</strong> we use cookies and browser local storage only as necessary to operate the Service, such as keeping you logged in and saving your session and preferences. We do not use advertising or third-party analytics tracking cookies.</li>
              <li><strong>Limited technical data:</strong> basic information your browser sends automatically (such as IP address) as needed to deliver and secure the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-2">We use your information solely to provide and operate the Service, including to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Create and manage your account and authenticate you.</li>
              <li>Generate the AI-assisted outputs you request (resume analysis, career matches, networking recommendations, interview critiques, document conversion, and similar features).</li>
              <li>Send transactional emails such as password resets and email verification.</li>
              <li>Respond to your contact-form messages and support requests.</li>
              <li>Maintain the security, integrity, and proper functioning of the Service.</li>
            </ul>
            <p className="text-muted-foreground mt-3">We do not sell your personal information. We do not use your personal information for advertising, and we do not use your User Content to train our own AI models.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. How We Share Your Information</h2>
            <p className="text-muted-foreground mb-2">We share information only with third-party service providers ("processors") that help us operate the Service, and only to the extent necessary to provide it. These include:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>AI processing providers</strong> (e.g., OpenAI) to generate resume analysis, career suggestions, interview transcription and critique, and other AI outputs. Your relevant inputs (such as resume text or recordings) are transmitted to these providers to produce the results you request.</li>
              <li><strong>Email delivery providers</strong> (e.g., Resend) to send transactional and contact-related emails.</li>
              <li><strong>Search providers</strong> (e.g., our self-hosted search service) to surface networking events and communities.</li>
              <li><strong>Hosting and infrastructure providers</strong> to run the Service and store data.</li>
            </ul>
            <p className="text-muted-foreground mt-3">These providers are permitted to use your information only to perform services for us. We may also disclose information if required by law, to comply with legal process, or to protect the rights, safety, or property of Pathwise, our users, or others.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. Legal Bases for Processing (EU/EEA/UK Users)</h2>
            <p className="text-muted-foreground mb-2">If you are in the European Economic Area or the United Kingdom, we process your personal data on the following legal bases:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Performance of a contract:</strong> to provide the Service you request.</li>
              <li><strong>Consent:</strong> where you have given it (for example, by submitting a resume or recording for analysis). You may withdraw consent at any time.</li>
              <li><strong>Legitimate interests:</strong> to secure and improve the operation of the Service, where those interests are not overridden by your rights.</li>
              <li><strong>Legal obligation:</strong> where processing is required to comply with applicable law.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. Data Retention</h2>
            <p className="text-muted-foreground">We currently retain your account information and User Content for as long as we operate the Service, including after account deletion, unless you request deletion of your data (see "Your Rights" below).</p>
            <p className="text-muted-foreground mt-2">You may request deletion of your personal data at any time by contacting us at <a href="mailto:contact@pathwise.nyc" className="text-primary underline underline-offset-2">contact@pathwise.nyc</a>, and we will delete it except where we are required to retain it by law.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Your Privacy Rights</h2>
            <p className="text-muted-foreground mb-2">Depending on where you live, you may have some or all of the following rights regarding your personal information:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> request a copy of the personal data we hold about you.</li>
              <li><strong>Correction:</strong> request that we correct inaccurate or incomplete data.</li>
              <li><strong>Deletion:</strong> request that we delete your personal data.</li>
              <li><strong>Portability:</strong> request your data in a portable format.</li>
              <li><strong>Restriction/Objection:</strong> request that we limit or stop certain processing.</li>
              <li><strong>Withdraw consent:</strong> withdraw consent where processing is based on it.</li>
            </ul>
            <p className="text-muted-foreground mt-3">EU/EEA/UK users have these rights under the GDPR and may also lodge a complaint with their local data protection authority.</p>
            <p className="text-muted-foreground mt-2">California residents have rights under the CCPA/CPRA, including the right to know, delete, and correct personal information, and the right not to be discriminated against for exercising those rights. We do not sell or "share" personal information as those terms are defined under California law.</p>
            <p className="text-muted-foreground mt-2">To exercise any right, contact us at <a href="mailto:contact@pathwise.nyc" className="text-primary underline underline-offset-2">contact@pathwise.nyc</a>. We will respond within the timeframe required by applicable law and may need to verify your identity first.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. International Data Transfers</h2>
            <p className="text-muted-foreground">Pathwise is operated from the United States, and our service providers may process data in the United States and other countries. If you access the Service from outside the United States, you understand that your information will be transferred to, stored, and processed in the United States, where data protection laws may differ from those in your country. Where required, we rely on appropriate safeguards (such as standard contractual clauses) for international transfers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Data Security</h2>
            <p className="text-muted-foreground">We use reasonable technical and organizational measures to protect your personal information, including encryption of passwords and secure transmission. However, no method of transmission or storage is completely secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Cookies and Local Storage</h2>
            <p className="text-muted-foreground">We use only essential cookies and browser local storage needed to operate the Service, such as keeping you signed in and storing your session and conversation history locally in your browser. We do not use advertising or third-party tracking cookies. You can control cookies through your browser settings, but disabling essential cookies may prevent the Service from working properly.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">11. Children's Privacy</h2>
            <p className="text-muted-foreground">The Service is not intended for individuals under 16 years of age (or the applicable age of digital consent in your jurisdiction). We do not knowingly collect personal information from children under that age. If you believe a child has provided us personal information, contact us and we will delete it.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">12. Third-Party Links</h2>
            <p className="text-muted-foreground">The Service may link to third-party websites, events, groups, and communities that we do not control. This Privacy Policy does not apply to those third parties, and we are not responsible for their privacy practices. We encourage you to review their policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">13. Changes to This Privacy Policy</h2>
            <p className="text-muted-foreground">We may update this Privacy Policy from time to time. If we make material changes, we will update the "Last updated" date and, where appropriate, provide additional notice. Your continued use of the Service after changes take effect constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">14. Contact Us</h2>
            <p className="text-muted-foreground">If you have questions or requests regarding this Privacy Policy or your personal information, contact us at:</p>
            <p className="text-muted-foreground mt-2">Pathwise NYC<br /><a href="mailto:contact@pathwise.nyc" className="text-primary underline underline-offset-2">contact@pathwise.nyc</a></p>
          </section>

        </div>
      </div>
    </div>
  );
}
