import React from "react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";

export default function Terms() {
  return (
    <StaticPageLayout title="Terms of Service">
      <p className="text-gray-700 mb-6">
        Last updated: June 1, 2023
      </p>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">1. Introduction</h2>
          <p className="text-gray-700">
            Welcome to LegalConnect Ethiopia. These Terms of Service govern your use of our website and services. By accessing or using our platform, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">2. Definitions</h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li><strong>Platform:</strong> The LegalConnect Ethiopia website and services.</li>
            <li><strong>User:</strong> Any individual who accesses or uses the Platform.</li>
            <li><strong>Client:</strong> A User who seeks legal services through the Platform.</li>
            <li><strong>Lawyer:</strong> A legal professional who offers services through the Platform.</li>
            <li><strong>Content:</strong> All information, text, graphics, and materials uploaded or provided by Users.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">3. Account Registration</h2>
          <p className="text-gray-700 mb-3">
            To use certain features of the Platform, you must register for an account. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
          </p>
          <p className="text-gray-700">
            You are responsible for safeguarding the password that you use to access the Platform and for any activities or actions under your password. We encourage you to use "strong" passwords (passwords that use a combination of upper and lower case letters, numbers, and symbols) with your account.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">4. User Conduct</h2>
          <p className="text-gray-700 mb-3">
            You agree not to use the Platform:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>In any way that violates any applicable federal, state, local, or international law or regulation.</li>
            <li>To transmit, or procure the sending of, any advertising or promotional material, including any "junk mail," "chain letter," "spam," or any other similar solicitation.</li>
            <li>To impersonate or attempt to impersonate LegalConnect Ethiopia, a LegalConnect Ethiopia employee, another user, or any other person or entity.</li>
            <li>To engage in any other conduct that restricts or inhibits anyone's use or enjoyment of the Platform, or which may harm LegalConnect Ethiopia or users of the Platform.</li>
          </ul>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">5. Intellectual Property</h2>
          <p className="text-gray-700">
            The Platform and its original content, features, and functionality are and will remain the exclusive property of LegalConnect Ethiopia and its licensors. The Platform is protected by copyright, trademark, and other laws of both Ethiopia and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of LegalConnect Ethiopia.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">6. User Content</h2>
          <p className="text-gray-700">
            You retain all rights to any content you submit, post, or display on or through the Platform. By submitting, posting, or displaying content on or through the Platform, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, perform, and display such content in connection with providing the Platform.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">7. Termination</h2>
          <p className="text-gray-700">
            We may terminate or suspend your account and bar access to the Platform immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">8. Limitation of Liability</h2>
          <p className="text-gray-700">
            In no event shall LegalConnect Ethiopia, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Platform.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">9. Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
          </p>
        </section>
        
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-3">10. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms, please contact us at support@legalconnect-ethiopia.com.
          </p>
        </section>
      </div>
    </StaticPageLayout>
  );
}