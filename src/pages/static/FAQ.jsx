import React, { useState } from "react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "What is LegalConnect Ethiopia?",
      answer: "LegalConnect Ethiopia is an online platform that connects clients with legal professionals in Ethiopia. Our service makes it easy for individuals and businesses to find qualified lawyers for their specific legal needs."
    },
    {
      question: "How do I find a lawyer on your platform?",
      answer: "You can find a lawyer by posting your legal issue on our platform. Qualified lawyers will then submit bids to work on your case. Alternatively, you can browse lawyer profiles and directly contact those who match your requirements."
    },
    {
      question: "How much does it cost to use LegalConnect Ethiopia?",
      answer: "Creating an account and browsing lawyer profiles is free. Clients pay only when they hire a lawyer for their case. Lawyers pay a small commission fee on cases they win through our platform."
    },
    {
      question: "How are lawyers vetted on your platform?",
      answer: "All lawyers on our platform must provide proof of their legal credentials, including their license to practice law in Ethiopia. We verify their identity, qualifications, and professional standing before they can offer services through LegalConnect."
    },
    {
      question: "Is my information kept confidential?",
      answer: "Yes, we take confidentiality very seriously. Your personal information and case details are protected by our privacy policy. We use encryption and secure protocols to protect your data. Lawyer-client communications through our platform are private and secure."
    },
    {
      question: "What types of legal issues can I get help with?",
      answer: "Our platform covers a wide range of legal areas including family law, property law, business law, criminal defense, immigration, intellectual property, and more. If you're unsure whether your issue can be addressed, you can post a general inquiry."
    },
    {
      question: "How do payments work?",
      answer: "Payments are handled securely through our platform. Once you agree to work with a lawyer, you'll make payments based on the agreed terms. Funds are held in escrow until services are delivered, providing protection for both clients and lawyers."
    },
    {
      question: "What if I'm not satisfied with my lawyer?",
      answer: "If you're experiencing issues with your lawyer, we encourage you to first discuss your concerns directly with them. If the issues persist, you can contact our support team who will help mediate the situation. In certain circumstances, we may help you find a replacement lawyer."
    },
    {
      question: "Can I use LegalConnect Ethiopia if I'm outside Ethiopia?",
      answer: "Yes, you can use our platform from anywhere in the world if you need legal services related to Ethiopian law. Our lawyers are qualified to practice law in Ethiopia and can assist with matters under Ethiopian jurisdiction."
    },
    {
      question: "How do I become a lawyer on your platform?",
      answer: "To join as a lawyer, you need to create a professional account, submit your credentials for verification, complete your profile, and agree to our terms of service. Once approved, you can start bidding on cases and offering your services."
    }
  ];

  return (
    <StaticPageLayout title="Frequently Asked Questions">
      <p className="text-lg text-gray-700 mb-8">
        Find answers to common questions about LegalConnect Ethiopia and how our platform works for both clients and lawyers.
      </p>
      
      <div className="space-y-4 mt-8">
        {faqItems.map((item, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            <button
              className="w-full flex justify-between items-center p-4 text-left bg-white hover:bg-gray-50 transition-colors"
              onClick={() => toggleQuestion(index)}
            >
              <h3 className="text-lg font-medium text-gray-800">{item.question}</h3>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-blue-600" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>
            
            {openIndex === index && (
              <div className="p-4 bg-gray-50 border-t border-gray-200">
                <p className="text-gray-700">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg mt-12">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">Still Have Questions?</h3>
        <p className="text-gray-700 mb-4">
          If you couldn't find the answer you were looking for, please don't hesitate to reach out to our support team.
        </p>
        <a 
          href="/contact" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Contact Us
        </a>
      </div>
    </StaticPageLayout>
  );
}