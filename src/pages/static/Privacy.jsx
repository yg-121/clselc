import React from "react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";

export default function Privacy() {
  return (
    <StaticPageLayout title="Privacy Policy">
      <p className="text-gray-700 mb-6">
        Last updated: June 1, 2023
      </p>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Introduction</h2>
          <p className="text-gray-700">
            LegalConnect Ethiopia ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Information We Collect</h2>
          <p className="text-gray-700 mb-3">
            We collect information that you provide directly to us when you:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Register for an account</li>
            <li>Fill out a form</li>
            <li>Submit a case</li>
            <li>Communicate with other users</li>
            <li>Contact our customer support</li>
          </ul>
          <p className="text-gray-700 mt-3">
            The types of information we may collect include your name, email address, phone number, professional qualifications (for lawyers), case details, payment information, and any other information you choose to provide.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. How We Use Your Information</h2>
          <p className="text-gray-700 mb-3">
            We may use the information we collect for various purposes, including to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide, maintain, and improve our platform</li>
            <li>Process transactions and send related information</li>
            <li>Connect clients with appropriate legal professionals</li>
            <li>Send administrative messages, updates, and security alerts</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our platform</li>
            <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
            <li>Personalize and improve your experience</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. Sharing of Information</h2>
          <p className="text-gray-700 mb-3">
            We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Between Users:</strong> When clients post cases and lawyers submit bids, certain information is shared between the parties to facilitate the connection.</li>
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors, service providers, and other third parties who perform services on our behalf.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in response to valid requests by public authorities.</li>
            <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Data Security</h2>
          <p className="text-gray-700">
            We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. Although we will do our best to protect your personal information, transmission of personal information to and from our platform is at your own risk.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. Your Rights</h2>
          <p className="text-gray-700 mb-3">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>The right to access personal information we hold about you</li>
            <li>The right to request correction of inaccurate personal information</li>
            <li>The right to request deletion of your personal information</li>
            <li>The right to object to processing of your personal information</li>
            <li>The right to data portability</li>
          </ul>
          <p className="text-gray-700 mt-3">
            To exercise these rights, please contact us using the information provided in the "Contact Us" section.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Changes to This Privacy Policy</h2>
          <p className="text-gray-700">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date at the top of this Privacy Policy. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Cookies and Tracking Technologies</h2>
          <p className="text-gray-700 mb-3">
            We use cookies and similar tracking technologies to track activity on our platform and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Cookies are sent to your browser from a website and stored on your device.
          </p>
          <p className="text-gray-700">
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our platform.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Children's Privacy</h2>
          <p className="text-gray-700">
            Our platform is not intended for use by children under the age of 18. We do not knowingly collect personally identifiable information from children under 18. If you are a parent or guardian and you are aware that your child has provided us with personal information, please contact us so that we can take necessary actions.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-3">
            <li>By email: privacy@legalconnect-ethiopia.com</li>
            <li>By phone: +251 911 234 567</li>
            <li>By mail: Bole Road, Friendship Building, 4th Floor, Office 405, Addis Ababa, Ethiopia</li>
          </ul>
        </section>
      </div>
    </StaticPageLayout>
  );
}
