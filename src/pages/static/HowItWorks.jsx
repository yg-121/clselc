import React from "react";
import StaticPageLayout from "../../components/layout/StaticPageLayout";
import { UserPlus, Search, MessageSquare, FileText, CheckCircle } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <UserPlus className="h-10 w-10 text-blue-600" />,
      title: "Create an Account",
      description: "Sign up as a client or lawyer to access our platform's features. The registration process is simple and secure."
    },
    {
      icon: <FileText className="h-10 w-10 text-blue-600" />,
      title: "Post Your Case (Clients)",
      description: "Describe your legal issue in detail. You can specify your budget and timeline requirements."
    },
    {
      icon: <Search className="h-10 w-10 text-blue-600" />,
      title: "Find the Right Lawyer",
      description: "Browse lawyer profiles or receive bids from interested lawyers. Review their qualifications, ratings, and experience."
    },
    {
      icon: <MessageSquare className="h-10 w-10 text-blue-600" />,
      title: "Communicate Directly",
      description: "Use our secure messaging system to discuss your case details, ask questions, and clarify expectations."
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-blue-600" />,
      title: "Finalize and Proceed",
      description: "Once you've found the right lawyer, you can accept their bid and begin working together on your legal matter."
    }
  ];

  return (
    <StaticPageLayout title="How It Works">
      <p className="text-lg text-gray-700 mb-8">
        LegalConnect Ethiopia simplifies the process of finding and working with legal professionals. Our platform is designed to be intuitive and user-friendly for both clients and lawyers.
      </p>
      
      <div className="space-y-12 mt-8">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 mr-6">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
                {step.icon}
              </div>
              <div className="h-full w-0.5 bg-blue-100 mx-auto mt-4 hidden md:block" 
                   style={{ display: index === steps.length - 1 ? 'none' : '' }}></div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {index + 1}. {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-blue-50 p-6 rounded-lg mt-12">
        <h3 className="text-xl font-semibold text-blue-800 mb-3">For Lawyers</h3>
        <p className="text-gray-700 mb-4">
          As a lawyer on our platform, you can browse available cases, submit bids, and grow your practice. Our system helps you connect with clients who need your specific expertise.
        </p>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-800">Browse Cases</h4>
              <p className="text-sm text-gray-600">Find cases that match your expertise and interests.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-800">Submit Bids</h4>
              <p className="text-sm text-gray-600">Propose your services and fees to potential clients.</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h4 className="text-md font-semibold text-gray-800">Communicate</h4>
              <p className="text-sm text-gray-600">Discuss details with clients through our secure messaging system.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Ready to Get Started?</h3>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/register?role=client" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Register as a Client
          </a>
          <a href="/register?role=lawyer" className="inline-block bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors">
            Register as a Lawyer
          </a>
        </div>
      </div>
    </StaticPageLayout>
  );
}
