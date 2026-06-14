import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => window.history.back()} className="mb-6" data-testid="button-back">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <h1 className="text-3xl font-bold mb-1" data-testid="title-terms">Pathwise Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: June 14, 2026</p>

        <div className="space-y-8 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-semibold mb-2">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">These Terms of Service ("Terms") are a binding agreement between you and Pathwise NYC ("Pathwise," "we," "us," or "our"), governing your access to and use of the Pathwise website, applications, and services (collectively, the "Service"), available at pathwise.nyc and related domains.</p>
            <p className="text-muted-foreground mt-2">By accessing or using the Service, you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">2. Eligibility</h2>
            <p className="text-muted-foreground">You must be at least 16 years old (or the age of digital consent in your jurisdiction, if higher) to use the Service. By using the Service, you represent that you meet this requirement and that you have the legal capacity to enter into these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">3. Description of the Service</h2>
            <p className="text-muted-foreground">Pathwise provides career-development tools, including AI-assisted resume analysis, job-match analysis, career matching, networking recommendations, mock interview practice, document conversion, and related features. The Service is provided free of charge.</p>
            <p className="text-muted-foreground mt-2">We may modify, suspend, or discontinue any part of the Service at any time without notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">4. AI-Generated Content and No Professional Advice</h2>
            <p className="text-muted-foreground font-medium mb-2">This section is important. Please read it carefully.</p>
            <p className="text-muted-foreground mb-3">The Service uses artificial intelligence to generate content, including but not limited to resume scores, career suggestions, salary-negotiation guidance, interview critiques, and skill assessments ("AI Output").</p>
            <p className="text-muted-foreground mb-2">You acknowledge and agree that:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>AI Output is generated automatically and may be inaccurate, incomplete, outdated, or otherwise unreliable.</li>
              <li>AI Output does not constitute professional career counseling, legal advice, financial advice, or any other form of professional advice.</li>
              <li>Salary, negotiation, and compensation-related information is provided for general informational purposes only and is not a guarantee of any outcome. You are solely responsible for any decisions you make based on it.</li>
              <li>Recommendations, links, events, and communities surfaced by the Service are provided "as is," may be third-party content we do not control, and may be inaccurate or no longer available.</li>
              <li>You should independently verify any information before relying on it and consult a qualified professional where appropriate.</li>
            </ul>
            <p className="text-muted-foreground mt-3">We make no representations or warranties about the accuracy or usefulness of any AI Output, and we are not responsible for decisions you make based on it.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">5. User Accounts</h2>
            <p className="text-muted-foreground mb-2">To access certain features, you may create an account. You agree to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate and complete information.</li>
              <li>Keep your login credentials secure and confidential.</li>
              <li>Be responsible for all activity that occurs under your account.</li>
              <li>Notify us promptly of any unauthorized use.</li>
            </ul>
            <p className="text-muted-foreground mt-3">You may register using an email and password or through third-party sign-in (e.g., Google). We are not responsible for the practices of third-party authentication providers.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">6. User Content</h2>
            <p className="text-muted-foreground">"User Content" means anything you upload, submit, or input, including resumes, CVs, messages, recordings, and other materials.</p>
            <p className="text-muted-foreground mt-2">You retain ownership of your User Content. By submitting it, you grant us a limited, non-exclusive, worldwide, royalty-free license to use, store, process, and transmit it solely for the purpose of operating and providing the Service to you (including processing it through the third-party services described in Section 7).</p>
            <p className="text-muted-foreground mt-2">You represent that you have the right to submit your User Content and that it does not violate any law or third-party right. You are solely responsible for your User Content.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">7. Third-Party Services</h2>
            <p className="text-muted-foreground">The Service relies on third-party providers to function, including but not limited to AI processing, email delivery, search, and hosting providers. To provide the Service, your User Content (including resume text and other inputs) may be transmitted to and processed by these third parties.</p>
            <p className="text-muted-foreground mt-2">We are not responsible for the availability, accuracy, content, or practices of third-party services, websites, or resources that the Service links to or relies upon. Your use of third-party services may be subject to their own terms and privacy policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">8. Acceptable Use</h2>
            <p className="text-muted-foreground mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the Service for any unlawful, fraudulent, or harmful purpose.</li>
              <li>Upload content that is illegal, infringing, defamatory, or that contains another person's private information without authorization.</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or our systems.</li>
              <li>Reverse-engineer, scrape, or misuse the Service or its underlying systems.</li>
              <li>Interfere with or disrupt the Service, including by transmitting malware or overloading our infrastructure.</li>
              <li>Use the Service to develop a competing product.</li>
            </ul>
            <p className="text-muted-foreground mt-3">We may suspend or terminate access for violations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">9. Intellectual Property</h2>
            <p className="text-muted-foreground">The Service, including its software, design, text, and branding (excluding your User Content), is owned by Pathwise NYC and protected by intellectual-property laws. We grant you a limited, non-exclusive, non-transferable, revocable license to use the Service for its intended purpose. No other rights are granted.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">10. Privacy</h2>
            <p className="text-muted-foreground">Your use of the Service is also governed by our <a href="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</a>, which explains how we collect, use, and share your information. By using the Service, you consent to those practices.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">11. Disclaimer of Warranties</h2>
            <p className="text-muted-foreground uppercase text-xs leading-relaxed">THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT.</p>
            <p className="text-muted-foreground uppercase text-xs leading-relaxed mt-2">WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, ERROR-FREE, OR THAT ANY OUTPUT WILL BE ACCURATE OR RELIABLE.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">12. Limitation of Liability</h2>
            <p className="text-muted-foreground uppercase text-xs leading-relaxed">TO THE MAXIMUM EXTENT PERMITTED BY LAW, PATHWISE NYC AND ITS OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF DATA, OPPORTUNITIES, OR PROFITS, ARISING FROM YOUR USE OF (OR INABILITY TO USE) THE SERVICE.</p>
            <p className="text-muted-foreground uppercase text-xs leading-relaxed mt-2">BECAUSE THE SERVICE IS PROVIDED FREE OF CHARGE, OUR TOTAL AGGREGATE LIABILITY FOR ANY CLAIM ARISING FROM THESE TERMS OR THE SERVICE WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS ($100).</p>
            <p className="text-muted-foreground mt-2">Some jurisdictions do not allow certain limitations, so some of the above may not apply to you.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">13. Indemnification</h2>
            <p className="text-muted-foreground">You agree to indemnify and hold harmless Pathwise NYC from any claims, damages, or expenses (including reasonable legal fees) arising from your User Content, your use of the Service, or your violation of these Terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">14. Termination</h2>
            <p className="text-muted-foreground">You may stop using the Service and delete your account at any time. We may suspend or terminate your access at any time, with or without cause. Upon termination, the provisions that by their nature should survive (including Sections 4, 6, 9, 11, 12, and 13) will survive.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">15. International Users</h2>
            <p className="text-muted-foreground">The Service is operated from the United States. If you access it from outside the U.S., you do so on your own initiative and are responsible for compliance with local laws. We make no representation that the Service is appropriate or available in all locations.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">16. Changes to These Terms</h2>
            <p className="text-muted-foreground">We may update these Terms from time to time. If we make material changes, we will update the "Last updated" date and, where appropriate, provide additional notice. Your continued use of the Service after changes take effect constitutes acceptance.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">17. Governing Law and Dispute Resolution</h2>
            <p className="text-muted-foreground">These Terms are governed by the laws of the State of New York, without regard to its conflict-of-laws principles. Any dispute will be resolved in the state or federal courts located in New York County, New York, and you consent to their jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">18. Contact</h2>
            <p className="text-muted-foreground">Questions about these Terms? Contact us at <a href="mailto:contact@pathwise.nyc" className="text-primary underline underline-offset-2">contact@pathwise.nyc</a>.</p>
          </section>

        </div>
      </div>
    </div>
  );
}
